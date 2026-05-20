const Joi = require("joi");

const orderItemSchema = Joi.object({
    product: Joi.string().required(),
    quantity: Joi.number().required().min(1),
    price: Joi.number().required().min(0)
});

const createOrderSchema = Joi.object({
    items: Joi.array().items(orderItemSchema).min(1).required(),
    totalPrice: Joi.number().required().min(0),
    promoId: Joi.string().optional(),
    discount: Joi.number().min(0).optional(),
    promoCode: Joi.string().optional()
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'completed', 'cancelled', 'refunded').required()
});

module.exports = {
    createOrderSchema,
    updateStatusSchema
};
