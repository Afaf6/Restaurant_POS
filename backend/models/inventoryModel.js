// Import mongoose 
const mongoose = require("mongoose");

// Define inventory schema and structure of inventory items in database
const inventorySchema = new mongoose.Schema({
 
    itemName: {
        type: String,
        required: true,
        trim: true
    },

    // unique stock keeping unit identifier
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    // Category - group items by type
    category: {
        type: String,
        required: true,
        enum: ["Bread", "Vegetables", "Meat", "Cheese", "Pizzas", "Salads"],
    },

    // Current available stock quantity
    currentQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },

    // Minimum stock level that should be maintained to avoid running out of stock
    minimumStock: {
        type: Number,
        required: true,
        min: 0,
        default: 10
    },

    // Maximum stock level that can be stored
    maximumStock: {
        type: Number,
        min: 0
    },

    // Unit of measurement
    unit: {
        type: String,
        required: true,
        enum: ["pieces", "slices"],
        default: "pieces"
    },

    // Cost price 
    costPrice: {
        type: Number,
        required: true,
        min: 0
    },

    // Selling price 
    sellingPrice: {
        type: Number,
        required: true,
        min: 0
    },
 
    expiryDate: {
        type: Date
    },

    // Last restocked date
    lastRestockedDate: {
        type: Date,
        default: Date.now
    },

    // Status of inventory item
    status: {
        type: String,
        enum: ["active", "low stock", "out of stock", "discontinued"],
        default: "active"
    }

}, 
// Auto add timestamps to track when inventory items are created and updated
{ timestamps: true }); 

// Middleware auto update status based on quantity before saving
inventorySchema.pre("save", async function() {
    const qty = Number(this.currentQuantity);
    const min = Number(this.minimumStock);
    
    if (qty === 0) {
        this.status = "out of stock";
    } else if (qty < min) {
        this.status = "low stock";
    } else {
        this.status = "active";
    }
});

// Virtual: Calculate profit margin percentage
inventorySchema.virtual("profitMargin").get(function() {
    if (this.sellingPrice === 0) return 0;
    return (((this.sellingPrice - this.costPrice) / this.sellingPrice) * 100).toFixed(2);
});

// Virtual: Calculate total stock value
inventorySchema.virtual("stockValue").get(function() {
    return (this.currentQuantity * this.costPrice).toFixed(2);
});

// Virtual: Check if expiring soon (within 7 days)
inventorySchema.virtual("isExpiringSoon").get(function() {
    if (!this.expiryDate) return false;
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return this.expiryDate <= sevenDays && this.expiryDate >= new Date();
});

// Virtual: Check if expired
inventorySchema.virtual("isExpired").get(function() {
    if (!this.expiryDate) return false;
    return this.expiryDate < new Date();
});

// Include virtuals in JSON/Object output
inventorySchema.set("toJSON", { virtuals: true });
inventorySchema.set("toObject", { virtuals: true });

// Export the model
module.exports = mongoose.model("Inventory", inventorySchema);
