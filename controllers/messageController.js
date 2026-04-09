const { Conversation, Message, User } = require('../models');

class MessageController {

    // Lấy danh sách hội thoại
    static async getConversations(req, res) {
        try {
            const conversations = await Conversation.findAll({
                where: { user_id: req.user.id },
                include: [{
                    model: Message,
                    as: 'messages',
                    limit: 1,
                    order: [['created_at', 'DESC']],
                    attributes: ['content', 'sender_type', 'created_at']
                }],
                order: [['updated_at', 'DESC']]
            });
            res.status(200).json({ status: 200, data: conversations });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy tin nhắn trong hội thoại
    static async getMessages(req, res) {
        try {
            const conversation = await Conversation.findOne({
                where: { id: req.params.conversationId, user_id: req.user.id }
            });
            if (!conversation) {
                return res.status(404).json({ message: "Hội thoại không tồn tại" });
            }

            const messages = await Message.findAll({
                where: { conversation_id: req.params.conversationId },
                include: [{ model: User, as: 'sender', attributes: ['id', 'full_name', 'avatar_url'] }],
                order: [['created_at', 'ASC']]
            });

            res.status(200).json({ status: 200, data: { conversation, messages } });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Gửi tin nhắn
    static async send(req, res) {
        try {
            const { conversation_id, content } = req.body;

            const conversation = await Conversation.findOne({
                where: { id: conversation_id, user_id: req.user.id }
            });
            if (!conversation) {
                return res.status(404).json({ message: "Hội thoại không tồn tại" });
            }

            const message = await Message.create({
                conversation_id,
                sender_id: req.user.id,
                sender_type: 'user',
                content
            });

            // Cập nhật thời gian hội thoại
            conversation.changed('updated_at', true);
            await conversation.save();

            res.status(201).json({ message: "Đã gửi tin nhắn", data: message });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Tạo hội thoại mới (ví dụ: chat với hỗ trợ)
    static async createConversation(req, res) {
        try {
            const { title, type = 'support' } = req.body;

            const conversation = await Conversation.create({
                user_id: req.user.id,
                title: title || 'Hỗ trợ',
                type,
                avatar_text: type === 'support' ? 'CS' : null
            });

            res.status(201).json({ message: "Tạo hội thoại thành công", data: conversation });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = MessageController;
