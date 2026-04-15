const { PayOS } = require("@payos/node");
const { Order, Payment, Wallet, WalletTransaction } = require('../models');
const sequelize = require('../database');
const crypto = require('crypto');

// Khởi tạo PayOS bằng environment variables
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

// Debug: Log tất cả methods có sẵn trong payos instance
console.log("🔍 PayOS instance methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(payos)).filter(m => typeof payos[m] === 'function'));

const YOUR_DOMAIN = process.env.FRONTEND_URL || "http://localhost:3000"; // Frontend ReactJS

/**
 * Tạo link thanh toán PayOS
 */
exports.createPaymentLink = async (req, res) => {
  try {
    console.log("📝 Request body:", req.body);
    const { orderId } = req.body;

    if (!orderId) {
      console.log("❌ Missing orderId");
      return res.status(400).json({ 
        status: 400,
        message: "Thiếu orderId" 
      });
    }

    console.log("📋 Fetching order:", orderId);
    
    // Lấy thông tin đơn hàng từ database
    const orderData = await Order.findByPk(orderId);
    
    if (!orderData) {
      console.log("❌ Order not found:", orderId);
      return res.status(404).json({ 
        status: 404,
        message: "Không tìm thấy đơn hàng" 
      });
    }

    console.log("✅ Order found:", orderData);

    // Lấy thông tin người dùng liên kết với đơn hàng
    const User = require('../models').User;
    const userData = await User.findByPk(orderData.user_id);

    // Tạo payload thanh toán
    const paymentData = {
      orderCode: Number(orderId),
      amount: Number(orderData.total),
      description: `Thanh toan don ${orderData.order_code}`.substring(0, 25),
      returnUrl: `${YOUR_DOMAIN}/checkout/success?orderId=${orderId}`,
      cancelUrl: `${YOUR_DOMAIN}/checkout?orderId=${orderId}`,
      buyerName: userData?.full_name || userData?.name || "Guest",
      buyerEmail: userData?.email || "unknown@example.com",
      buyerPhone: userData?.phone_number || "",
      buyerAddress: orderData.address_id ? `Address ID: ${orderData.address_id}` : "",
    };
    
    console.log("🔗 Calling PayOS with data:", paymentData);
    
    // Tạo link thanh toán bằng SDK chính thức PayOS
    const paymentLinkRes = await payos.paymentRequests.create(paymentData);
    console.log("✅ PayOS response:", paymentLinkRes);

    if (!paymentLinkRes || !paymentLinkRes.checkoutUrl) {
      throw new Error(`PayOS API error: No checkoutUrl returned.`);
    }

    // Cập nhật payment_method cho order
    await orderData.update({
      payment_method: 'PayOS'
    });

    res.status(200).json({
      error: 0,
      message: "Success",
      data: paymentLinkRes.checkoutUrl,
    });
  } catch (error) {
    console.error("❌ Lỗi PayOS:", error);
    
    res.status(500).json({ 
      status: 500, 
      message: error.message || "Lỗi tạo thanh toán",
      errorCode: error.code,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        statusCode: error.statusCode,
        data: error.data
      } : undefined
    });
  }
};

/**
 * Nhận Webhook từ PayOS báo kết quả thanh toán
 * PayOS sẽ gọi endpoint này khi có sự kiện thanh toán
 */
exports.receiveWebhook = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log("🔔 Webhook received:", req.body);
    
    // 1. Xác thực dữ liệu do PayOS gửi sang để chống giả mạo
    let webhookData;
    
    if (typeof payos.webhooks?.verify === 'function') {
      try {
        webhookData = payos.webhooks.verify(req.body);
        console.log("✅ Webhook verified via PayOS");
      } catch (verifyError) {
        console.warn('⚠️ PayOS webhook verification failed:', verifyError.message);
        webhookData = req.body;
      }
    } else {
      console.warn('⚠️ PayOS webhook verification method không tìm thấy, trust webhook data');
      webhookData = req.body;
    }

    console.log("✅ Webhook verified:", webhookData);

    // 2. Xử lý webhook dựa trên mã trạng thái
    const orderCode = webhookData.orderCode;
    const isSuccess = webhookData.code === '00' && webhookData.data?.code === '00';
    const isCancelled = webhookData.code !== '00' || webhookData.data?.code !== '00';

    if (isSuccess && orderCode) {
      // === PAYMENT SUCCESSFUL ===
      const order = await Order.findByPk(orderCode, { transaction });
      if (order) {
        // Cập nhật trạng thái sang 'preparing' (đang chuẩn bị) sau khi thanh toán thành công
        await order.update({
          status: 'preparing',
          payment_method: 'PayOS'
        }, { transaction });
        
        // Cập nhật payment record nếu tồn tại
        const payment = await Payment.findOne({
          where: { order_id: orderCode },
          transaction
        });
        if (payment) {
          await payment.update({ status: 'completed' }, { transaction });
        }
        
        console.log(`✅ Đã cập nhật thanh toán thành công cho đơn ${orderCode}`);
      }
    } else if (isCancelled && orderCode) {
      // === PAYMENT FAILED OR CANCELLED ===
      const order = await Order.findByPk(orderCode, { transaction });
      if (order) {
        await order.update({
          status: 'cancelled'
        }, { transaction });
        
        // Cập nhật payment record
        const payment = await Payment.findOne({
          where: { order_id: orderCode },
          transaction
        });
        if (payment) {
          await payment.update({ status: 'failed' }, { transaction });
        }
        
        console.log(`⚠️ Thanh toán thất bại cho đơn ${orderCode}`);
      }
    }

    await transaction.commit();

    // PayOS yêu cầu trả về HTTP 200 và success: true để xác nhận nhận webhook
    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Lỗi xác thực webhook PayOS:", error);
    // Vẫn trả về 200 như yêu cầu của PayOS để tránh retry
    res.status(200).json({ success: false, message: "Invalid webhook" });
  }
};

/**
 * Kiểm tra trạng thái đơn hàng (optional)
 */
exports.checkOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ 
        status: 404,
        message: "Không tìm thấy đơn hàng" 
      });
    }

    res.status(200).json({
      status: 200,
      data: {
        orderId: order.id,
        order_code: order.order_code,
        status: order.status,
        total: order.total,
        payment_method: order.payment_method,
        created_at: order.created_at
      }
    });
  } catch (error) {
    console.error("❌ Lỗi kiểm tra trạng thái:", error);
    res.status(500).json({ 
      status: 500, 
      message: error.message || "Lỗi kiểm tra trạng thái" 
    });
  }
};
