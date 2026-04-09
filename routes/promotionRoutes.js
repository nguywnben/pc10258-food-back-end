const express = require('express');
const router = express.Router();
const { checkJWT, isAdmin } = require('../controllers/authCheck');
const PromotionController = require('../controllers/promotionController');

// Client - kiểm tra mã giảm giá
router.post('/promotions/validate', checkJWT, PromotionController.validate);

// Admin
router.get('/promotions', checkJWT, isAdmin, PromotionController.getAll);
router.post('/promotions', checkJWT, isAdmin, PromotionController.create);
router.put('/promotions/:id', checkJWT, isAdmin, PromotionController.update);
router.delete('/promotions/:id', checkJWT, isAdmin, PromotionController.delete);

module.exports = router;
