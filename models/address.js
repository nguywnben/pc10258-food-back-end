const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    label: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Nhà riêng'
    },
    full_address: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    is_default: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'addresses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Address;
