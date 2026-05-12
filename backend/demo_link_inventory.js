const mongoose = require('mongoose');
require('dotenv').config();
const Inventory = require('./models/inventoryModel');
const Product = require('./models/productModel');

async function demoLink() {
    try {
        await mongoose.connect(process.env.DB_URL);
        
        // 1. Create Inventory Items
        const bread = await Inventory.findOneAndUpdate(
            { sku: 'BRD-001' },
            { 
                itemName: 'Burger Bread', 
                currentQuantity: 20, 
                category: 'Bread', 
                unit: 'pieces',
                minimumStock: 5,
                costPrice: 0.5,
                sellingPrice: 1.0
            },
            { upsert: true, new: true }
        );

        const cheese = await Inventory.findOneAndUpdate(
            { sku: 'CHS-001' },
            { 
                itemName: 'Cheese Slice', 
                currentQuantity: 15, 
                category: 'Cheese', 
                unit: 'slices',
                minimumStock: 5,
                costPrice: 0.2,
                sellingPrice: 0.5
            },
            { upsert: true, new: true }
        );

        console.log('Inventory items ready');

        // 2. Create Cheese Burger Product linked to these items
        const cheeseBurger = await Product.findOneAndUpdate(
            { name: 'Cheese Burger' },
            {
                price: 9.99,
                description: 'Delicious burger with cheese',
                category: 'Burgers',
                stock: 0, // Not used when ingredients exist
                ingredients: [
                    { inventoryItem: bread._id, quantity: 1 },
                    { inventoryItem: cheese._id, quantity: 1 }
                ]
            },
            { upsert: true, new: true }
        );

        console.log('Cheese Burger linked with ingredients');
        
        // 3. Create another product with no ingredients to test fallback
        await Product.findOneAndUpdate(
            { name: 'Caesar Salad' },
            {
                price: 7.49,
                description: 'Fresh Caesar Salad',
                category: 'Salads',
                stock: 10,
                ingredients: []
            },
            { upsert: true, new: true }
        );

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

demoLink();
