// ========== INVENTORY SERVICE LAYER ==========
// This file centralizes all API calls related to inventory
// It handles communication between frontend and backend

// API base URL - change this based on your environment
const API_BASE_URL = "http://localhost:4000/api/inventory";

// ========== HELPER FUNCTION: GET AUTH TOKEN ==========
// Get authentication token from localStorage
// This token is sent with every request to authenticate the user
const getAuthToken = () => {
    return localStorage.getItem("token");
};

// ========== HELPER FUNCTION: GET AUTH HEADERS ==========
// Create headers object with authentication token
const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
    };
};

// ========== FETCH ALL INVENTORY ITEMS ==========
// Purpose: Get all inventory items with optional filters and pagination
// Parameters: query object with search, category, status, page, limit, sortBy, sortOrder
// Returns: Promise with inventory items and pagination info
export const fetchInventory = async (queryParams = {}) => {
    try {
        // Build query string from parameters
        const queryString = new URLSearchParams(queryParams).toString();
        const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

        // Make GET request to backend
        const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders()
        });

        // Parse JSON response
        const data = await response.json();

        // Check if request was successful
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch inventory");
        }

        return data;

    } catch (error) {
        console.error("Error fetching inventory:", error);
        throw error;
    }
};

// ========== FETCH SINGLE INVENTORY ITEM BY ID ==========
// Purpose: Get details of a specific inventory item
// Parameters: id (string) - inventory item ID
// Returns: Promise with single inventory item
export const fetchInventoryById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch inventory item");
        }

        return data;

    } catch (error) {
        console.error("Error fetching inventory item:", error);
        throw error;
    }
};

// ========== CREATE NEW INVENTORY ITEM ==========
// Purpose: Add a new inventory item to the database
// Parameters: itemData (object) - inventory item details
// Returns: Promise with created inventory item
export const createInventory = async (itemData) => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(itemData)  // Convert object to JSON string
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create inventory item");
        }

        return data;

    } catch (error) {
        console.error("Error creating inventory item:", error);
        throw error;
    }
};

// ========== UPDATE INVENTORY ITEM ==========
// Purpose: Update an existing inventory item
// Parameters: id (string), itemData (object) - updated item details
// Returns: Promise with updated inventory item
export const updateInventory = async (id, itemData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(itemData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to update inventory item");
        }

        return data;

    } catch (error) {
        console.error("Error updating inventory item:", error);
        throw error;
    }
};

// ========== DELETE INVENTORY ITEM ==========
// Purpose: Soft delete an inventory item (mark as discontinued)
// Parameters: id (string) - inventory item ID
// Returns: Promise with deleted inventory item
export const deleteInventory = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete inventory item");
        }

        return data;

    } catch (error) {
        console.error("Error deleting inventory item:", error);
        throw error;
    }
};

// ========== UPDATE STOCK QUANTITY ==========
// Purpose: Adjust stock quantity (add, remove, or set)
// Parameters: 
//   - id (string) - inventory item ID
//   - adjustmentType (string) - "add", "remove", or "set"
//   - quantity (number) - amount to adjust
//   - reason (string) - optional reason for adjustment
// Returns: Promise with updated inventory item
export const updateStock = async (id, adjustmentType, quantity, reason = "") => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}/stock`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ adjustmentType, quantity, reason })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to update stock");
        }

        return data;

    } catch (error) {
        console.error("Error updating stock:", error);
        throw error;
    }
};

// ========== FETCH LOW STOCK ITEMS ==========
// Purpose: Get all items with stock below minimum level
// Returns: Promise with low stock items
export const fetchLowStockItems = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/low-stock`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch low stock items");
        }

        return data;

    } catch (error) {
        console.error("Error fetching low stock items:", error);
        throw error;
    }
};

// ========== FETCH OUT OF STOCK ITEMS ==========
// Purpose: Get all items with zero stock
// Returns: Promise with out of stock items
export const fetchOutOfStockItems = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/out-of-stock`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch out of stock items");
        }

        return data;

    } catch (error) {
        console.error("Error fetching out of stock items:", error);
        throw error;
    }
};

// ========== FETCH INVENTORY BY CATEGORY ==========
// Purpose: Get all items in a specific category
// Parameters: category (string) - category name
// Returns: Promise with filtered inventory items
export const fetchInventoryByCategory = async (category) => {
    try {
        const response = await fetch(`${API_BASE_URL}/category/${category}`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch items by category");
        }

        return data;

    } catch (error) {
        console.error("Error fetching items by category:", error);
        throw error;
    }
};

// ========== SEARCH INVENTORY ==========
// Purpose: Search inventory by name or SKU
// Parameters: searchTerm (string) - search query
// Returns: Promise with matching inventory items
export const searchInventory = async (searchTerm) => {
    try {
        const response = await fetch(`${API_BASE_URL}?search=${encodeURIComponent(searchTerm)}`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to search inventory");
        }

        return data;

    } catch (error) {
        console.error("Error searching inventory:", error);
        throw error;
    }
};
