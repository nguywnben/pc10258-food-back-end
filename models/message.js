const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    conversation_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sender_type: {
        type: DataTypes.ENUM('user', 'agent', 'system'),
        allowNull: false,
        defaultValue: 'user'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Message;
