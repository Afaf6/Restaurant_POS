const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type:String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending"
    },
    cashier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth"
    },
    tableNumber: {
        type: String,
        default: null
    },
    customerName:{
        type: String,
        default: "Customer"
    }
}, {timestamps: true});

module.exports = mongoose.model("Order", orderSchema);