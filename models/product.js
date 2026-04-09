const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 0.0
    },
    review_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    delivery_info: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'Giao miễn phí'
    },
    delivery_time: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: '10–15 phút'
    },
    is_available: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Product;
