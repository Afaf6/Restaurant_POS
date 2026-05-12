const mongoose = require('mongoose');
require('dotenv').config();
const Inventory = require('./models/inventoryModel');
const Product = require('./models/productModel');

async function setupFullMenu() {
    try {
        await mongoose.connect(process.env.DB_URL);
        
        // --- 1. SEED INVENTORY ITEMS ---
        const inventoryItems = [
            { itemName: 'Burger Bread', sku: 'BRD-001', category: 'Bread', currentQuantity: 50, minimumStock: 10, unit: 'pieces', costPrice: 0.5, sellingPrice: 1.0 },
            { itemName: 'Meat Patty', sku: 'MET-001', category: 'Meat', currentQuantity: 40, minimumStock: 10, unit: 'pieces', costPrice: 2.0, sellingPrice: 4.0 },
            { itemName: 'Cheese Slice', sku: 'CHS-001', category: 'Cheese', currentQuantity: 60, minimumStock: 10, unit: 'slices', costPrice: 0.3, sellingPrice: 0.6 },
            { itemName: 'Mozzarella Pizza', sku: 'PZA-001', category: 'Pizzas', currentQuantity: 15, minimumStock: 5, unit: 'pieces', costPrice: 6.0, sellingPrice: 12.0 },
            { itemName: 'Pepperoni Pizza', sku: 'PZA-002', category: 'Pizzas', currentQuantity: 12, minimumStock: 5, unit: 'pieces', costPrice: 7.0, sellingPrice: 14.0 },
            { itemName: 'Caesar Salad', sku: 'SLD-001', category: 'Salads', currentQuantity: 20, minimumStock: 5, unit: 'pieces', costPrice: 3.5, sellingPrice: 7.0 }
        ];

        const savedInventory = {};
        for (const item of inventoryItems) {
            const doc = await Inventory.findOneAndUpdate(
                { sku: item.sku },
                item,
                { upsert: true, new: true, runValidators: true }
            );
            // Trigger pre-save for status
            await doc.save();
            savedInventory[item.itemName] = doc;
        }
        console.log('Inventory seeded.');

        // --- 2. SEED PRODUCTS ---
        const products = [
            {
                name: 'Meat Burger',
                price: 8.99,
                category: 'Burgers',
                emoji: '🍔',
                stock: 0,
                ingredients: [
                    { inventoryItem: savedInventory['Burger Bread']._id, quantity: 1 },
                    { inventoryItem: savedInventory['Meat Patty']._id, quantity: 1 }
                ]
            },
            {
                name: 'Cheese Burger',
                price: 9.99,
                category: 'Burgers',
                emoji: '🍔',
                stock: 0,
                ingredients: [
                    { inventoryItem: savedInventory['Burger Bread']._id, quantity: 1 },
                    { inventoryItem: savedInventory['Meat Patty']._id, quantity: 1 },
                    { inventoryItem: savedInventory['Cheese Slice']._id, quantity: 1 }
                ]
            },
            {
                name: 'Mozzarella Pizza',
                price: 12.99,
                category: 'Pizzas',
                emoji: '🍕',
                stock: 0,
                ingredients: [
                    { inventoryItem: savedInventory['Mozzarella Pizza']._id, quantity: 1 }
                ]
            },
            {
                name: 'Pepperoni Pizza',
                price: 14.99,
                category: 'Pizzas',
                emoji: '🍕',
                stock: 0,
                ingredients: [
                    { inventoryItem: savedInventory['Pepperoni Pizza']._id, quantity: 1 }
                ]
            },
            {
                name: 'Caesar Salad',
                price: 7.49,
                category: 'Salads',
                emoji: '🥗',
                stock: 0,
                ingredients: [
                    { inventoryItem: savedInventory['Caesar Salad']._id, quantity: 1 }
                ]
            }
        ];

        // Clear old products to avoid duplicates if names changed
        await Product.deleteMany({ name: { $in: products.map(p => p.name) } });
        await Product.insertMany(products);
        
        console.log('Products seeded and linked.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

setupFullMenu();
