/**
 * ORDER MODEL
 * Defines the schema for customer transactions.
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // List of items purchased in the order
    items: [
        {
            // Reference to the purchased product
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            // Quantity purchased
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            // Price at the time of purchase (historical price)
            price: {
                type: Number,
                required: true
            }
        }
    ],
    // Total cost of the order including all items
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    // Reference to the user who processed the transaction
    cashier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    // Order status (pending, completed, cancelled)
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'completed'
    }
}, {
    // Automatically track transaction time
    timestamps: true
});

// Export the model
module.exports = mongoose.model('Order', orderSchema);