const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const WalletTransaction = sequelize.define('WalletTransaction', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    wallet_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('deposit', 'payment', 'refund'),
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    reference_code: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'wallet_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = WalletTransaction;
