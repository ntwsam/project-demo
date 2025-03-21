const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/sequelize')
const { Products } = require('./products.model')

const User = sequelize.define('Users', {
    id: {
        type: DataTypes.INTEGER, // Changed from Datatypes to DataTypes
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: DataTypes.ENUM('admin', 'customer', 'seller'),
        defaultValue: 'customer',
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    providerId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
}, {
    timestamps: false
});

User.hasMany(Products, { foreignKey: 'ownerId', sourceKey: 'uuid' })

module.exports = User;
