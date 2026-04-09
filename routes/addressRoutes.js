const express = require('express');
const router = express.Router();
const { checkJWT } = require('../controllers/authCheck');
const AddressController = require('../controllers/addressController');

// Tất cả đều cần đăng nhập
router.get('/addresses', checkJWT, AddressController.get);
router.post('/addresses', checkJWT, AddressController.create);
router.put('/addresses/:id', checkJWT, AddressController.update);
router.delete('/addresses/:id', checkJWT, AddressController.delete);

module.exports = router;
