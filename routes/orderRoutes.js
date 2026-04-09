const express = require('express');
const router = express.Router();
const { checkJWT, isAdmin } = require('../controllers/authCheck');
const OrderController = require('../controllers/orderController');

// Client
router.get('/orders', checkJWT, OrderController.get);
router.get('/orders/:id', checkJWT, OrderController.getById);
router.post('/orders', checkJWT, OrderController.create);
router.put('/orders/:id/cancel', checkJWT, OrderController.cancel);

// Admin
router.get('/admin/orders', checkJWT, isAdmin, OrderController.getAll);
router.put('/admin/orders/:id/status', checkJWT, isAdmin, OrderController.updateStatus);

module.exports = router;
