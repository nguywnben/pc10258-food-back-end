const express = require('express');
const router = express.Router();
const { checkJWT, isAdmin } = require('../controllers/authCheck');
const AdminMessageController = require('../controllers/adminMessageController');

// All routes require JWT auth + Admin role
router.use(checkJWT, isAdmin);

// Get all support conversations
router.get('/conversations', AdminMessageController.getAllConversations);

// Get conversation detail with all messages
router.get('/conversations/:conversationId', AdminMessageController.getConversationDetail);

// Send reply to conversation
router.post('/conversations/:conversationId/reply', AdminMessageController.sendAdminReply);

// Get chat statistics
router.get('/statistics', AdminMessageController.getChatStatistics);

module.exports = router;
