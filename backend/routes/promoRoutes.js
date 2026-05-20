const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { isSuperAdmin, isAuthenticated } = require("../middleware/roleMiddleware");
const { getAllPromos, createPromo, updatePromo, deletePromo, validatePromo } = require("../controllers/promoController");

// Validate promo — any logged-in user (cashiers at POS)
router.post("/validate", protect, validatePromo);

// Manage promos — Super Admin only
router.get("/", protect, isSuperAdmin, getAllPromos);
router.post("/", protect, isSuperAdmin, createPromo);
router.put("/:id", protect, isSuperAdmin, updatePromo);
router.delete("/:id", protect, isSuperAdmin, deletePromo);

module.exports = router;
