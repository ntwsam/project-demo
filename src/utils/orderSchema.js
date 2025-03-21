const joi = require('joi')

exports.createOrder = joi.object({
    productId: joi.number().required(),
    quantity: joi.number().required(),
    paymentMethod: joi.string().valid('Credit card', 'Cash', 'Bank transfer').required(),
})

exports.updateStatus = joi.object({
    status: joi.string().valid('Pending payment', 'Processing', 'Preparing for shipment', 'Shipped', 'In transit', 'Delivered', 'Cancelled', 'Returned').required()
})