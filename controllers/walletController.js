const { Wallet, WalletTransaction, User } = require('../models');
const sequelize = require('../database');

class WalletController {

    // GET /api/wallet - Lấy thông tin ví + số dư
    static async get(req, res) {
        try {
            let wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            if (!wallet) {
                wallet = await Wallet.create({ user_id: req.user.id, balance: 0 });
            }
            res.status(200).json({ 
                success: true,
                data: {
                    id: wallet.id,
                    user_id: wallet.user_id,
                    balance: wallet.balance,
                    updated_at: wallet.updated_at
                }
            });
        } catch (error) {
            console.error('❌ Get wallet error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET /api/wallet/transactions - Lấy lịch sử giao dịch
    static async getTransactions(req, res) {
        try {
            const { days, limit = 50, offset = 0 } = req.query;
            
            const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            if (!wallet) {
                return res.status(404).json({ success: false, error: "Ví không tồn tại" });
            }

            const where = { wallet_id: wallet.id };

            // Filter by days if provided
            if (days) {
                const { Op } = require('sequelize');
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - parseInt(days));
                where.created_at = { [Op.gte]: startDate };
            }

            const { count, rows } = await WalletTransaction.findAndCountAll({
                where,
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.status(200).json({ 
                success: true,
                data: rows.map(t => ({
                    id: t.id,
                    type: t.type,
                    amount: t.amount,
                    description: t.description,
                    reference_code: t.reference_code,
                    created_at: t.created_at
                })),
                pagination: {
                    total: count,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            console.error('❌ Get transactions error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // POST /api/wallet/deposit (Legacy) - Nạp tiền vào ví (direct method, bypasses PayOS)
    // Note: This is for backward compatibility. Recommended flow is: 
    // 1. POST /api/payments (type='deposit') -> get PayOS checkout URL
    // 2. User completes payment on PayOS
    // 3. PUT /api/payments/:id/confirm -> updates wallet
    static async deposit(req, res) {
        const t = await sequelize.transaction();
        try {
            const { amount, method, reference_code } = req.body;

            // Validate amount
            if (!amount || amount < 10000) {
                await t.rollback();
                return res.status(400).json({ 
                    success: false,
                    error: "Số tiền nạp tối thiểu 10,000 VNĐ" 
                });
            }

            if (amount > 50000000) {
                await t.rollback();
                return res.status(400).json({ 
                    success: false,
                    error: "Số tiền nạp tối đa 50,000,000 VNĐ" 
                });
            }

            let wallet = await Wallet.findOne({ 
                where: { user_id: req.user.id }, 
                transaction: t 
            });
            
            if (!wallet) {
                wallet = await Wallet.create(
                    { user_id: req.user.id, balance: 0 }, 
                    { transaction: t }
                );
            }

            // Increment balance safely with lock
            wallet = await wallet.increment('balance', { 
                by: amount,
                transaction: t
            });

            const newBalance = wallet.balance + amount; // Get updated balance

            const transaction_record = await WalletTransaction.create({
                wallet_id: wallet.id,
                type: 'deposit',
                amount: amount,
                description: 'Nạp tiền',
                reference_code: reference_code || null
            }, { transaction: t });

            await t.commit();

            res.status(200).json({
                success: true,
                message: "Nạp tiền thành công!",
                data: { 
                    balance: newBalance,
                    transaction_id: transaction_record.id
                }
            });
        } catch (error) {
            await t.rollback();
            console.error('❌ Deposit error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = WalletController;
