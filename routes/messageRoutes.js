const express = require('express');
const router = express.Router();
const { checkJWT } = require('../controllers/authCheck');
const MessageController = require('../controllers/messageController');

router.get('/conversations', checkJWT, MessageController.getConversations);
router.get('/conversations/:conversationId/messages', checkJWT, MessageController.getMessages);
router.post('/conversations', checkJWT, MessageController.createConversation);
router.post('/messages', checkJWT, MessageController.send);

module.exports = router;
