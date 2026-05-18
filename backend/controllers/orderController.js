const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// 
    const createOrder = async (req, res) => {
    // Assuming validated items are in req.body.items
    const { items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ msg: 'No order items provided' });
    }

    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let totalPrice = 0;
        const finalItems = [];

        // Loop through the items to validate stock and calculate price
        for (const item of items) {
            // Query Product collection within the session
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ msg: `Product not found: ${item.product}` });
            }

            // Crucial Rule: Check current stock
            if (product.stock < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ msg: `Insufficient stock for ${product.name}` });
            }

            // Crucial Rule: Decrease stock count
            product.stock -= item.quantity;
            await product.save({ session });

            // Calculate item price and add to total
            const itemPrice = product.price * item.quantity;
            totalPrice += itemPrice;

            finalItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price // Save the price at the time of purchase
            });
        }

        // Save new order to database
        const order = new Order({
            items: finalItems,
            totalPrice,
            // Assuming the protect middleware attaches the authenticated user to req.auth
            cashier: req.auth._id 
        });

        const createdOrder = await order.save({ session });

        // Commit transaction if everything is successful
        await session.commitTransaction();
        session.endSession();

        res.status(201).json(createdOrder);
    } catch (error) {
        // Rollback all changes (like stock reduction) if any error occurs
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        // Consider adding query parameters for filtering (e.g., ?status=pending)
        const { status } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        // Fetch all orders and use .populate()
        const orders = await Order.find(query)
            .populate('items.product', 'name image price') // product details
            .populate('cashier', 'userName email role');   // cashier details

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Validated by updateStatusSchema

        // Find the order by ID
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Update its status field
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
