const Promo = require("../models/promoModel");

// GET all promos — Super Admin only
const getAllPromos = async (req, res) => {
    try {
        const promos = await Promo.find().populate("createdBy", "userName").sort({ createdAt: -1 });
        res.json(promos);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// POST create promo — Super Admin only
const createPromo = async (req, res) => {
    try {
        const { code, description, discountType, discountValue, minOrderAmount, maxUses, expiryDate, isActive } = req.body;

        if (!code || !discountType || discountValue === undefined) {
            return res.status(400).json({ msg: "code, discountType and discountValue are required" });
        }

        const exists = await Promo.findOne({ code: code.toUpperCase() });
        if (exists) return res.status(400).json({ msg: "Promo code already exists" });

        const promo = await Promo.create({
            code,
            description,
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxUses: maxUses || null,
            expiryDate: expiryDate || null,
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.auth._id
        });

        res.status(201).json(promo);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// PUT update promo — Super Admin only
const updatePromo = async (req, res) => {
    try {
        const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!promo) return res.status(404).json({ msg: "Promo not found" });
        res.json(promo);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// DELETE promo — Super Admin only
const deletePromo = async (req, res) => {
    try {
        const promo = await Promo.findByIdAndDelete(req.params.id);
        if (!promo) return res.status(404).json({ msg: "Promo not found" });
        res.json({ msg: "Promo deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// POST validate promo — all authenticated users (cashiers use this at POS)
const validatePromo = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        const promo = await Promo.findOne({ code: code.toUpperCase() });

        if (!promo)           return res.status(404).json({ msg: "Invalid promo code" });
        if (!promo.isActive)  return res.status(400).json({ msg: "This promo code is inactive" });
        if (promo.expiryDate && new Date() > new Date(promo.expiryDate))
                              return res.status(400).json({ msg: "This promo code has expired" });
        if (promo.maxUses !== null && promo.usedCount >= promo.maxUses)
                              return res.status(400).json({ msg: "This promo code has reached its usage limit" });
        if (orderAmount < promo.minOrderAmount)
                              return res.status(400).json({ msg: `Minimum order amount is $${promo.minOrderAmount.toFixed(2)}` });

        const discount = promo.discountType === "percentage"
            ? (orderAmount * promo.discountValue) / 100
            : promo.discountValue;

        res.json({
            valid: true,
            promoId: promo._id,
            code: promo.code,
            description: promo.description,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            discount: Math.min(discount, orderAmount) // can't discount more than order total
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Called after successful order to increment usedCount
const incrementPromoUsage = async (promoId) => {
    if (!promoId) return;
    await Promo.findByIdAndUpdate(promoId, { $inc: { usedCount: 1 } });
};

module.exports = { getAllPromos, createPromo, updatePromo, deletePromo, validatePromo, incrementPromoUsage };
