const express = require('express');
const router = express.Router();
const payosController = require('../controllers/payosController');
const { checkJWT } = require('../controllers/authCheck');

// Tạo link thanh toán (cần xác thực)
router.post('/payos/create-payment-link', checkJWT, payosController.createPaymentLink);

// Webhook từ PayOS (không cần xác thực JWT vì được PayOS gọi từ bên ngoài)
router.post('/payos/webhook', payosController.receiveWebhook);

// Kiểm tra trạng thái đơn hàng (cần xác thực)
router.get('/payos/order-status/:orderId', checkJWT, payosController.checkOrderStatus);

module.exports = router;
