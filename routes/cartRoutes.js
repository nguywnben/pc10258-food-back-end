const express = require('express');
const router = express.Router();
const { checkJWT } = require('../controllers/authCheck');
const CartController = require('../controllers/cartController');

router.get('/cart', checkJWT, CartController.get);
router.post('/cart', checkJWT, CartController.add);
router.put('/cart/:id', checkJWT, CartController.updateQuantity);
router.delete('/cart/:id', checkJWT, CartController.remove);
router.delete('/cart', checkJWT, CartController.clear);

module.exports = router;
