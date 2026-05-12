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

//create route post /api/orders to create a new order
router.post('/', protect, validate(createOrderSchema), createOrder);

// create route get /api/orders to get all orders for the authenticated user
router.get('/', protect, getOrders);

// update order status with route patch /api/orders/:id/status to update the status of an order by id
router.patch('/:id/status', protect, validate(updateStatusSchema), updateOrderStatus);

module.exports = router;
