const sequelize = require('../database');

// Import tất cả models
const User = require('./user');
const Address = require('./address');
const Category = require('./category');
const Product = require('./product');
const Favorite = require('./favorite');
const Wallet = require('./wallet');
const WalletTransaction = require('./walletTransaction');
const Order = require('./order');
const OrderItem = require('./orderItem');
const CartItem = require('./cartItem');
const Promotion = require('./promotion');
const Conversation = require('./conversation');
const Message = require('./message');
const MembershipPlan = require('./membershipPlan');
const Payment = require('./payment');

// ============================================================
// THIẾT LẬP QUAN HỆ (ASSOCIATIONS)
// ============================================================

// User ↔ Address (1:N)
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category ↔ Product (1:N)
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// User ↔ Favorite ↔ Product (N:M qua bảng favorites)
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Product.hasMany(Favorite, { foreignKey: 'product_id', as: 'favorites' });
Favorite.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User ↔ Wallet (1:1)
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Wallet ↔ WalletTransaction (1:N)
Wallet.hasMany(WalletTransaction, { foreignKey: 'wallet_id', as: 'transactions' });
WalletTransaction.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });

// User ↔ Order (1:N)
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Order ↔ Address
Order.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });

// Order ↔ OrderItem (1:N)
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// OrderItem ↔ Product
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User ↔ CartItem (1:N)
User.hasMany(CartItem, { foreignKey: 'user_id', as: 'cartItems' });
CartItem.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// CartItem ↔ Product
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });

// User ↔ Conversation (1:N)
User.hasMany(Conversation, { foreignKey: 'user_id', as: 'conversations' });
Conversation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Conversation ↔ Message (1:N)
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

// Message ↔ User (sender)
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// User ↔ Payment (1:N)
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Payment ↔ Order
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// User ↔ MembershipPlan (for tracking current membership)
User.belongsTo(MembershipPlan, { foreignKey: 'membership_plan_id', as: 'currentMembership' });

module.exports = {
    sequelize,
    User,
    Address,
    Category,
    Product,
    Favorite,
    Wallet,
    WalletTransaction,
    Order,
    OrderItem,
    CartItem,
    Promotion,
    Conversation,
    Message,
    MembershipPlan,
    Payment
};
