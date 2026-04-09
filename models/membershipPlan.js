const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const MembershipPlan = sequelize.define('MembershipPlan', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true
    },
    is_popular: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'membership_plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = MembershipPlan;
