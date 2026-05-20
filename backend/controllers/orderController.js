/**
 * ORDER CONTROLLER
 * Handles transaction processing, stock deduction, and order history.
 */

const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Inventory = require('../models/inventoryModel');

/**
 * @desc    Process a new order and deduct stock from inventory
 * @route   POST /api/orders
 * @access  Protected
 * @logic   Uses MongoDB Transactions to ensure stock is only deducted if the order is saved successfully.
 */
const { incrementPromoUsage } = require('./promoController');

const createOrder = async (req, res) => {
    const { items, promoId, discount, promoCode } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ msg: 'No order items provided' });
    }

    const executeOrderCreation = async (useSession) => {
        let session = null;
        if (useSession) {
            try {
                session = await mongoose.startSession();
                session.startTransaction();
            } catch (err) {
                session = null;
            }
        }

        try {
            let totalPrice = 0;
            const finalItems = [];

            // Loop through each item in the order to validate availability
            for (const item of items) {
                // Populate ingredients to check inventory levels
                let productQuery = Product.findById(item.product).populate('ingredients.inventoryItem');
                if (session) productQuery = productQuery.session(session);
                
                const product = await productQuery;

                if (!product) {
                    throw new Error(`Product not found: ${item.product}`);
                }

                // --- INVENTORY DEDUCTION LOGIC ---
                if (product.ingredients && product.ingredients.length > 0) {
                    for (const ingredient of product.ingredients) {
                        const invId = ingredient.inventoryItem?._id || ingredient.inventoryItem;
                        
                        if (!invId) {
                            throw new Error(`Inventory reference missing for product: ${product.name}`);
                        }

                        let invQuery = Inventory.findById(invId);
                        if (session) invQuery = invQuery.session(session);
                        const inventoryItem = await invQuery;
                        
                        if (!inventoryItem) {
                            throw new Error(`Inventory item not found for ingredient in ${product.name}`);
                        }

                        const requiredQuantity = ingredient.quantity * item.quantity;
                        if (inventoryItem.currentQuantity < requiredQuantity) {
                            throw new Error(`Insufficient inventory for ${inventoryItem.itemName} (needed for ${product.name})`);
                        }

                        // Deduct required amount from inventory
                        inventoryItem.currentQuantity -= requiredQuantity;
                        await inventoryItem.save({ session });
                    }
                } else {
                    // FALLBACK: If no ingredients are defined, deduct directly from product stock
                    if (product.stock < item.quantity) {
                        throw new Error(`Insufficient stock for ${product.name}`);
                    }
                    product.stock -= item.quantity;
                    await product.save({ session });
                }

                // Calculate historical price and total
                const itemPrice = product.price * item.quantity;
                totalPrice += itemPrice;

                finalItems.push({
                    product: product._id,
                    quantity: item.quantity,
                    price: product.price 
                });
            }

            const appliedDiscount = discount || 0;
            const order = new Order({
                items: finalItems,
                totalPrice: Math.max(0, totalPrice - appliedDiscount),
                discount: appliedDiscount,
                promoCode: promoCode || null,
                cashier: req.auth._id
            });

            const createdOrder = await order.save({ session });

            if (session) {
                await session.commitTransaction();
                session.endSession();
            }

            // Increment promo usage if a promo was applied
            if (promoId) await incrementPromoUsage(promoId);

            return res.status(201).json(createdOrder);
        } catch (error) {
            // Rollback if we have an active session
            if (session) {
                try {
                    await session.abortTransaction();
                } catch (abortError) {
                    console.error("Failed to abort transaction:", abortError);
                }
                session.endSession();
            }
            throw error;
        }
    };

    try {
        // Try with transactions first (perfect for production / MongoDB Atlas replica sets)
        await executeOrderCreation(true);
    } catch (error) {
        const isTransactionError = 
            error.message.includes('Transaction numbers') || 
            error.message.includes('replica set') || 
            error.message.includes('sessions');

        if (isTransactionError) {
            console.warn("Transactions are not supported by this MongoDB configuration. Falling back to non-transactional execution...");
            try {
                // Retry in local standalone mode without database session/transactions
                await executeOrderCreation(false);
            } catch (fallbackError) {
                console.error("ORDER FALLBACK ERROR:", fallbackError);
                res.status(500).json({ 
                    msg: 'Order Processing Failed', 
                    error: fallbackError.message 
                });
            }
        } else {
            console.error("ORDER ERROR:", error);
            res.status(500).json({ 
                msg: 'Order Processing Failed', 
                error: error.message 
            });
        }
    }
};

/**
 * @desc    Retrieve order history
 * @route   GET /api/orders
 * @access  Protected
 */
const getOrders = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('items.product', 'name image emoji price') 
            .populate('cashier', 'userName email role')
            .sort({ createdAt: -1 }); // Newest orders first

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Update order status (e.g., mark as cancelled)
 * @route   PATCH /api/orders/:id/status
 * @access  Admin
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id).populate('items.product');

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // If transitioning to cancelled for the first time, restock ingredients
        if (status === 'cancelled' && order.status !== 'cancelled') {
            for (const item of order.items) {
                const product = await Product.findById(item.product._id).populate('ingredients.inventoryItem');
                if (product && product.ingredients && product.ingredients.length > 0) {
                    for (const ing of product.ingredients) {
                        const totalToRestock = ing.quantity * item.quantity;
                        await Inventory.findByIdAndUpdate(
                            ing.inventoryItem._id,
                            { $inc: { currentQuantity: totalToRestock } }
                        );
                    }
                }
            }
        }

        order.status = status;
        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus
};
