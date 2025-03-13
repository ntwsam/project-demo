const joi = require("joi")

exports.adminRegisterSchema = joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
    secretKey: joi.string().required(),
    phone: joi.string().required()
});

exports.registerSchema = joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
    role: joi.string().valid("customer", "seller").required(),
    phone: joi.string().required()
})