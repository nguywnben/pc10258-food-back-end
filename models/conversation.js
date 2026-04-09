const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('support', 'shipper', 'promotion'),
        allowNull: false,
        defaultValue: 'support'
    },
    avatar_text: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    is_active: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: 'conversations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Conversation;
