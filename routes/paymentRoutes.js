const express = require('express');
const router = express.Router();
const { checkJWT } = require('../controllers/authCheck');
const PaymentController = require('../controllers/paymentController');

router.get('/payments', checkJWT, PaymentController.get);
router.get('/payments/active/order/:orderId', checkJWT, PaymentController.getActiveForOrder);
router.get('/payments/:id', checkJWT, PaymentController.getById);
router.post('/payments', checkJWT, PaymentController.create);
router.post('/payments/wallet', checkJWT, PaymentController.payWithWallet);
router.put('/payments/:id/confirm', checkJWT, PaymentController.confirm);

module.exports = router;
