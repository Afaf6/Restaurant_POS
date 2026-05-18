// Import the Inventory model to interact with database
const Inventory = require("../models/inventoryModel");

// ========== CREATE INVENTORY ITEM ==========
// Purpose: Add a new inventory item to the database
// Route: POST /api/inventory
// Access: Admin only
const createInventory = async (req, res) => {
    try {
        // Extract data from request body
        const inventoryData = req.body;

        // Check if SKU already exists (must be unique)
        const existingSKU = await Inventory.findOne({ sku: inventoryData.sku });
        if (existingSKU) {
            return res.status(400).json({ 
                success: false, 
                message: "SKU already exists. Please use a unique SKU." 
            });
        }

        // Create new inventory item in database
        const newItem = await Inventory.create(inventoryData);

        // Send success response with created item
        res.status(201).json({
            success: true,
            message: "Inventory item created successfully",
            data: newItem
        });

    } catch (error) {
        // Handle any errors
        res.status(500).json({
            success: false,
            message: "Error creating inventory item",
            error: error.message
        });
    }
};

// ========== GET ALL INVENTORY ITEMS ==========
// Purpose: Retrieve all inventory items with pagination, filtering, and sorting
// Route: GET /api/inventory
// Access: Protected (authenticated users)
const getAllInventory = async (req, res) => {
    try {
        // Extract query parameters for filtering and pagination
        const { search, category, status, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        // Build filter object based on query parameters
        const filter = {};

        // Search by item name or SKU (case-insensitive)
        if (search) {
            filter.$or = [
                { itemName: { $regex: search, $options: "i" } },  // 'i' means case-insensitive
                { sku: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by category
        if (category) {
            filter.category = category;
        }

        // Filter by status
        if (status) {
            filter.status = status;
        }

        // Calculate pagination values
        const skip = (page - 1) * limit;  // How many items to skip
        const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };  // 1 = ascending, -1 = descending

        // Fetch items from database with filters, sorting, and pagination
        const items = await Inventory.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Count total items matching the filter (for pagination info)
        const totalItems = await Inventory.countDocuments(filter);

        // Calculate total pages
        const totalPages = Math.ceil(totalItems / limit);

        // Send response with items and pagination info
        res.status(200).json({
            success: true,
            data: items,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching inventory items",
            error: error.message
        });
    }
};

// ========== GET INVENTORY ITEM BY ID ==========
// Purpose: Retrieve a single inventory item by its ID
// Route: GET /api/inventory/:id
// Access: Protected
const getInventoryById = async (req, res) => {
    try {
        // Get item ID from URL parameters
        const { id } = req.params;

        // Find item by ID in database
        const item = await Inventory.findById(id);

        // Check if item exists
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found"
            });
        }

        // Send success response with item data
        res.status(200).json({
            success: true,
            data: item
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching inventory item",
            error: error.message
        });
    }
};

// ========== UPDATE INVENTORY ITEM ==========
// Purpose: Update an existing inventory item (full or partial update)
// Route: PUT /api/inventory/:id
// Access: Admin only
const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If SKU is being updated, check if new SKU already exists
        if (updateData.sku) {
            const existingSKU = await Inventory.findOne({ 
                sku: updateData.sku, 
                _id: { $ne: id }  // Exclude current item from check
            });
            
            if (existingSKU) {
                return res.status(400).json({
                    success: false,
                    message: "SKU already exists. Please use a unique SKU."
                });
            }
        }

        // Find item first
        const item = await Inventory.findById(id);

        // Check if item exists
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found"
            });
        }

        // Update fields manually
        Object.keys(updateData).forEach(key => {
            item[key] = updateData[key];
        });

        // Save the item (triggers pre-save hook for status calculation)
        const updatedItem = await item.save();

        res.status(200).json({
            success: true,
            message: "Inventory item updated successfully",
            data: updatedItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating inventory item",
            error: error.message
        });
    }
};

// ========== DELETE INVENTORY ITEM ==========
// Purpose: Soft delete an inventory item (mark as discontinued)
// Route: DELETE /api/inventory/:id
// Access: Admin only
const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;

        // Instead of deleting, mark as discontinued (soft delete)
        const deletedItem = await Inventory.findByIdAndUpdate(
            id,
            { status: "discontinued" },
            { new: true }
        );

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Inventory item marked as discontinued",
            data: deletedItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting inventory item",
            error: error.message
        });
    }
};

// ========== UPDATE STOCK QUANTITY ==========
// Purpose: Add, remove, or set stock quantity
// Route: PATCH /api/inventory/:id/stock
// Access: Protected
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { adjustmentType, quantity, reason } = req.body;

        // Find the inventory item
        const item = await Inventory.findById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Inventory item not found"
            });
        }

        // Store old quantity for logging
        const oldQuantity = item.currentQuantity;
        let newQuantity;

        // Perform stock adjustment based on type
        switch (adjustmentType) {
            case "add":
                // Add to current stock
                newQuantity = oldQuantity + quantity;
                break;
            
            case "remove":
                // Remove from current stock
                newQuantity = oldQuantity - quantity;
                
                // Prevent negative stock
                if (newQuantity < 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Cannot remove more stock than available"
                    });
                }
                break;
            
            case "set":
                // Set exact quantity
                newQuantity = quantity;
                break;
            
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid adjustment type"
                });
        }

        // Update the quantity
        item.currentQuantity = newQuantity;
        item.lastRestockedDate = new Date();
        
        // Save the item (this will trigger the pre-save middleware to update status)
        await item.save();

        res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            data: {
                item,
                adjustment: {
                    type: adjustmentType,
                    oldQuantity,
                    newQuantity,
                    difference: newQuantity - oldQuantity,
                    reason: reason || "No reason provided"
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating stock",
            error: error.message
        });
    }
};

// ========== GET LOW STOCK ITEMS ==========
// Purpose: Get all items where current quantity is below minimum stock level
// Route: GET /api/inventory/low-stock
// Access: Protected
const getLowStockItems = async (req, res) => {
    try {
        // Find items where currentQuantity < minimumStock and status is "low stock"
        const lowStockItems = await Inventory.find({
            status: "low stock"
        }).sort({ currentQuantity: 1 });  // Sort by quantity (lowest first)

        res.status(200).json({
            success: true,
            count: lowStockItems.length,
            data: lowStockItems
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching low stock items",
            error: error.message
        });
    }
};

// ========== GET OUT OF STOCK ITEMS ==========
// Purpose: Get all items with zero quantity
// Route: GET /api/inventory/out-of-stock
// Access: Protected
const getOutOfStockItems = async (req, res) => {
    try {
        // Find items where currentQuantity is 0
        const outOfStockItems = await Inventory.find({
            status: "out of stock"
        }).sort({ updatedAt: -1 });  // Sort by most recently updated

        res.status(200).json({
            success: true,
            count: outOfStockItems.length,
            data: outOfStockItems
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching out of stock items",
            error: error.message
        });
    }
};

// ========== GET INVENTORY BY CATEGORY ==========
// Purpose: Get all items in a specific category
// Route: GET /api/inventory/category/:category
// Access: Protected
const getInventoryByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        // Find all items in the specified category
        const items = await Inventory.find({ category }).sort({ itemName: 1 });

        res.status(200).json({
            success: true,
            category,
            count: items.length,
            data: items
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching items by category",
            error: error.message
        });
    }
};

// Export all controller functions
module.exports = {
    createInventory,
    getAllInventory,
    getInventoryById,
    updateInventory,
    deleteInventory,
    updateStock,
    getLowStockItems,
    getOutOfStockItems,
    getInventoryByCategory
};
