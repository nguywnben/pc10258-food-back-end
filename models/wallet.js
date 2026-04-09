const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Wallet = sequelize.define('Wallet', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    balance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'wallets',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at'
});

module.exports = Wallet;
