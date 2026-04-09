const { Payment, Order } = require('../models');

class PaymentController {

    // Lấy lịch sử thanh toán
    static async get(req, res) {
        try {
            const payments = await Payment.findAll({
                where: { user_id: req.user.id },
                include: [{ model: Order, as: 'order', attributes: ['id', 'order_code', 'total'] }],
                order: [['created_at', 'DESC']]
            });
            res.status(200).json({ status: 200, data: payments });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy chi tiết thanh toán
    static async getById(req, res) {
        try {
            const payment = await Payment.findOne({
                where: { id: req.params.id, user_id: req.user.id },
                include: [{ model: Order, as: 'order' }]
            });
            if (!payment) {
                return res.status(404).json({ message: "Giao dịch không tồn tại" });
            }
            res.status(200).json({ status: 200, data: payment });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Tạo giao dịch thanh toán
    static async create(req, res) {
        try {
            const { type, method, amount, order_id } = req.body;

            // Tạo mã giao dịch
            const lastPayment = await Payment.findOne({ order: [['id', 'DESC']] });
            const nextNum = lastPayment ? lastPayment.id + 1 : 1;
            const reference_code = `PC-PAY-${String(nextNum).padStart(5, '0')}`;

            const payment = await Payment.create({
                user_id: req.user.id,
                reference_code,
                type,
                method,
                amount,
                status: 'pending',
                order_id: order_id || null
            });

            res.status(201).json({
                message: "Tạo giao dịch thành công",
                data: payment
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Xác nhận thanh toán (demo)
    static async confirm(req, res) {
        try {
            const payment = await Payment.findOne({
                where: { id: req.params.id, user_id: req.user.id }
            });
            if (!payment) {
                return res.status(404).json({ message: "Giao dịch không tồn tại" });
            }
            if (payment.status !== 'pending') {
                return res.status(400).json({ message: "Giao dịch đã được xử lý" });
            }

            payment.status = 'completed';
            await payment.save();

            res.status(200).json({ message: "Thanh toán thành công!", data: payment });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = PaymentController;
