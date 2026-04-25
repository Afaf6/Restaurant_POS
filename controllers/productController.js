const Product = require("../models/Product");
const {
    createProductSchema,
    updateProductSchema
} = require("../validations/productValidation");

const createProduct = async(req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({product});
    } catch(error) {
        res.status(400).json({msg: error.message});
    }
};

const getProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) return res.status(404).json({msg: "Product not found"});
        res.status(200).json({product});
    } catch(error) {
        res.status(500).json({msg: error.message});
    }
};

const getAllProducts = async(req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({products});
    } catch(error) {
        res.status(500).json({msg: error.message});
    }
};

const updateProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!product) return res.status(404).json({msg: "Product not found"});
        res.status(200).json({product});
    } catch(error) {
        res.status(400).json({msg: error.message});
    }
};

const deleteProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if(!product) return res.status(404).json({msg: "Product not found"});
        res.status(200).json({msg: "Product deleted successfully"});
    } catch(error) {
        res.status(400).json({msg: error.message});
    }
};

module.exports = {
    createProduct,
    getProduct,
    getAllProducts,
    updateProduct,
    deleteProduct
};