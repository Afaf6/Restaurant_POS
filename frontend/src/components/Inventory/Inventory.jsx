// Import React hooks for state management and side effects
import { useState, useEffect } from "react";

// Import inventory service functions for API calls
import { fetchInventory, deleteInventory } from "../../services/inventoryService";

// Import utility functions for formatting and calculations
import { formatCurrency, formatDate, getStatusColor } from "../../utils/inventoryUtils";

// Import constants
import { INVENTORY_CATEGORIES } from "../../config/constants";

// Import InventoryForm component
import InventoryForm from "./InventoryForm";
import StockAdjustment from "./StockAdjustment";

// Import styles
import styles from "./Inventory.module.css";

// ========== MAIN INVENTORY COMPONENT ==========
// Purpose: Display and manage inventory items
export default function Inventory() {
    // ========== STATE MANAGEMENT ==========
    // Store inventory items from API
    const [inventoryItems, setInventoryItems] = useState([]);
    
    // Loading state - show spinner while fetching data
    const [loading, setLoading] = useState(false);
    
    // Error state - store error messages
    const [error, setError] = useState(null);
    
    // Search term for filtering items
    const [searchTerm, setSearchTerm] = useState("");
    
    // Selected category for filtering
    const [selectedCategory, setSelectedCategory] = useState("");
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Form modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Stock adjustment modal state
    const [isStockOpen, setIsStockOpen] = useState(false);
    const [stockItem, setStockItem] = useState(null);

    // ========== FETCH INVENTORY DATA ==========
    // This function runs when component loads or filters change
    const loadInventory = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters for API call
            const queryParams = {
                page: currentPage,
                limit: 10,
                sortBy: "createdAt",
                sortOrder: "desc"
            };

            // Add search term if exists
            if (searchTerm) {
                queryParams.search = searchTerm;
            }

            // Add category filter if selected
            if (selectedCategory) {
                queryParams.category = selectedCategory;
            }

            // Call API to fetch inventory
            const response = await fetchInventory(queryParams);

            // Update state with fetched data
            setInventoryItems(response.data);
            setTotalPages(response.pagination.totalPages);
            setTotalItems(response.pagination.totalItems);

        } catch (err) {
            setError(err.message || "Failed to load inventory");
            console.error("Error loading inventory:", err);
        } finally {
            setLoading(false);
        }
    };

    // ========== USE EFFECT HOOK ==========
    // Run loadInventory when component mounts or dependencies change
    useEffect(() => {
        loadInventory();
    }, [currentPage, searchTerm, selectedCategory]);

    // ========== HANDLE DELETE ==========
    // Delete an inventory item
    const handleDelete = async (id, itemName) => {
        // Confirm before deleting
        if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
            return;
        }

        try {
            await deleteInventory(id);
            alert("Item deleted successfully");
            loadInventory(); // Reload the list
        } catch (err) {
            alert(err.message || "Failed to delete item");
        }
    };

    // ========== HANDLE ADD NEW ITEM ==========
    const handleAddNew = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    // ========== HANDLE EDIT ITEM ==========
    const handleEdit = (item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    // ========== HANDLE FORM CLOSE ==========
    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingItem(null);
    };

    // ========== HANDLE FORM SUCCESS ==========
    const handleFormSuccess = () => {
        loadInventory();
    };

    // ========== HANDLE STOCK ADJUSTMENT ==========
    const handleStockAdjust = (item) => {
        setStockItem(item);
        setIsStockOpen(true);
    };

    const handleStockClose = () => {
        setIsStockOpen(false);
        setStockItem(null);
    };

    // ========== HANDLE SEARCH ==========
    // Update search term and reset to page 1
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // ========== HANDLE CATEGORY FILTER ==========
    // Update category filter and reset to page 1
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1);
    };

    // ========== HANDLE PAGINATION ==========
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // ========== RENDER COMPONENT ==========
    return (
        <div className={styles.container}>
            {/* Page Header */}
            <div className={styles.header}>
                <h1>Inventory Management</h1>
                <button className={styles.addButton} onClick={handleAddNew}>+ Add New Item</button>
            </div>

            {/* Search and Filter Section */}
            <div className={styles.filterSection}>
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className={styles.searchInput}
                />

                {/* Category Filter */}
                <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className={styles.categorySelect}
                >
                    <option value="">All Categories</option>
                    {INVENTORY_CATEGORIES.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {/* Loading State */}
            {loading && (
                <div className={styles.loading}>
                    <p>Loading inventory...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className={styles.error}>
                    <p>Error: {error}</p>
                    <button onClick={loadInventory}>Retry</button>
                </div>
            )}

            {/* Inventory Table */}
            {!loading && !error && (
                <>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>SKU</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Unit</th>
                                    <th>Cost Price</th>
                                    <th>Selling Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className={styles.noData}>
                                            No inventory items found
                                        </td>
                                    </tr>
                                ) : (
                                    inventoryItems.map(item => (
                                        <tr key={item._id}>
                                            <td>{item.itemName}</td>
                                            <td>{item.sku}</td>
                                            <td>{item.category}</td>
                                            <td>
                                                <span className={
                                                    item.currentQuantity === 0 
                                                        ? styles.outOfStock 
                                                        : item.currentQuantity < item.minimumStock 
                                                        ? styles.lowStock 
                                                        : ""
                                                }>
                                                    {item.currentQuantity}
                                                </span>
                                            </td>
                                            <td>{item.unit}</td>
                                            <td>{formatCurrency(item.costPrice)}</td>
                                            <td>{formatCurrency(item.sellingPrice)}</td>
                                            <td>
                                                <span 
                                                    className={styles.statusBadge}
                                                    style={{ backgroundColor: getStatusColor(item.status) }}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button 
                                                        className={styles.editBtn}
                                                        onClick={() => handleEdit(item)}
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        className={styles.editBtn}
                                                        onClick={() => handleStockAdjust(item)}
                                                        title="Adjust Stock"
                                                    >
                                                        📦
                                                    </button>
                                                    <button 
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleDelete(item._id, item.itemName)}
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button 
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={styles.paginationBtn}
                            >
                                Previous
                            </button>
                            <span className={styles.pageInfo}>
                                Page {currentPage} of {totalPages} ({totalItems} items)
                            </span>
                            <button 
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={styles.paginationBtn}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Inventory Form Modal */}
            <InventoryForm
                isOpen={isFormOpen}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
                editItem={editingItem}
            />

            {/* Stock Adjustment Modal */}
            <StockAdjustment
                isOpen={isStockOpen}
                onClose={handleStockClose}
                onSuccess={loadInventory}
                item={stockItem}
            />
        </div>
    );
}
