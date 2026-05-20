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
        enum: ['pending', 'completed', 'cancelled', 'refunded'],
        default: 'completed'
    },
    // Promo code applied to this order
    promoCode: {
        type: String,
        default: null
    },
    // Discount amount applied
    discount: {
        type: Number,
        default: 0
    },
    // Auto-incrementing 5-digit order number sequence
    orderNumber: {
        type: Number,
        unique: true
    }
}, {
    // Automatically track transaction time
    timestamps: true
});

orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        try {
            const lastOrder = await mongoose.models.Order.findOne({}, {}, { sort: { orderNumber: -1 } });
            this.orderNumber = lastOrder && lastOrder.orderNumber ? lastOrder.orderNumber + 1 : 1;
        } catch (err) {
            throw err;
        }
    }
});

// Export the model
module.exports = mongoose.model('Order', orderSchema);