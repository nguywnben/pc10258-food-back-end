const { Wallet, WalletTransaction } = require('../models');
const sequelize = require('../database');

class WalletController {

    // Lấy thông tin ví + số dư
    static async get(req, res) {
        try {
            let wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            if (!wallet) {
                wallet = await Wallet.create({ user_id: req.user.id, balance: 0 });
            }
            res.status(200).json({ status: 200, data: wallet });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy lịch sử giao dịch
    static async getTransactions(req, res) {
        try {
            const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            if (!wallet) {
                return res.status(404).json({ message: "Ví không tồn tại" });
            }

            const { days } = req.query;
            const where = { wallet_id: wallet.id };

            if (days) {
                const { Op } = require('sequelize');
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - parseInt(days));
                where.created_at = { [Op.gte]: startDate };
            }

            const transactions = await WalletTransaction.findAll({
                where,
                order: [['created_at', 'DESC']]
            });

            res.status(200).json({ status: 200, data: transactions });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Nạp tiền vào ví
    static async deposit(req, res) {
        const t = await sequelize.transaction();
        try {
            const { amount, method } = req.body;

            if (!amount || amount < 10000) {
                await t.rollback();
                return res.status(400).json({ message: "Số tiền nạp tối thiểu 10.000₫" });
            }

            let wallet = await Wallet.findOne({ where: { user_id: req.user.id }, transaction: t });
            if (!wallet) {
                wallet = await Wallet.create({ user_id: req.user.id, balance: 0 }, { transaction: t });
            }

            wallet.balance += amount;
            await wallet.save({ transaction: t });

            await WalletTransaction.create({
                wallet_id: wallet.id,
                type: 'deposit',
                amount: amount,
                description: 'Nạp tiền',
                reference_code: null
            }, { transaction: t });

            await t.commit();

            res.status(200).json({
                message: "Nạp tiền thành công!",
                data: { balance: wallet.balance }
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = WalletController;
