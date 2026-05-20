const mongoose = require('mongoose');
require('dotenv').config();
const Inventory = require('./models/inventoryModel');

async function seedInventory() {
    try {
        await mongoose.connect(process.env.DB_URL);
        
        const count = await Inventory.countDocuments();
        if (count > 0) {
            console.log('Inventory already has items');
            process.exit(0);
        }

        const items = [
            {
                itemName: 'Tomato',
                sku: 'TOM-001',
                category: 'Vegetables',
                currentQuantity: 50,
                minimumStock: 10,
                unit: 'pieces',
                costPrice: 0.5,
                sellingPrice: 1.0,
                status: 'active'
            },
            {
                itemName: 'Whole Wheat Bread',
                sku: 'BRD-001',
                category: 'Bread',
                currentQuantity: 5,
                minimumStock: 10,
                unit: 'pieces',
                costPrice: 2.0,
                sellingPrice: 4.0,
                status: 'low stock'
            }
        ];

        await Inventory.insertMany(items);
        console.log('Seed inventory created!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedInventory();
