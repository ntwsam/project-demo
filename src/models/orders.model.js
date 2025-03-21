const { DataTypes } = require('sequelize')
const { Sequelize } = require('../config/sequelize')
const { Users } = require('../models/users.model');

const Orders = Sequelize.define('Orders', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    customerId: {
        type: DataTypes.UUID,
        references: {
            model: Users,
            key: 'uuid',
        },
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Pending payment', 'Processing', 'Preparing for shipment', 'Shipped', 'In transit', 'Delivered', 'Cancelled', 'Returned'),
        allowNull: false,
    },
    orderAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.ENUM('Credit card', 'Cash', 'Bank Transfer'),
        allowNull: false,
    },
    paymentStatus: {
        type: DataTypes.ENUM('Paid', 'Processing'),
        allowNull: false,
    }

})

Orders.belongsTo(Users, { foreignKey: 'customerId', targetKey: 'uuid' })

module.exports = Orders;