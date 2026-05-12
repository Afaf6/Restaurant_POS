// Import React hooks
import { useState, useEffect } from "react";

// Import API service functions
import { createInventory, updateInventory } from "../../services/inventoryService";

// Import constants
import { INVENTORY_CATEGORIES, UNITS_OF_MEASUREMENT } from "../../config/constants";

// Import validation utility
import { validateInventoryForm } from "../../utils/inventoryUtils";

// Import styles
import styles from "./InventoryForm.module.css";

// ========== INVENTORY FORM COMPONENT ==========
// Purpose: Form for creating new or editing existing inventory items
// Props:
//   - isOpen: boolean to show/hide modal
//   - onClose: function to close modal
//   - onSuccess: function to call after successful save
//   - editItem: object with item data (null for new item)
export default function InventoryForm({ isOpen, onClose, onSuccess, editItem = null }) {
    
    // ========== DETERMINE MODE ==========
    // Check if we're editing or creating new item
    const isEditMode = editItem !== null;

    // ========== FORM STATE ==========
    // Initialize form data with default values or edit item data
    const [formData, setFormData] = useState({
        itemName: "",
        sku: "",
        category: "Bread",
        currentQuantity: 0,
        minimumStock: 10,
        unit: "pieces",
        costPrice: 0,
        sellingPrice: 0,
        expiryDate: ""
    });

    // Form submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Validation errors
    const [errors, setErrors] = useState({});
    
    // Success/error messages
    const [message, setMessage] = useState({ type: "", text: "" });

    // ========== POPULATE FORM FOR EDIT MODE ==========
    // When editItem changes, populate form with its data
    useEffect(() => {
        if (editItem) {
            setFormData({
                itemName: editItem.itemName || "",
                sku: editItem.sku || "",
                category: editItem.category || "Bread",
                currentQuantity: editItem.currentQuantity || 0,
                minimumStock: editItem.minimumStock || 10,
                unit: editItem.unit || "pieces",
                costPrice: editItem.costPrice || 0,
                sellingPrice: editItem.sellingPrice || 0,
                expiryDate: editItem.expiryDate ? editItem.expiryDate.split('T')[0] : ""
            });
        }
    }, [editItem]);

    // ========== HANDLE INPUT CHANGE ==========
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    // ========== HANDLE FORM SUBMIT ==========
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page reload
        
        // Clear previous messages
        setMessage({ type: "", text: "" });

        // Validate form data
        const validation = validateInventoryForm(formData);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        // Clear errors if validation passed
        setErrors({});
        setIsSubmitting(true);

        try {
            // Prepare data for API (convert strings to numbers where needed)
            const dataToSend = {
                ...formData,
                currentQuantity: Number(formData.currentQuantity),
                minimumStock: Number(formData.minimumStock),
                costPrice: Number(formData.costPrice),
                sellingPrice: Number(formData.sellingPrice),
                expiryDate: formData.expiryDate || undefined
            };

            // Call appropriate API function based on mode
            if (isEditMode) {
                await updateInventory(editItem._id, dataToSend);
                setMessage({ type: "success", text: "Item updated successfully!" });
            } else {
                await createInventory(dataToSend);
                setMessage({ type: "success", text: "Item created successfully!" });
            }

            // Wait a moment to show success message
            setTimeout(() => {
                onSuccess(); // Refresh the inventory list
                handleClose(); // Close the modal
            }, 1500);

        } catch (error) {
            setMessage({ 
                type: "error", 
                text: error.message || "Failed to save item" 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ========== HANDLE CLOSE ==========
    // Reset form and close modal
    const handleClose = () => {
        // Reset form data
        setFormData({
            itemName: "",
            sku: "",
            category: "Bread",
            currentQuantity: 0,
            minimumStock: 10,
            unit: "pieces",
            costPrice: 0,
            sellingPrice: 0,
            expiryDate: ""
        });
        
        // Clear errors and messages
        setErrors({});
        setMessage({ type: "", text: "" });
        
        // Call parent close function
        onClose();
    };

    // ========== RENDER ==========
    // Don't render if modal is not open
    if (!isOpen) return null;

    return (
        // Modal overlay - clicking outside closes modal
        <div className={styles.modalOverlay} onClick={handleClose}>
            {/* Modal content - stop propagation to prevent closing when clicking inside */}
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                
                {/* Modal Header */}
                <div className={styles.modalHeader}>
                    <h2>{isEditMode ? "Edit Inventory Item" : "Add New Inventory Item"}</h2>
                    <button className={styles.closeButton} onClick={handleClose}>×</button>
                </div>

                {/* Success/Error Message */}
                {message.text && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    
                    {/* ========== BASIC INFORMATION ========== */}
                    <div className={styles.section}>
                        <h3>Basic Information</h3>
                        
                        {/* Item Name */}
                        <div className={styles.formGroup}>
                            <label htmlFor="itemName">Item Name *</label>
                            <input
                                type="text"
                                id="itemName"
                                name="itemName"
                                value={formData.itemName}
                                onChange={handleChange}
                                placeholder="e.g., Tomatoes"
                                className={errors.itemName ? styles.inputError : ""}
                            />
                            {errors.itemName && <span className={styles.error}>{errors.itemName}</span>}
                        </div>

                        {/* SKU */}
                        <div className={styles.formGroup}>
                            <label htmlFor="sku">SKU (Stock Keeping Unit) *</label>
                            <input
                                type="text"
                                id="sku"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="e.g., TOM-001"
                                className={errors.sku ? styles.inputError : ""}
                                disabled={isEditMode} // SKU cannot be changed in edit mode
                            />
                            {errors.sku && <span className={styles.error}>{errors.sku}</span>}
                        </div>

                        {/* Category */}
                        <div className={styles.formGroup}>
                            <label htmlFor="category">Category *</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                {INVENTORY_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ========== STOCK INFORMATION ========== */}
                    <div className={styles.section}>
                        <h3>Stock Information</h3>
                        
                        <div className={styles.formRow}>
                            {/* Current Quantity */}
                            <div className={styles.formGroup}>
                                <label htmlFor="currentQuantity">Current Quantity *</label>
                                <input
                                    type="number"
                                    id="currentQuantity"
                                    name="currentQuantity"
                                    value={formData.currentQuantity}
                                    onChange={handleChange}
                                    min="0"
                                    className={errors.currentQuantity ? styles.inputError : ""}
                                />
                                {errors.currentQuantity && <span className={styles.error}>{errors.currentQuantity}</span>}
                            </div>

                            {/* Unit */}
                            <div className={styles.formGroup}>
                                <label htmlFor="unit">Unit *</label>
                                <select
                                    id="unit"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                >
                                    {UNITS_OF_MEASUREMENT.map(unit => (
                                        <option key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Minimum Stock */}
                        <div className={styles.formGroup}>
                            <label htmlFor="minimumStock">Minimum Stock Level *</label>
                            <input
                                type="number"
                                id="minimumStock"
                                name="minimumStock"
                                value={formData.minimumStock}
                                onChange={handleChange}
                                min="0"
                                className={errors.minimumStock ? styles.inputError : ""}
                            />
                            {errors.minimumStock && <span className={styles.error}>{errors.minimumStock}</span>}
                        </div>
                    </div>

                    {/* ========== PRICING INFORMATION ========== */}
                    <div className={styles.section}>
                        <h3>Pricing Information</h3>
                        
                        <div className={styles.formRow}>
                            {/* Cost Price */}
                            <div className={styles.formGroup}>
                                <label htmlFor="costPrice">Cost Price *</label>
                                <input
                                    type="number"
                                    id="costPrice"
                                    name="costPrice"
                                    value={formData.costPrice}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className={errors.costPrice ? styles.inputError : ""}
                                />
                                {errors.costPrice && <span className={styles.error}>{errors.costPrice}</span>}
                            </div>

                            {/* Selling Price */}
                            <div className={styles.formGroup}>
                                <label htmlFor="sellingPrice">Selling Price *</label>
                                <input
                                    type="number"
                                    id="sellingPrice"
                                    name="sellingPrice"
                                    value={formData.sellingPrice}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className={errors.sellingPrice ? styles.inputError : ""}
                                />
                                {errors.sellingPrice && <span className={styles.error}>{errors.sellingPrice}</span>}
                            </div>
                        </div>
                    </div>

                    {/* ========== ADDITIONAL INFORMATION ========== */}
                    <div className={styles.section}>
                        <h3>Additional Information</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="expiryDate">Expiry Date (Optional)</label>
                            <input
                                type="date"
                                id="expiryDate"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* ========== FORM ACTIONS ========== */}
                    <div className={styles.formActions}>
                        <button 
                            type="button" 
                            onClick={handleClose}
                            className={styles.cancelButton}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : isEditMode ? "Update Item" : "Create Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
