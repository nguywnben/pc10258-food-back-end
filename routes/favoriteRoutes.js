const express = require('express');
const router = express.Router();
const { checkJWT } = require('../controllers/authCheck');
const FavoriteController = require('../controllers/favoriteController');

router.get('/favorites', checkJWT, FavoriteController.get);
router.post('/favorites', checkJWT, FavoriteController.add);
router.delete('/favorites/:productId', checkJWT, FavoriteController.remove);

module.exports = router;
