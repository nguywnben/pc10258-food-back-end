const express = require('express');
const UserController = require('../controllers/userController');
const { checkJWT, isAdmin } = require('../controllers/authCheck');

const router = express.Router();

// Public
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Cần đăng nhập
router.get('/profile', checkJWT, UserController.getProfile);
router.put('/profile', checkJWT, UserController.updateProfile);
router.put('/change-password', checkJWT, UserController.changePassword);

// Admin
router.get('/', checkJWT, isAdmin, UserController.getAll);
router.delete('/:id', checkJWT, isAdmin, UserController.delete);

module.exports = router;
