
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getData } = require("../controllers/Dashboard");
const { isSuperAdmin } = require("../middleware/roleMiddleware");

// Full dashboard — Super Admin only
router.get("/showDashboard", protect, isSuperAdmin, getData);

module.exports = router;