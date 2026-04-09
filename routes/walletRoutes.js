const express = require('express');
const router = express.Router();
const { checkJWT } = require('../controllers/authCheck');
const WalletController = require('../controllers/walletController');

router.get('/wallet', checkJWT, WalletController.get);
router.get('/wallet/transactions', checkJWT, WalletController.getTransactions);
router.post('/wallet/deposit', checkJWT, WalletController.deposit);

module.exports = router;
