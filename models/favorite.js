const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Favorite = sequelize.define('Favorite', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'favorites',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'product_id']
        }
    ]
});

module.exports = Favorite;
