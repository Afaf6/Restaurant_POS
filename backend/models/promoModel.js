const mongoose = require("mongoose");

const promoSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    discountType: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    maxUses: {
        type: Number,
        default: null  // null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    expiryDate: {
        type: Date,
        default: null  // null = never expires
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth"
    }
}, { timestamps: true });

module.exports = mongoose.model("Promo", promoSchema);
