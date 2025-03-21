const { DataTypes } = require('sequelize')
const { Sequelize } = require('../config/sequelize')
const { Users } = require("./users.model");

const Products = Sequelize.define('Products', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ownerId: {
        type: DataTypes.UUID,
        references: {
            model: 'Users',
            key: 'uuid'
        },
        allowNull: false,
    }
})

Products.belongsTo(Users, { foreignKey: 'ownerId', targetKey: 'uuid' })

module.exports = Products;