const { Payment, Order, Wallet, WalletTransaction, User } = require('../models');
const { PayOS } = require('@payos/node');
const crypto = require('crypto');
const { Op } = require('sequelize');
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
                    cancelUrl: cancel_url || `${process.env.FRONTEND_PAYMENT_CALLBACK_URL || 'http://localhost:4200/payment/callback'}?payment_id=${payment.id}`,
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

                // Persist checkout_url & expires_at so we can resume the session
                // when the user closes the PayOS tab without cancelling.
                const expiresAt = new Date(paymentData.expiredAt * 1000);
                await payment.update({
                    checkout_url: paymentLinkRes.checkoutUrl,
                    expires_at: expiresAt
                }, { transaction });

                // For order payments, mark older pending payments of this order as superseded
                // so /active-payment returns only the latest link.
                if (type === 'order' && order_id) {
                    await Payment.update(
                        { status: 'cancelled' },
                        {
                            where: {
                                order_id,
                                user_id,
                                status: 'pending',
                                id: { [Op.ne]: payment.id }
                            },
                            transaction
                        }
                    );
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
                        expired_at: expiresAt
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
            // Accept PayOS return-url hints from either query or body so that the
            // frontend can forward them after being redirected back from PayOS.
            const urlStatus = (req.body?.status || req.query?.status || '').toString().toUpperCase();
            const urlCancel = (req.body?.cancel ?? req.query?.cancel);
            const isCancelHint = urlCancel === true || urlCancel === 'true';
            const user_id = req.user.id;

            // === GET PAYMENT RECORD ===
            const payment = await Payment.findOne({
                where: { id: payment_id, user_id },
                include: [{ model: Order, as: 'order' }]
            });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    error: "Giao dịch không tồn tại",
                    message: "Giao dịch không tồn tại"
                });
            }

            // === IDEMPOTENCY CHECK ===
            if (payment.status !== 'pending') {
                // Already processed - return success for idempotency
                return res.status(200).json({
                    success: true,
                    status: 200,
                    message: "Giao dịch đã được xác nhận trước đó",
                    data: {
                        payment_id: payment.id,
                        reference_code: payment.reference_code,
                        status: payment.status,
                        type: payment.type,
                        amount: payment.amount,
                        order_id: payment.order_id
                    }
                });
            }

            // === VERIFY WITH PAYOS (with retry for race with PayOS backend) ===
            try {
                const sleep = (ms) => new Promise(r => setTimeout(r, ms));
                let paymentInfo = null;
                let lastError = null;
                // PayOS đôi khi trả PROCESSING trong 1-2 giây đầu sau khi user
                // được redirect về. Retry tối đa ~4s để chắc chắn trạng thái cuối.
                const maxAttempts = 4;
                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                    try {
                        paymentInfo = await payos.paymentRequests.get(parseInt(payment.id));
                        console.log(`✅ PayOS verify response (attempt ${attempt}):`, paymentInfo?.status);
                        if (paymentInfo && (paymentInfo.status === 'PAID' || paymentInfo.status === 'CANCELLED')) {
                            break;
                        }
                    } catch (sdkErr) {
                        lastError = sdkErr;
                        console.warn(`⚠️ PayOS get attempt ${attempt} failed:`, sdkErr?.message || sdkErr);
                    }
                    if (attempt < maxAttempts) await sleep(800 * attempt);
                }

                // Check if verification successful - PayOS returns status: 'PAID' | 'CANCELLED' | 'PROCESSING' | 'PENDING' | ...
                let isSuccessful = paymentInfo && paymentInfo.status === 'PAID';
                let isCancelled = paymentInfo && paymentInfo.status === 'CANCELLED';

                // Fallback: nếu PayOS SDK không trả được kết quả cuối cùng
                // (mạng lỗi / PROCESSING kéo dài) nhưng PayOS đã redirect user
                // kèm theo status rõ ràng trên URL thì tin theo URL đó.
                if (!isSuccessful && !isCancelled) {
                    if (urlStatus === 'PAID' && !isCancelHint) {
                        console.warn('⚠️ Dùng status=PAID từ return URL vì PayOS SDK chưa xác nhận.');
                        isSuccessful = true;
                    } else if (urlStatus === 'CANCELLED' || isCancelHint) {
                        console.warn('⚠️ Dùng status=CANCELLED từ return URL vì PayOS SDK chưa xác nhận.');
                        isCancelled = true;
                    }
                }

                if (!isSuccessful && !isCancelled) {
                    const payosStatus = paymentInfo?.status || 'UNKNOWN';
                    const errMsg = lastError
                        ? `Không kết nối được PayOS: ${lastError.message || lastError}`
                        : `Xác minh thanh toán thất bại. Trạng thái PayOS: ${payosStatus}`;
                    return res.status(400).json({
                        success: false,
                        error: errMsg,
                        message: errMsg,
                        data: { payos_status: payosStatus }
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
                        // === ORDER paid via PayOS ===
                        // Tiền đã được khách chuyển vào PayOS, KHÔNG trừ ví.
                        // Chỉ cần cập nhật đơn sang trạng thái đã thanh toán.
                        if (payment.order) {
                            await payment.order.update({
                                status: 'preparing',
                                payment_method: 'PayOS'
                            }, { transaction });
                        }

                        await transaction.commit();

                        return res.status(200).json({
                            success: true,
                            status: 200,
                            message: "Thanh toán đơn hàng thành công!",
                            data: {
                                payment_id: payment.id,
                                reference_code: payment.reference_code,
                                status: 'completed',
                                type: 'order',
                                order_id: payment.order_id,
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
                    // === PAYMENT CANCELLED ===
                    await payment.update({ status: 'cancelled' }, { transaction });

                    // Auto-cancel the related order so the user doesn't see a
                    // dangling "Thanh toán" button for an order they've abandoned.
                    let orderCancelled = false;
                    if (payment.type === 'order' && payment.order && payment.order.status === 'pending') {
                        await payment.order.update({ status: 'cancelled' }, { transaction });
                        orderCancelled = true;
                    }

                    await transaction.commit();

                    return res.status(200).json({
                        success: true,
                        message: orderCancelled
                            ? "Thanh toán bị hủy, đơn hàng đã được tự động hủy"
                            : "Thanh toán bị hủy",
                        data: {
                            payment_id: payment.id,
                            status: 'cancelled',
                            order_cancelled: orderCancelled
                        }
                    });
                }
            } catch (payosError) {
                console.error('❌ PayOS verification error:', payosError);
                await transaction.rollback();
                const errMsg = payosError.message || 'Xác minh thanh toán thất bại';
                return res.status(400).json({
                    success: false,
                    error: errMsg,
                    message: errMsg
                });
            }
        } catch (error) {
            await transaction.rollback();
            console.error('❌ Confirm payment error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                message: error.message
            });
        }
    }

    // GET /api/payments/active/order/:orderId - Lấy link PayOS đang mở của đơn
    // Dùng khi user bấm "Thanh toán" ở trang orders để biết có nên mở thẳng
    // PayOS hay đưa về trang /payment.
    static async getActiveForOrder(req, res) {
        try {
            const orderId = parseInt(req.params.orderId, 10);
            const user_id = req.user.id;

            if (!orderId) {
                return res.status(400).json({ success: false, error: "orderId không hợp lệ" });
            }

            const order = await Order.findOne({ where: { id: orderId, user_id } });
            if (!order) {
                return res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
            }

            if (order.status !== 'pending') {
                return res.status(200).json({
                    status: 200,
                    data: { active: false, reason: 'order_not_pending' }
                });
            }

            const payment = await Payment.findOne({
                where: {
                    user_id,
                    order_id: orderId,
                    status: 'pending',
                    type: 'order'
                },
                order: [['created_at', 'DESC']]
            });

            if (!payment || !payment.checkout_url) {
                return res.status(200).json({
                    status: 200,
                    data: { active: false, reason: 'no_payment' }
                });
            }

            if (payment.expires_at && new Date(payment.expires_at).getTime() <= Date.now()) {
                // PayOS link đã hết hạn -> đánh dấu cancelled để lần sau có thể tạo link mới sạch sẽ
                await payment.update({ status: 'cancelled' });
                return res.status(200).json({
                    status: 200,
                    data: { active: false, reason: 'expired' }
                });
            }

            return res.status(200).json({
                status: 200,
                data: {
                    active: true,
                    payment_id: payment.id,
                    reference_code: payment.reference_code,
                    checkout_url: payment.checkout_url,
                    expires_at: payment.expires_at
                }
            });
        } catch (error) {
            console.error('❌ getActiveForOrder error:', error);
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
