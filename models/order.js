const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    order_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'preparing', 'delivering', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    payment_method: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    subtotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    discount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    delivery_fee: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    address_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Order;
