const express = require('express');
const router = express.Router();
const { checkJWT, isAdmin } = require('../controllers/authCheck');
const CategoryController = require('../controllers/categoryController');

// Public - Lấy danh sách danh mục (client xem menu)
router.get('/categories', CategoryController.get);
router.get('/categories/:id', CategoryController.getById);

// Admin
router.post('/categories', checkJWT, isAdmin, CategoryController.create);
router.put('/categories/:id', checkJWT, isAdmin, CategoryController.update);
router.delete('/categories/:id', checkJWT, isAdmin, CategoryController.delete);

module.exports = router;