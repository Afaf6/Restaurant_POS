const Joi = require("joi");

const createProductSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required().min(0),
    description: Joi.string().allow('', null),
    stock: Joi.number().required().min(0),
    category: Joi.string().required(),
    emoji: Joi.string().optional(),
    ingredients: Joi.array().items(Joi.object({
        inventoryItem: Joi.string().required(),
        quantity: Joi.number().required().min(0)
    })).optional()
});

const updateProductSchema = Joi.object({
    name: Joi.string(),
    price: Joi.number().min(0),
    description: Joi.string().allow('', null),
    stock: Joi.number().min(0),
    category: Joi.string(),
    emoji: Joi.string().optional(),
    ingredients: Joi.array().items(Joi.object({
        inventoryItem: Joi.string().required(),
        quantity: Joi.number().required().min(0)
    })).optional()
});

module.exports = {
    createProductSchema,
    updateProductSchema
};