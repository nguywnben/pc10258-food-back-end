const { Conversation, Message, User } = require('../models');

class AdminMessageController {

    // Admin: Lấy tất cả conversations (không phân biệt user)
    static async getAllConversations(req, res) {
        try {
            console.log('--- ADMIN GET ALL CONVERSATIONS ---');
            
            const conversations = await Conversation.findAll({
                where: { type: 'support' },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url']
                    },
                    {
                        model: Message,
                        as: 'messages',
                        limit: 1,
                        order: [['created_at', 'DESC']],
                        attributes: ['content', 'sender_type', 'created_at']
                    }
                ],
                order: [['updated_at', 'DESC']]
            });

            console.log('Found conversations count:', conversations.length);
            res.status(200).json({ status: 200, data: conversations });
        } catch (error) {
            console.error('ERROR in getAllConversations:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Admin: Lấy chi tiết conversation và tất cả messages
    static async getConversationDetail(req, res) {
        try {
            const { conversationId } = req.params;
            console.log('--- ADMIN GET CONVERSATION DETAIL ---');
            console.log('Conversation ID:', conversationId);

            const conversation = await Conversation.findOne({
                where: { id: conversationId, type: 'support' },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url']
                    }
                ]
            });

            if (!conversation) {
                return res.status(404).json({ message: "Hội thoại không tồn tại" });
            }

            const messages = await Message.findAll({
                where: { conversation_id: conversationId },
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'full_name', 'avatar_url', 'role']
                    }
                ],
                order: [['created_at', 'ASC']]
            });

            res.status(200).json({ status: 200, data: { conversation, messages } });
        } catch (error) {
            console.error('ERROR in getConversationDetail:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Admin: Gửi reply
    static async sendAdminReply(req, res) {
        try {
            const { conversationId } = req.params;
            const { content } = req.body;
            const adminId = req.user.id; // Admin ID from JWT

            console.log('--- ADMIN SEND REPLY ---');
            console.log('Conversation ID:', conversationId);
            console.log('Admin ID:', adminId);
            console.log('Content:', content);

            if (!content || !content.trim()) {
                return res.status(400).json({ message: "Nội dung tin nhắn không được trống" });
            }

            const conversation = await Conversation.findOne({
                where: { id: conversationId, type: 'support' }
            });

            if (!conversation) {
                return res.status(404).json({ message: "Hội thoại không tồn tại" });
            }

            const message = await Message.create({
                conversation_id: conversationId,
                sender_id: adminId,
                sender_type: 'agent',
                content
            });

            // Cập nhật thời gian hội thoại
            conversation.changed('updated_at', true);
            await conversation.save();

            // Return message với thông tin sender
            const messageWithSender = await Message.findOne({
                where: { id: message.id },
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'full_name', 'avatar_url', 'role']
                    }
                ]
            });

            res.status(201).json({ 
                message: "Đã gửi tin nhắn", 
                data: messageWithSender 
            });
        } catch (error) {
            console.error('ERROR in sendAdminReply:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Admin: Lấy danh sách users đã chat (với thống kê)
    static async getChatStatistics(req, res) {
        try {
            console.log('--- ADMIN GET CHAT STATISTICS ---');

            const stats = await Conversation.findAll({
                where: { type: 'support' },
                attributes: ['id', 'user_id', 'title', 'created_at', 'updated_at'],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'full_name', 'email', 'phone']
                    },
                    {
                        model: Message,
                        as: 'messages',
                        attributes: ['id', 'sender_type'],
                        required: false
                    }
                ],
                raw: false,
                subQuery: false,
                order: [['updated_at', 'DESC']]
            });

            // Transform stats
            const statsData = stats.map(conv => ({
                conversationId: conv.id,
                userId: conv.user_id,
                userName: conv.user.full_name,
                userEmail: conv.user.email,
                userPhone: conv.user.phone,
                totalMessages: conv.messages.length,
                userMessages: conv.messages.filter(m => m.sender_type === 'user').length,
                agentMessages: conv.messages.filter(m => m.sender_type === 'agent').length,
                lastUpdate: conv.updated_at,
                createdAt: conv.created_at
            }));

            res.status(200).json({ status: 200, data: statsData });
        } catch (error) {
            console.error('ERROR in getChatStatistics:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AdminMessageController;
