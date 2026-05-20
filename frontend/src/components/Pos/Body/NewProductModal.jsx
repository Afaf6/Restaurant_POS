import React, { useState, useEffect } from 'react';
import style from './NewProductModal.module.css';
import { fetchInventory } from '../../../services/inventoryService';
import { createProduct } from '../../../services/productService';

const CATEGORIES = ["Burgers", "Pizzas", "Salads", "Drinks"];

const NewProductModal = ({ onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    category: 'Burgers',
    emoji: '🍔',
    ingredients: [{ inventoryItem: '', quantity: 1 }]
  });
  
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const response = await fetchInventory({ limit: 100 });
        if (response && response.data) {
          setInventoryItems(response.data);
        } else if (Array.isArray(response)) {
          setInventoryItems(response);
        }
      } catch (error) {
        console.error("Failed to load inventory:", error);
      }
    };
    loadInventory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { inventoryItem: '', quantity: 1 }]
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients.splice(index, 1);
      return { ...prev, ingredients: newIngredients };
    });
  };

  const handleIngredientChange = (index, field, value) => {
    setFormData(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index][field] = value;
      return { ...prev, ingredients: newIngredients };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validIngredients = formData.ingredients.filter(ing => ing.inventoryItem);
    if (validIngredients.length === 0) {
      alert("You must select at least one inventory ingredient for this product.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        stock: Number(formData.stock),
        category: formData.category,
        emoji: formData.emoji,
        ingredients: formData.ingredients.filter(ing => ing.inventoryItem).map(ing => ({
          inventoryItem: ing.inventoryItem,
          quantity: Number(ing.quantity)
        }))
      };

      await createProduct(payload);
      onProductAdded();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error adding product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div className={style.modalContent} onClick={e => e.stopPropagation()}>
        <div className={style.modalHeader}>
          <h2>Add New Product</h2>
          <button className={style.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={style.formGroup}>
            <label>Name</label>
            <input 
              required 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className={style.input} 
            />
          </div>

          <div className={style.gridRow}>
            <div className={style.formGroup}>
              <label>Price ($)</label>
              <input 
                required 
                type="number" 
                step="0.01" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                className={style.input} 
              />
            </div>

            <div className={style.formGroup}>
              <label>Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                className={style.input}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={style.gridRow}>
            <div className={style.formGroup}>
              <label>Emoji (Icon)</label>
              <input 
                type="text" 
                name="emoji" 
                value={formData.emoji} 
                onChange={handleChange} 
                className={style.input} 
              />
            </div>

            <div className={style.formGroup}>
              <label>Initial Base Stock</label>
              <input 
                required 
                type="number" 
                name="stock" 
                value={formData.stock} 
                onChange={handleChange} 
                className={style.input} 
              />
            </div>
          </div>

          <div className={style.formGroup}>
            <label>Ingredients (Required)</label>
            <div className={style.ingredientsBox}>
              {formData.ingredients.map((ing, index) => (
                <div key={index} className={style.ingredientRow}>
                  <select
                    className={style.ingredientSelect}
                    value={ing.inventoryItem}
                    onChange={(e) => handleIngredientChange(index, 'inventoryItem', e.target.value)}
                    required
                  >
                    <option value="">Select Inventory Item</option>
                    {inventoryItems.map(item => (
                      <option key={item._id} value={item._id}>{item.itemName} (Available: {item.currentQuantity})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className={style.ingredientQty}
                    value={ing.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    placeholder="Qty"
                    required
                  />
                  {formData.ingredients.length > 1 && (
                    <button type="button" className={style.removeBtn} onClick={() => removeIngredient(index)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className={style.addIngredientBtn} onClick={addIngredient}>
                + Add Ingredient
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={style.submitBtn}>
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewProductModal;
