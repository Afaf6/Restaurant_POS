// ========== API CONFIGURATION ==========
// Base URL for API endpoints
export const API_BASE_URL = "http://localhost:4000/api";

// ========== INVENTORY CATEGORIES ==========
export const INVENTORY_CATEGORIES = [
    "Bread",
    "Vegetables",
    "Meat",
    "Cheese",
    "Pizzas",
    "Salads"
];

// ========== UNITS OF MEASUREMENT ==========
export const UNITS_OF_MEASUREMENT = [
    { value: "pieces", label: "Pieces" },
    { value: "slices", label: "Slices" }
];

// ========== INVENTORY STATUS ==========
// List of all possible inventory statuses
export const INVENTORY_STATUS = [
    { value: "active", label: "Active", color: "#28a745" },
    { value: "low stock", label: "Low Stock", color: "#ffc107" },
    { value: "out of stock", label: "Out of Stock", color: "#dc3545" },
    { value: "discontinued", label: "Discontinued", color: "#6c757d" }
];

// ========== STOCK ADJUSTMENT TYPES ==========
// Types of stock adjustments
export const ADJUSTMENT_TYPES = [
    { value: "add", label: "Add Stock" },
    { value: "remove", label: "Remove Stock" },
    { value: "set", label: "Set Exact Quantity" }
];

// ========== PAGINATION DEFAULTS ==========
// Default values for pagination
export const PAGINATION_DEFAULTS = {
    page: 1,
    limit: 10,
    maxLimit: 100
};

// ========== SORT OPTIONS ==========
// Available sorting options for inventory list
export const SORT_OPTIONS = [
    { value: "itemName", label: "Name" },
    { value: "sku", label: "SKU" },
    { value: "currentQuantity", label: "Quantity" },
    { value: "costPrice", label: "Cost Price" },
    { value: "sellingPrice", label: "Selling Price" },
    { value: "createdAt", label: "Date Created" },
    { value: "updatedAt", label: "Last Updated" }
];

// ========== SORT ORDER ==========
// Sort order options
export const SORT_ORDER = [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" }
];

// ========== STOCK STATUS THRESHOLDS ==========
// Thresholds for determining stock status
export const STOCK_THRESHOLDS = {
    lowStockPercentage: 20,  // Alert when stock is below 20% of minimum
    criticalStockPercentage: 10  // Critical alert when below 10%
};

// ========== DATE FORMATS ==========
// Standard date format for display
export const DATE_FORMAT = "YYYY-MM-DD";
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

// ========== CURRENCY ==========
// Currency symbol and format
export const CURRENCY = {
    symbol: "$",
    code: "USD",
    position: "before"  // "before" or "after" the amount
};
