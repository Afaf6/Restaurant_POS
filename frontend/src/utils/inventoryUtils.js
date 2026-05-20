// Import constants
import { CURRENCY, INVENTORY_STATUS } from "../config/constants";

// ========== FORMAT CURRENCY ==========
// Purpose: Format a number as currency
// Parameters: amount (number) - the amount to format
// Returns: Formatted currency string (e.g., "$10.50")
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return `${CURRENCY.symbol}0.00`;
    
    const formatted = parseFloat(amount).toFixed(2);
    
    return CURRENCY.position === "before" 
        ? `${CURRENCY.symbol}${formatted}` 
        : `${formatted}${CURRENCY.symbol}`;
};

// ========== FORMAT DATE ==========
// Purpose: Format a date string to readable format
// Parameters: dateString (string) - ISO date string
// Returns: Formatted date string (e.g., "Jan 15, 2024")
export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" };
    
    return date.toLocaleDateString("en-US", options);
};

// ========== FORMAT DATE TIME ==========
// Purpose: Format a date string to include time
// Parameters: dateString (string) - ISO date string
// Returns: Formatted date and time string (e.g., "Jan 15, 2024 10:30 AM")
export const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const options = { 
        year: "numeric", 
        month: "short", 
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };
    
    return date.toLocaleDateString("en-US", options);
};

// ========== CALCULATE STOCK STATUS ==========
// Purpose: Determine stock status based on quantity and thresholds
// Parameters: currentQuantity, minimumStock
// Returns: Status object with value, label, and color
export const calculateStockStatus = (currentQuantity, minimumStock) => {
    if (currentQuantity === 0) {
        return INVENTORY_STATUS.find(s => s.value === "out of stock");
    } else if (currentQuantity < minimumStock) {
        return INVENTORY_STATUS.find(s => s.value === "low stock");
    } else {
        return INVENTORY_STATUS.find(s => s.value === "active");
    }
};

// ========== CALCULATE STOCK VALUE ==========
// Purpose: Calculate total value of stock (quantity × cost price)
// Parameters: quantity (number), costPrice (number)
// Returns: Total stock value as number
export const calculateStockValue = (quantity, costPrice) => {
    return (quantity * costPrice).toFixed(2);
};

// ========== CALCULATE PROFIT MARGIN ==========
// Purpose: Calculate profit margin percentage
// Parameters: costPrice (number), sellingPrice (number)
// Returns: Profit margin percentage as string
export const calculateProfitMargin = (costPrice, sellingPrice) => {
    if (sellingPrice === 0) return "0.00";
    const margin = ((sellingPrice - costPrice) / sellingPrice) * 100;
    return margin.toFixed(2);
};

// ========== CHECK IF EXPIRING SOON ==========
// Purpose: Check if item expires within 7 days
// Parameters: expiryDate (string) - ISO date string
// Returns: Boolean - true if expiring soon
export const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const sevenDaysFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    return expiry <= sevenDaysFromNow && expiry >= today;
};

// ========== CHECK IF EXPIRED ==========
// Purpose: Check if item has expired
// Parameters: expiryDate (string) - ISO date string
// Returns: Boolean - true if expired
export const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    return expiry < today;
};

// ========== GET STATUS COLOR ==========
// Purpose: Get color code for a status
// Parameters: status (string) - status value
// Returns: Color hex code
export const getStatusColor = (status) => {
    const statusObj = INVENTORY_STATUS.find(s => s.value === status);
    return statusObj ? statusObj.color : "#6c757d";
};

// ========== EXPORT TO CSV ==========
// Purpose: Convert inventory data to CSV and download
// Parameters: data (array) - array of inventory items, filename (string)
// Returns: void (triggers download)
export const exportToCSV = (data, filename = "inventory.csv") => {
    if (!data || data.length === 0) {
        alert("No data to export");
        return;
    }

    // Define CSV headers
    const headers = [
        "Item Name",
        "SKU",
        "Category",
        "Current Quantity",
        "Unit",
        "Minimum Stock",
        "Cost Price",
        "Selling Price",
        "Status",
        "Supplier Name",
        "Expiry Date"
    ];

    // Convert data to CSV rows
    const csvRows = [
        headers.join(","),  // Header row
        ...data.map(item => [
            `"${item.itemName}"`,
            `"${item.sku}"`,
            `"${item.category}"`,
            item.currentQuantity,
            `"${item.unit}"`,
            item.minimumStock,
            item.costPrice,
            item.sellingPrice,
            `"${item.status}"`,
            `"${item.supplier?.name || 'N/A'}"`,
            item.expiryDate ? formatDate(item.expiryDate) : "N/A"
        ].join(","))
    ];

    // Create CSV content
    const csvContent = csvRows.join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
};

// ========== SORT INVENTORY ==========
// Purpose: Sort inventory array by specified field
// Parameters: data (array), sortBy (string), sortOrder (string)
// Returns: Sorted array
export const sortInventory = (data, sortBy, sortOrder = "asc") => {
    if (!data || data.length === 0) return [];

    return [...data].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle string comparison
        if (typeof aValue === "string") {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (sortOrder === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
};

// ========== FILTER INVENTORY ==========
// Purpose: Filter inventory by multiple criteria
// Parameters: data (array), filters (object)
// Returns: Filtered array
export const filterInventory = (data, filters) => {
    if (!data || data.length === 0) return [];

    return data.filter(item => {
        // Filter by search term (name or SKU)
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = 
                item.itemName.toLowerCase().includes(searchLower) ||
                item.sku.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
        }

        // Filter by category
        if (filters.category && item.category !== filters.category) {
            return false;
        }

        // Filter by status
        if (filters.status && item.status !== filters.status) {
            return false;
        }

        return true;
    });
};

// ========== VALIDATE FORM DATA ==========
// Purpose: Basic client-side validation for inventory form
// Parameters: formData (object)
// Returns: Object with isValid (boolean) and errors (object)
export const validateInventoryForm = (formData) => {
    const errors = {};

    if (!formData.itemName || formData.itemName.trim().length < 2)
        errors.itemName = "Item name must be at least 2 characters";

    if (!formData.sku || formData.sku.trim().length < 3)
        errors.sku = "SKU must be at least 3 characters";

    if (formData.currentQuantity < 0)
        errors.currentQuantity = "Quantity cannot be negative";

    if (formData.minimumStock < 0)
        errors.minimumStock = "Minimum stock cannot be negative";

    if (formData.costPrice < 0)
        errors.costPrice = "Cost price cannot be negative";

    if (formData.sellingPrice < 0)
        errors.sellingPrice = "Selling price cannot be negative";

    if (Number(formData.sellingPrice) < Number(formData.costPrice))
        errors.sellingPrice = "Selling price should be greater than or equal to cost price";

    return { isValid: Object.keys(errors).length === 0, errors };
};
