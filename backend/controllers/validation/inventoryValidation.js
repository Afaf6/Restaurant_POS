// Import Joi library for data validation
// Joi helps validate user input before saving to database
const Joi = require("joi");

// ========== CREATE INVENTORY SCHEMA ==========
// This schema validates data when creating a NEW inventory item
// All fields marked as required() must be provided
const createInventorySchema = Joi.object({
    
    // Item name validation
    itemName: Joi.string()
        .trim()                    // Remove extra spaces
        .min(2)                    // Minimum 2 characters
        .max(100)                  // Maximum 100 characters
        .required()                // This field is mandatory
        .messages({
            "string.empty": "Item name is required",
            "string.min": "Item name must be at least 2 characters",
            "string.max": "Item name cannot exceed 100 characters"
        }),

    // SKU validation with specific format (e.g., ABC-123, ITEM-001)
    sku: Joi.string()
        .trim()
        .uppercase()               // Convert to uppercase
        .pattern(/^[A-Z0-9-]+$/)   // Only letters, numbers, and hyphens allowed
        .min(3)
        .max(20)
        .required()
        .messages({
            "string.empty": "SKU is required",
            "string.pattern.base": "SKU must contain only uppercase letters, numbers, and hyphens",
            "string.min": "SKU must be at least 3 characters",
            "string.max": "SKU cannot exceed 20 characters"
        }),

    // Category validation
    category: Joi.string()
        .valid("Bread", "Vegetables", "Meat", "Cheese", "Pizzas", "Salads")
        .required()
        .messages({
            "any.only": "Category must be one of: Bread, Vegetables, Meat, Cheese, Pizzas, Salads",
            "string.empty": "Category is required"
        }),

    // Current quantity validation
    currentQuantity: Joi.number()
        .min(0)                    // Cannot be negative
        .required()
        .messages({
            "number.base": "Current quantity must be a number",
            "number.min": "Current quantity cannot be negative",
            "any.required": "Current quantity is required"
        }),

    // Minimum stock level validation
    minimumStock: Joi.number()
        .min(0)
        .required()
        .messages({
            "number.base": "Minimum stock must be a number",
            "number.min": "Minimum stock cannot be negative",
            "any.required": "Minimum stock is required"
        }),

    // Maximum stock level validation (optional)
    maximumStock: Joi.number()
        .min(Joi.ref("minimumStock"))  // Must be greater than or equal to minimum stock
        .optional()
        .messages({
            "number.base": "Maximum stock must be a number",
            "number.min": "Maximum stock must be greater than or equal to minimum stock"
        }),

    // Unit of measurement validation
    unit: Joi.string()
        .valid("pieces", "slices")
        .required()
        .messages({
            "any.only": "Unit must be one of: pieces, slices",
            "string.empty": "Unit is required"
        }),

    // Cost price validation
    costPrice: Joi.number()
        .min(0)
        .precision(2)              // Allow up to 2 decimal places
        .required()
        .messages({
            "number.base": "Cost price must be a number",
            "number.min": "Cost price cannot be negative",
            "any.required": "Cost price is required"
        }),

    // Selling price validation
    sellingPrice: Joi.number()
        .min(Joi.ref("costPrice"))  // Selling price should be >= cost price
        .precision(2)
        .required()
        .messages({
            "number.base": "Selling price must be a number",
            "number.min": "Selling price should be greater than or equal to cost price",
            "any.required": "Selling price is required"
        }),

    // Supplier information validation (optional nested object)
    supplier: Joi.object({
        name: Joi.string().trim().max(100).optional(),
        contact: Joi.string().trim().max(50).optional()
    }).optional(),

    // Expiry date validation (optional, must be a future date)
    expiryDate: Joi.date()
        .min("now")
        .optional()
        .messages({
            "date.base": "Expiry date must be a valid date",
            "date.min": "Expiry date must be in the future"
        }),

    // Last restocked date validation (optional)
    lastRestockedDate: Joi.date()
        .max("now")
        .optional()
        .messages({
            "date.base": "Last restocked date must be a valid date",
            "date.max": "Last restocked date cannot be in the future"
        }),

    // Status validation (optional, defaults to "active" in model)
    status: Joi.string()
        .valid("active", "low stock", "out of stock", "discontinued")
        .optional()
        .messages({
            "any.only": "Status must be one of: active, low stock, out of stock, discontinued"
        })
});

// ========== UPDATE INVENTORY SCHEMA ==========
// This schema validates data when UPDATING an existing inventory item
// All fields are optional (partial updates allowed)
const updateInventorySchema = Joi.object({
    
    itemName: Joi.string().trim().min(2).max(100).optional(),
    
    sku: Joi.string().trim().uppercase().pattern(/^[A-Z0-9-]+$/).min(3).max(20).optional(),
    
    category: Joi.string()
        .valid("Bread", "Vegetables", "Meat", "Cheese", "Pizzas", "Salads")
        .optional(),
    
    currentQuantity: Joi.number().min(0).optional(),
    
    minimumStock: Joi.number().min(0).optional(),
    
    maximumStock: Joi.number().min(0).optional(),
    
    unit: Joi.string()
        .valid("pieces", "slices")
        .optional(),
    
    costPrice: Joi.number().min(0).precision(2).optional(),
    
    sellingPrice: Joi.number().min(0).precision(2).optional(),
    
    expiryDate: Joi.date().optional(),
    
    status: Joi.string()
        .valid("active", "low stock", "out of stock", "discontinued")
        .optional()

}).min(1); // At least one field must be provided for update

// ========== UPDATE STOCK SCHEMA ==========
// This schema validates stock quantity adjustments
// Used for adding or removing stock
const updateStockSchema = Joi.object({
    
    // Type of stock adjustment
    adjustmentType: Joi.string()
        .valid("add", "remove", "set")  // add: increase stock, remove: decrease stock, set: set exact quantity
        .required()
        .messages({
            "any.only": "Adjustment type must be one of: add, remove, set",
            "string.empty": "Adjustment type is required"
        }),

    // Quantity to adjust
    quantity: Joi.number()
        .min(0)
        .required()
        .messages({
            "number.base": "Quantity must be a number",
            "number.min": "Quantity cannot be negative",
            "any.required": "Quantity is required"
        }),

    // Reason for adjustment (optional but recommended)
    reason: Joi.string()
        .trim()
        .max(200)
        .optional()
        .messages({
            "string.max": "Reason cannot exceed 200 characters"
        })
});

// ========== SEARCH/FILTER SCHEMA ==========
// This schema validates search and filter parameters
const searchInventorySchema = Joi.object({
    
    // Search by name or SKU
    search: Joi.string().trim().optional(),
    
    // Filter by category
    category: Joi.string()
        .valid("Bread", "Vegetables", "Meat", "Cheese", "Pizzas", "Salads")
        .optional(),
    
    // Filter by status
    status: Joi.string()
        .valid("active", "low stock", "out of stock", "discontinued")
        .optional(),
    
    // Pagination: page number
    page: Joi.number().min(1).optional().default(1),
    
    // Pagination: items per page
    limit: Joi.number().min(1).max(100).optional().default(10),
    
    // Sort field
    sortBy: Joi.string()
        .valid("itemName", "sku", "currentQuantity", "costPrice", "sellingPrice", "createdAt", "updatedAt")
        .optional()
        .default("createdAt"),
    
    // Sort order
    sortOrder: Joi.string()
        .valid("asc", "desc")
        .optional()
        .default("desc")
});

// Export all validation schemas
module.exports = {
    createInventorySchema,
    updateInventorySchema,
    updateStockSchema,
    searchInventorySchema
};
