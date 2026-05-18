const Joi = require("joi");

const orderItemSchema = Joi.object({
    product: Joi.required(),
    quantity: Joi.number().required().min(1),
    price: Joi.number().required().min(0)
})

const createOrderSchema = Joi.object({
    items: Joi.array().items(orderItemSchema).min(1).required(),
    totalPrice: Joi.number().required().min(0)
});

const updateOrderSchema = Joi.object({
    items: Joi.array().items(orderItemSchema).min(1),
    totalPrice: Joi.number().min(0)
});

module.exports = {
    createOrderSchema,
    updateOrderSchema
};
