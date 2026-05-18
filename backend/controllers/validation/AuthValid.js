const Joi = require ("joi");

const registerValid = Joi.object ({
    userName : Joi.string()
    .min(3)
    .max(20),

    email: Joi.string()
    .email()
    .required(),

    password: Joi.string()
    .min(8)
    .max(20)
    .required(),

    role: Joi.string()
    .valid("Admin", "Cashier")
    .default("Cashier")
});

const loginValid = Joi.object ({
    email: Joi.string()
    .email()
    .required(),

    password: Joi.string()
    .min(8)
    .max(20)
    .required()
});

module.exports = {registerValid,loginValid};
