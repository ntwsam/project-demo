const joi = require('joi')

exports.createProduct = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    category: joi.string().required(),
    price: joi.number().required(),
    stock: joi.number().required(),
})

exports.updateProduct = joi.object({
    name: joi.string().optional(),
    description: joi.string().optional(),
    category: joi.string().optional(),
    price: joi.number().optional(),
    stock: joi.number().optional(),
})