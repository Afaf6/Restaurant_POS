const express = require('express');
const router = express.Router();

// import controller functions from routes\orderRoutes.js
const { 
    createOrder, 
    getOrders, 
    updateOrderStatus 
} = require('../controllers/orderController');

// import middlewares from middleware\authMiddleware.js and middleware\validate.js
const protect = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// import schemas related to order validation from controllers\validation\orderValidation.js
const { 
    createOrderSchema, 
    updateStatusSchema 
} = require('../controllers/validation/orderValidation');

const { isAdminOrLeader } = require('../middleware/roleMiddleware');

// Create order — all authenticated users
router.post('/', protect, validate(createOrderSchema), createOrder);

// Get orders — all authenticated (controller filters by role)
router.get('/', protect, getOrders);

// Update order status — Super Admin and Team Leader only
router.patch('/:id/status', protect, isAdminOrLeader, validate(updateStatusSchema), updateOrderStatus);

module.exports = router;
