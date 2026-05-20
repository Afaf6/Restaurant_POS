/**
 * PRODUCT CONTROLLER
 * Handles all logic related to menu items, including CRUD and stock calculation.
 */

const Product = require("../models/productModel");
const Inventory = require("../models/inventoryModel");
const {
    createProductSchema,
    updateProductSchema
} = require("../controllers/validation/productValidation");

/**
 * @desc    Create a new menu product
 * @route   POST /api/products
 * @access  Admin
 */
const createProduct = async(req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            product
        });
    } catch(error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Get a single product by ID with calculated effective stock
 * @route   GET /api/products/:id
 * @access  Protected
 */
const getProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('ingredients.inventoryItem');
        if(!product) return res.status(404).json({ message: "Product not found" });
        
        // Calculate effective stock based on ingredient availability
        let effectiveStock = product.stock;
        if (product.ingredients && product.ingredients.length > 0) {
            const stocks = product.ingredients.map(ing => {
                // Return 0 if inventory item is missing, discontinued, or out of stock
                if (!ing.inventoryItem || ing.inventoryItem.status === "discontinued" || ing.inventoryItem.status === "out of stock") {
                    return 0;
                }
                return Math.floor(ing.inventoryItem.currentQuantity / ing.quantity);
            });
            // The limiting ingredient determines the total stock
            effectiveStock = Math.min(...stocks);
        }
        
        res.status(200).json({
            success: true,
            product: { ...product.toObject(), effectiveStock }
        });
    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Get all products with calculated effective stock for each
 * @route   GET /api/products
 * @access  Public (for POS)
 */
const getAllProducts = async(req, res) => {
    try {
        const products = await Product.find().populate('ingredients.inventoryItem');
        
        // Map through products to calculate stock for each based on inventory
        const productsWithStock = products.map(product => {
            let effectiveStock = product.stock;
            if (product.ingredients && product.ingredients.length > 0) {
                const stocks = product.ingredients.map(ing => {
                    if (!ing.inventoryItem || ing.inventoryItem.status === "discontinued" || ing.inventoryItem.status === "out of stock") {
                        return 0;
                    }
                    return Math.floor(ing.inventoryItem.currentQuantity / ing.quantity);
                });
                effectiveStock = Math.min(...stocks);
            }
            return { ...product.toObject(), effectiveStock };
        });

        res.status(200).json({
            success: true,
            products: productsWithStock
        });
    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Update a product by ID
 * @route   PUT /api/products/:id
 * @access  Admin
 */
const updateProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({
            success: true,
            product
        });
    } catch(error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Delete a product by ID
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
const deleteProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if(!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch(error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createProduct,
    getProduct,
    getAllProducts,
    updateProduct,
    deleteProduct
};