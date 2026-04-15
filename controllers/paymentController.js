const { Payment, Order, Wallet, WalletTransaction, User } = require('../models');
const { PayOS } = require('@payos/node');
const crypto = require('crypto');
const sequelize = require('../database');

// Initialize PayOS
const payos = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

class PaymentController {

    // GET /api/payments - Lấy danh sách giao dịch của user
    static async get(req, res) {
        try {
            const { type, status, limit = 50, offset = 0 } = req.query;
            const where = { user_id: req.user.id };

            if (type) where.type = type;
            if (status) where.status = status;

            const payments = await Payment.findAndCountAll({
                where,
                include: [{ model: Order, as: 'order', attributes: ['id', 'order_code', 'total'] }],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.status(200).json({
                success: true,
                data: payments.rows,
                pagination: {
                    total: payments.count,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            console.error('❌ Get payments error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET /api/payments/:id - Lấy chi tiết thanh toán
    static async getById(req, res) {
        try {
            const payment = await Payment.findOne({
                where: { id: req.params.id, user_id: req.user.id },
                include: [{ model: Order, as: 'order' }]
            });
            if (!payment) {
                return res.status(404).json({ success: false, error: "Giao dịch không tồn tại" });
            }
            res.status(200).json({ success: true, data: payment });
        } catch (error) {
            console.error('❌ Get payment by id error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // POST /api/payments - Tạo giao dịch thanh toán PayOS
    static async create(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { type = 'deposit', amount, order_id, description, return_url, cancel_url } = req.body;
            const user_id = req.user.id;

            // === VALIDATION ===
            // Validate type
            if (!['deposit', 'order', 'upgrade'].includes(type)) {
                return res.status(400).json({ 
                    success: false, 
                    error: "Loại giao dịch không hợp lệ" 
                });
            }

            // Validate amount range
            if (!amount || amount < 2000 || amount > 50000000) {
                return res.status(400).json({ 
                    success: false, 
                    error: "Số tiền phải từ 2,000 - 50,000,000 VNĐ" 
                });
            }

            // Validate order_id if type='order'
            if (type === 'order' && order_id) {
                const order = await Order.findOne({
                    where: { id: order_id, user_id }
                });
                if (!order) {
                    return res.status(400).json({ 
                        success: false, 
                        error: "Đơn hàng không tồn tại hoặc bạn không có quyền" 
                    });
                }
                if (order.payment_method && order.status !== 'pending') {
                    return res.status(400).json({ 
                        success: false, 
                        error: "Đơn hàng đã được thanh toán" 
                    });
                }
            }

            // === CREATE PAYMENT RECORD ===
            // Generate unique reference_code: PC-PAY-{YYYYMMDD}{timestamp}
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
            const timestamp = Math.floor(Date.now() / 1000);
            const reference_code = `PC-PAY-${dateStr}${timestamp}`;

            const payment = await Payment.create({
                user_id,
                reference_code,
                type,
                method: 'PayOS',
                amount,
                status: 'pending',
                order_id: order_id || null
            }, { transaction });

            // === CREATE PAYOS PAYMENT LINK ===
            try {
                // PayOS requires description <= 25 characters
                let finalDescription = description;
                if (!finalDescription) {
                    if (type === 'deposit') {
                        finalDescription = 'Nap tien';
                    } else if (type === 'order') {
                        finalDescription = 'Thanh toan';
                    } else if (type === 'upgrade') {
                        finalDescription = 'Upgrade';
                    }
                }
                
                // Ensure description is <= 25 characters
                if (finalDescription.length > 25) {
                    finalDescription = finalDescription.substring(0, 25);
                }

                const paymentData = {
                    orderCode: parseInt(payment.id),
                    amount: parseInt(amount),
                    description: finalDescription,
                    returnUrl: return_url || `${process.env.FRONTEND_PAYMENT_CALLBACK_URL || 'http://localhost:4200/payment/callback'}?payment_id=${payment.id}`,
                    cancelUrl: return_url || `${process.env.FRONTEND_PAYMENT_CALLBACK_URL || 'http://localhost:4200/payment/callback'}?payment_id=${payment.id}`,
                    buyerName: req.user.full_name || 'Customer',
                    buyerEmail: req.user.email || '',
                    buyerPhone: req.user.phone || '',
                    expiredAt: Math.floor(Date.now() / 1000) + 3600 // 1 hour
                };

                console.log('📝 Creating PayOS link:', paymentData);
                const paymentLinkRes = await payos.paymentRequests.create(paymentData);
                console.log('✅ PayOS response:', paymentLinkRes);

                if (!paymentLinkRes || !paymentLinkRes.checkoutUrl) {
                    throw new Error('PayOS did not return checkoutUrl');
                }

                await transaction.commit();

                res.status(201).json({
                    status: 201,
                    data: {
                        id: payment.id,
                        reference_code: payment.reference_code,
                        amount: payment.amount,
                        type: payment.type,
                        status: payment.status,
                        checkout_url: paymentLinkRes.checkoutUrl,
                        expired_at: new Date(paymentData.expiredAt * 1000)
                    }
                });
            } catch (payosError) {
                console.error('❌ PayOS error:', payosError);
                // Revert payment record
                await transaction.rollback();
                return res.status(500).json({
                    status: 500,
                    error: payosError.message || 'Không thể kết nối PayOS. Thử lại sau.'
                });
            }
        } catch (error) {
            await transaction.rollback();
            console.error('❌ Create payment error:', error);
            res.status(500).json({ status: 500, error: error.message });
        }
    }

    // PUT /api/payments/:id/confirm - Xác nhận thanh toán từ PayOS
    static async confirm(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const payment_id = req.params.id;
            const { payment_id: payosPaymentId, status } = req.query;
            const user_id = req.user.id;

            // === GET PAYMENT RECORD ===
            const payment = await Payment.findOne({
                where: { id: payment_id, user_id },
                include: [{ model: Order, as: 'order' }]
            });

            if (!payment) {
                return res.status(404).json({ 
                    success: false, 
                    error: "Giao dịch không tồn tại" 
                });
            }

            // === IDEMPOTENCY CHECK ===
            if (payment.status !== 'pending') {
                // Already processed - return success for idempotency
                return res.status(200).json({
                    success: true,
                    message: "Giao dịch đã được xác nhận trước đó",
                    data: {
                        payment_id: payment.id,
                        status: payment.status
                    }
                });
            }

            // === VERIFY WITH PAYOS ===
            try {
                const paymentInfo = await payos.paymentRequests.get(parseInt(payment.id));
                console.log('✅ PayOS verify response:', paymentInfo);

                // Check if verification successful - PayOS returns status: 'PAID' or 'PENDING'
                const isSuccessful = paymentInfo && paymentInfo.status === 'PAID';
                const isCancelled = paymentInfo && paymentInfo.status === 'CANCELLED';

                if (!isSuccessful && !isCancelled) {
                    return res.status(400).json({
                        success: false,
                        error: "Xác minh thanh toán thất bại. Trạng thái: " + (paymentInfo?.status || 'UNKNOWN')
                    });
                }

                // === PROCESS SUCCESSFUL PAYMENT ===
                if (isSuccessful) {
                    await payment.update({ status: 'completed' }, { transaction });

                    if (payment.type === 'deposit') {
                        // === DEPOSIT: Add balance to wallet ===
                        let wallet = await Wallet.findOne({ 
                            where: { user_id },
                            transaction 
                        });

                        if (!wallet) {
                            wallet = await Wallet.create({ user_id, balance: 0 }, { transaction });
                        }

                        // Update wallet balance
                        await wallet.increment('balance', { 
                            by: payment.amount,
                            transaction 
                        });

                        // Create transaction record
                        await WalletTransaction.create({
                            wallet_id: wallet.id,
                            type: 'deposit',
                            amount: payment.amount,
                            description: 'Nạp tiền',
                            reference_code: payment.reference_code
                        }, { transaction });

                        await transaction.commit();

                        return res.status(200).json({
                            status: 200,
                            message: "Nạp tiền thành công!",
                            data: {
                                payment_id: payment.id,
                                reference_code: payment.reference_code,
                                status: 'completed',
                                type: 'deposit',
                                wallet_balance: wallet.balance,
                                transaction_id: wallet.transactions?.length || 0,
                                confirmation_time: new Date()
                            }
                        });
                    } else if (payment.type === 'order') {
                        // === ORDER: Deduct from wallet ===
                        const wallet = await Wallet.findOne({ where: { user_id } });

                        if (!wallet) {
                            await transaction.rollback();
                            return res.status(400).json({
                                success: false,
                                error: "Ví không tồn tại"
                            });
                        }

                        if (wallet.balance < payment.amount) {
                            await transaction.rollback();
                            return res.status(400).json({
                                success: false,
                                error: "Số dư ví không đủ"
                            });
                        }

                        // Deduct balance
                        await wallet.decrement('balance', { 
                            by: payment.amount,
                            transaction 
                        });

                        // Create transaction record
                        await WalletTransaction.create({
                            wallet_id: wallet.id,
                            type: 'payment',
                            amount: -payment.amount,
                            description: `Thanh toán đơn #${payment.order?.order_code || payment.order_id}`,
                            reference_code: payment.order_id
                        }, { transaction });

                        // Update order status
                        if (payment.order) {
                            await payment.order.update({
                                status: 'preparing',
                                payment_method: 'Ví PC10258'
                            }, { transaction });
                        }

                        await transaction.commit();

                        return res.status(200).json({
                            success: true,
                            message: "Thanh toán đơn hàng thành công!",
                            data: {
                                payment_id: payment.id,
                                reference_code: payment.reference_code,
                                status: 'completed',
                                type: 'order',
                                wallet_balance: wallet.balance,
                                confirmation_time: new Date()
                            }
                        });
                    } else if (payment.type === 'upgrade') {
                        // === UPGRADE: Update membership ===
                        const { plan_id } = req.body;
                        
                        if (!plan_id) {
                            await transaction.rollback();
                            return res.status(400).json({
                                success: false,
                                error: "plan_id được yêu cầu để nâng cấp thành viên"
                            });
                        }

                        // Get membership plan
                        const { MembershipPlan } = require('../models');
                        const plan = await MembershipPlan.findByPk(plan_id);
                        
                        if (!plan) {
                            await transaction.rollback();
                            return res.status(404).json({
                                success: false,
                                error: "Gói membership không tồn tại"
                            });
                        }

                        // Update user membership and plan
                        await User.update(
                            { 
                                membership: 'premium',
                                membership_plan_id: plan_id
                            },
                            { where: { id: user_id }, transaction }
                        );

                        // Log transaction in wallet if wallet exists
                        const wallet = await Wallet.findOne({ where: { user_id } });
                        if (wallet) {
                            await WalletTransaction.create({
                                wallet_id: wallet.id,
                                type: 'payment',
                                amount: -payment.amount,
                                description: `Nâng cấp thành viên - ${plan.name}`,
                                reference_code: payment.reference_code
                            }, { transaction });
                        }

                        await transaction.commit();

                        return res.status(200).json({
                            success: true,
                            message: "Nâng cấp thành viên thành công!",
                            data: {
                                payment_id: payment.id,
                                reference_code: payment.reference_code,
                                status: 'completed',
                                type: 'upgrade',
                                membership_plan_id: plan_id,
                                plan_name: plan.name,
                                confirmation_time: new Date()
                            }
                        });
                    }
                } else if (isCancelled) {
                    // === PAYMENT FAILED ===
                    await payment.update({ status: 'failed' }, { transaction });
                    await transaction.commit();

                    return res.status(200).json({
                        success: true,
                        message: "Thanh toán bị hủy",
                        data: {
                            payment_id: payment.id,
                            status: 'failed'
                        }
                    });
                }
            } catch (payosError) {
                console.error('❌ PayOS verification error:', payosError);
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    error: payosError.message || 'Xác minh thanh toán thất bại'
                });
            }
        } catch (error) {
            await transaction.rollback();
            console.error('❌ Confirm payment error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // POST /api/payments/wallet - Pay using wallet balance
    static async payWithWallet(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { amount, type = 'order', order_id, description } = req.body;
            const user_id = req.user.id;

            // === VALIDATION ===
            if (!amount || amount < 0 || amount > 50000000) {
                return res.status(400).json({
                    success: false,
                    error: "Số tiền không hợp lệ (0 - 50,000,000 VNĐ)"
                });
            }

            // === GET WALLET ===
            let wallet = await Wallet.findOne({
                where: { user_id },
                transaction
            });

            if (!wallet) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    error: "Ví không tồn tại"
                });
            }

            // === CHECK BALANCE ===
            if (wallet.balance < amount) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    error: `Số dư không đủ. Hiện có: ${wallet.balance.toLocaleString('vi-VN')} VNĐ, Cần: ${amount.toLocaleString('vi-VN')} VNĐ`,
                    data: {
                        current_balance: wallet.balance,
                        required_amount: amount
                    }
                });
            }

            // === CREATE PAYMENT RECORD ===
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
            const timestamp = Math.floor(Date.now() / 1000);
            const reference_code = `PC-WAL-${dateStr}${timestamp}`;

            const payment = await Payment.create({
                user_id,
                reference_code,
                type,
                method: 'Wallet',
                amount,
                status: 'completed',
                order_id: order_id || null
            }, { transaction });

            // === DEDUCT FROM WALLET ===
            await wallet.decrement('balance', {
                by: amount,
                transaction
            });

            // === CREATE WALLET TRANSACTION ===
            await WalletTransaction.create({
                wallet_id: wallet.id,
                type: 'payment',
                amount: amount,
                description: description || 'Thanh toán đơn hàng',
                reference_code: payment.reference_code
            }, { transaction });

            // === IF ORDER PAYMENT, UPDATE ORDER STATUS ===
            if (type === 'order' && order_id) {
                const order = await Order.findOne({
                    where: { id: order_id, user_id },
                    transaction
                });
                if (order) {
                    await order.update({
                        payment_method: 'Wallet',
                        status: 'confirmed'
                    }, { transaction });
                }
            }

            await transaction.commit();

            return res.status(200).json({
                status: 200,
                message: "Thanh toán bằng ví thành công!",
                data: {
                    payment_id: payment.id,
                    reference_code: payment.reference_code,
                    new_balance: wallet.balance - amount,
                    amount_paid: amount
                }
            });
        } catch (error) {
            await transaction.rollback();
            console.error('❌ Wallet payment error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = PaymentController;
