const express = require('express');
const router = express.Router();
const payosController = require('../controllers/payosController');

// Khai báo đường dẫn API cho route
router.post('/create-payment-link', payosController.createPaymentLink);
router.post('/webhook', payosController.receiveWebhook);

module.exports = router;
