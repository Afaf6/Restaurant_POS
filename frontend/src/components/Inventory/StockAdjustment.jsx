import { useState } from "react";
import { updateStock } from "../../services/inventoryService";
import { ADJUSTMENT_TYPES } from "../../config/constants";
import styles from "./StockAdjustment.module.css";

export default function StockAdjustment({ isOpen, onClose, onSuccess, item }) {
    const [formData, setFormData] = useState({ adjustmentType: "add", quantity: 0, reason: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    if (!isOpen || !item) return null;

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Number(formData.quantity) <= 0) {
            setMessage({ type: "error", text: "Quantity must be greater than 0" });
            return;
        }
        setIsSubmitting(true);
        setMessage({ type: "", text: "" });
        try {
            await updateStock(item._id, formData.adjustmentType, Number(formData.quantity), formData.reason);
            setMessage({ type: "success", text: "Stock updated successfully!" });
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 1000);
        } catch (error) {
            setMessage({ type: "error", text: error.message || "Failed to update stock" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({ adjustmentType: "add", quantity: 0, reason: "" });
        setMessage({ type: "", text: "" });
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Adjust Stock — {item.itemName}</h2>
                    <button className={styles.closeButton} onClick={handleClose}>×</button>
                </div>

                <div className={styles.currentStock}>
                    <span>Current Stock:</span>
                    <strong>{item.currentQuantity} {item.unit}</strong>
                </div>

                {message.text && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Adjustment Type</label>
                        <select name="adjustmentType" value={formData.adjustmentType} onChange={handleChange}>
                            {ADJUSTMENT_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Quantity ({item.unit})</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="0"
                            step="1"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Reason (Optional)</label>
                        <input
                            type="text"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="e.g., New shipment received"
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" onClick={handleClose} className={styles.cancelButton} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Stock"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
