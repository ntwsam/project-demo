const { DataTypes } = require('sequelize')
const { Sequelize } = require('../config/sequelize')
const { Products } = require('../models/products.model')
const { Orders } = require('../models/orders.model')

const OrderDetails = Sequelize.define('orderDetails', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Orders',
            key: 'id',
        },
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Products',
            key: 'id',
        },
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
})

OrderDetails.belongsTo(Orders, { foreignKey: 'orderId' });
OrderDetails.belongsTo(Products, { foreignKey: 'productId' });

module.exports = OrderDetails;