const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    product_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    unit_price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subtotal: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'order_items',
    timestamps: false
});

module.exports = OrderItem;
