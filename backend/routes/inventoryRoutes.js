// Import Express to create router
const express = require("express");
const router = express.Router();

// ========== IMPORT CONTROLLER FUNCTIONS ==========
// Import all inventory controller functions
const {
    createInventory,
    getAllInventory,
    getInventoryById,
    updateInventory,
    deleteInventory,
    updateStock,
    getLowStockItems,
    getOutOfStockItems,
    getInventoryByCategory
} = require("../controllers/inventoryController");

// ========== IMPORT MIDDLEWARE ==========
// Authentication middleware - verifies user is logged in
const protect = require("../middleware/authMiddleware");

// Role-based middleware - checks if user has admin privileges
const { restrictTo } = require("../middleware/roleMiddleware");

// Validation middleware - validates request body against Joi schemas
const validate = require("../middleware/validate");

// ========== IMPORT VALIDATION SCHEMAS ==========
// Import Joi validation schemas for inventory operations
const {
    createInventorySchema,
    updateInventorySchema,
    updateStockSchema,
    searchInventorySchema
} = require("../controllers/validation/inventoryValidation");

// ========== SPECIAL ROUTES (Must be defined BEFORE parameterized routes) ==========

// GET /api/inventory/low-stock
router.get("/low-stock", getLowStockItems);

// GET /api/inventory/out-of-stock
router.get("/out-of-stock", getOutOfStockItems);

// GET /api/inventory/category/:category
router.get("/category/:category", getInventoryByCategory);

// ========== MAIN CRUD ROUTES ==========

// POST /api/inventory
// Purpose: Create a new inventory item
// Access: Protected + Admin only
// Middleware: Authentication → Admin check → Validation → Controller
router.post(
    "/",
    protect,                                    // Check if user is logged in
    restrictTo("admin"),                        // Check if user is admin
    validate(createInventorySchema),            // Validate request body
    createInventory                             // Execute controller function
);

// GET /api/inventory
router.get(
    "/",
    getAllInventory                             // Execute controller function
);

// GET /api/inventory/:id
router.get(
    "/:id",
    getInventoryById                            // Execute controller function
);

// PUT /api/inventory/:id
// Purpose: Update an inventory item (full or partial update)
// Access: Protected + Admin only
// Example: PUT /api/inventory/507f1f77bcf86cd799439011
router.put(
    "/:id",
    protect,                                    // Check if user is logged in
    restrictTo("admin"),                        // Check if user is admin
    validate(updateInventorySchema),            // Validate request body
    updateInventory                             // Execute controller function
);

// DELETE /api/inventory/:id
// Purpose: Soft delete an inventory item (mark as discontinued)
// Access: Protected + Admin only
// Example: DELETE /api/inventory/507f1f77bcf86cd799439011
router.delete(
    "/:id",
    protect,                                    // Check if user is logged in
    restrictTo("admin"),                        // Check if user is admin
    deleteInventory                             // Execute controller function
);

// ========== STOCK MANAGEMENT ROUTE ==========

// PATCH /api/inventory/:id/stock
// Purpose: Update stock quantity (add, remove, or set)
// Access: Protected (any authenticated user)
// Body: { adjustmentType: "add", quantity: 50, reason: "New shipment received" }
// Example: PATCH /api/inventory/507f1f77bcf86cd799439011/stock
router.patch(
    "/:id/stock",
    protect,                                    // Check if user is logged in
    validate(updateStockSchema),                // Validate request body
    updateStock                                 // Execute controller function
);

// ========== EXPORT ROUTER ==========
// Export the router to be used in app.js
module.exports = router;
