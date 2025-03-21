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

exports.changePassword = joi.object({
    oldPassword: joi.string().required(),
    newPassword: joi.string().min(8).required(),
})

exports.updateSchema = joi.object({
    username: joi.string().optional(),
    email: joi.string().email().optional(),
    phone: joi.string().optional(),
    role: joi.string().valid("customer", "seller").optional(),
})

exports.emailVerify = joi.object({
    email: joi.string().email().required(),
})

exports.resetPassword = joi.object({
    token: joi.string().required(),
    newPassword: joi.string().min(8).required(),
})