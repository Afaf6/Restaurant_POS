const express = require("express");
const router = express.Router();
const { createInventory, getAllInventory, getInventoryById, updateInventory, deleteInventory, updateStock, getLowStockItems, getOutOfStockItems, getInventoryByCategory } = require("../controllers/inventoryController");
const protect = require("../middleware/authMiddleware");
const { isAdminOrLeader } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const { createInventorySchema, updateInventorySchema, updateStockSchema } = require("../controllers/validation/inventoryValidation");

router.get("/low-stock", getLowStockItems);
router.get("/out-of-stock", getOutOfStockItems);
router.get("/category/:category", getInventoryByCategory);

// View inventory — Super Admin and Team Leader
router.get("/", protect, isAdminOrLeader, getAllInventory);
router.get("/:id", protect, isAdminOrLeader, getInventoryById);

// Manage inventory — Super Admin and Team Leader
router.post("/", protect, isAdminOrLeader, validate(createInventorySchema), createInventory);
router.put("/:id", protect, isAdminOrLeader, validate(updateInventorySchema), updateInventory);
router.delete("/:id", protect, isAdminOrLeader, deleteInventory);
router.patch("/:id/stock", protect, isAdminOrLeader, validate(updateStockSchema), updateStock);

module.exports = router;
