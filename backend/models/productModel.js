/**
 * PRODUCT MODEL
 * Defines the schema for menu items sold in the POS.
 * Products are linked to inventory items via ingredients.
 */

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    // Name of the menu item (e.g., "Meat Burger")
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Selling price of the product
    price: {
        type: Number,
        required: true,
        min: 0
    },
    // Brief description of the product
    description: {
        type: String,
        trim: true
    },
    // Base stock level (if ingredients are not used)
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    // Menu category (e.g., Burgers, Pizzas)
    category: {
        type: String,
        required: true,
        enum: ["Burgers", "Pizzas", "Salads", "Drinks"]
    },
    // URL or path to the product image
    image: {
        type: String
    },
    // Visual emoji represention for the POS interface
    emoji: {
        type: String,
        default: "🍔"
    },
    /**
     * List of inventory ingredients required to make this product.
     * Used for automatic stock deduction during orders.
     */
    ingredients: [
        {
            // Reference to an item in the Inventory collection
            inventoryItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Inventory",
                required: true
            },
            // Amount of the inventory item used per 1 unit of this product
            quantity: {
                type: Number,
                required: true,
                default: 1
            }
        }
    ]
}, { 
    // Automatically track creation and update times
    timestamps: true 
});

// Export the model
module.exports = mongoose.model("Product", productSchema);