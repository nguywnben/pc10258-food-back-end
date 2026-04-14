require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Khởi tạo models và associations
const { sequelize } = require('./models');

// Import routes
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const addressRoutes = require('./routes/addressRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const walletRoutes = require('./routes/walletRoutes');
const messageRoutes = require('./routes/messageRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const payosRoutes = require('./routes/payosRoutes');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    methods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization'
}));

// Phục vụ file tĩnh (ảnh sản phẩm, avatar…)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Đăng ký routes
app.use('/api', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api', productRoutes);
app.use('/api', addressRoutes);
app.use('/api', favoriteRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api', walletRoutes);
app.use('/api', messageRoutes);
app.use('/api', promotionRoutes);
app.use('/api', membershipRoutes);
app.use('/api', paymentRoutes);
app.use('/api', payosRoutes);

// Health check
app.get('/api', (req, res) => {
    res.json({
        message: 'PC10258 Food API đang hoạt động!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/users/register, /api/users/login',
            categories: '/api/categories',
            products: '/api/products',
            cart: '/api/cart',
            orders: '/api/orders',
            wallet: '/api/wallet',
            favorites: '/api/favorites',
            messages: '/api/conversations',
            promotions: '/api/promotions/validate',
            membership: '/api/membership-plans',
            payments: '/api/payments',
            addresses: '/api/addresses'
        }
    });
});

// Khởi động server
app.listen(port, () => {
    console.log(`🚀 PC10258 Food API đang chạy tại http://localhost:${port}`);
    console.log(`📋 Danh sách API: http://localhost:${port}/api`);
});