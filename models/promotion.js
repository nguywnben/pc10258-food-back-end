const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Promotion = sequelize.define('Promotion', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    discount_type: {
        type: DataTypes.ENUM('fixed', 'percent'),
        allowNull: false
    },
    discount_value: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    min_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    max_uses: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    used_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'promotions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Promotion;
