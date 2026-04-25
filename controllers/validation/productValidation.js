const Joi = require("joi");

const createProductSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required().min(0),
    description: Joi.string(),
    stock: Joi.number().required().min(0),
    category: Joi.string().required()
});

const updateProductSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required().min(0),
    description: Joi.string(),
    stock: Joi.number().required().min(0),
    category: Joi.string().required()
});

module.exports = {
    createProductSchema,
    updateProductSchema
};