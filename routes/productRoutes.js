const express = require('express');
const router = express.Router();
const { checkJWT, isAdmin } = require('../controllers/authCheck');
const ProductController = require('../controllers/productController');

// Public - Xem sản phẩm
router.get('/products', ProductController.get);
router.get('/products/:id', ProductController.getById);
router.get('/products/category/:categoryId', ProductController.getByCategory);

// Admin
router.post('/products', checkJWT, isAdmin, ProductController.create);
router.put('/products/:id', checkJWT, isAdmin, ProductController.update);
router.delete('/products/:id', checkJWT, isAdmin, ProductController.delete);

module.exports = router;
