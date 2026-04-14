const { Order, OrderItem, CartItem, Product, Address, User } = require('../models');
const sequelize = require('../database');

class OrderController {

    // Lấy danh sách đơn hàng của user
    static async get(req, res) {
        try {
            const { status } = req.query;
            const where = { user_id: req.user.id };
            if (status) where.status = status;

            const orders = await Order.findAll({
                where,
                include: [
                    { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'image_url'] }] },
                    { model: Address, as: 'address' }
                ],
                order: [['created_at', 'DESC']]
            });

            res.status(200).json({ status: 200, data: orders });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy chi tiết đơn hàng
    static async getById(req, res) {
        try {
            const order = await Order.findOne({
                where: { id: req.params.id, user_id: req.user.id },
                include: [
                    { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
                    { model: Address, as: 'address' }
                ]
            });
            if (!order) {
                return res.status(404).json({ message: "Đơn hàng không tồn tại" });
            }
            res.status(200).json({ status: 200, data: order });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Tạo đơn hàng từ giỏ hàng
    static async create(req, res) {
        const t = await sequelize.transaction();
        try {
            const { address_id, payment_method, note, promo_code } = req.body;

            // Lấy giỏ hàng
            const cartItems = await CartItem.findAll({
                where: { user_id: req.user.id },
                include: [{ model: Product, as: 'product' }],
                transaction: t
            });

            if (cartItems.length === 0) {
                await t.rollback();
                return res.status(400).json({ message: "Giỏ hàng trống!" });
            }

            // Tính tổng
            let subtotal = 0;
            cartItems.forEach(item => {
                subtotal += item.product.price * item.quantity;
            });

            const discount = 0; // TODO: áp dụng promo_code
            const delivery_fee = subtotal >= 100000 ? 0 : 15000;
            const total = subtotal - discount + delivery_fee;

            // Tạo mã đơn
            const lastOrder = await Order.findOne({ order: [['id', 'DESC']], transaction: t });
            const nextNum = lastOrder ? lastOrder.id + 1 : 1;
            const order_code = `PC-${String(nextNum).padStart(4, '0')}`;

            // Tạo đơn hàng
            const order = await Order.create({
                user_id: req.user.id,
                order_code,
                status: 'pending',
                payment_method,
                subtotal,
                discount,
                delivery_fee,
                total,
                address_id,
                note
            }, { transaction: t });

            // Tạo chi tiết đơn hàng
            const orderItems = cartItems.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                product_name: item.product.name,
                quantity: item.quantity,
                unit_price: item.product.price,
                subtotal: item.product.price * item.quantity
            }));
            await OrderItem.bulkCreate(orderItems, { transaction: t });

            // Xóa giỏ hàng
            await CartItem.destroy({ where: { user_id: req.user.id }, transaction: t });

            await t.commit();

            res.status(201).json({
                message: "Đặt hàng thành công!",
                data: { order, items: orderItems }
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({ error: error.message });
        }
    }

    // Hủy đơn hàng
    static async cancel(req, res) {
        try {
            const order = await Order.findOne({
                where: { id: req.params.id, user_id: req.user.id }
            });
            if (!order) {
                return res.status(404).json({ message: "Đơn hàng không tồn tại" });
            }
            if (order.status !== 'pending') {
                return res.status(400).json({ message: "Chỉ có thể hủy đơn đang chờ xử lý" });
            }
            order.status = 'cancelled';
            await order.save();
            res.status(200).json({ message: "Đã hủy đơn hàng" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Lấy tất cả đơn hàng
    static async getAll(req, res) {
        try {
            const orders = await Order.findAll({
                include: [
                    { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
                    { model: OrderItem, as: 'items' },
                    { model: Address, as: 'address' }
                ],
                order: [['created_at', 'DESC']]
            });
            res.status(200).json({ status: 200, data: orders });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Cập nhật trạng thái đơn hàng
    static async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const order = await Order.findByPk(req.params.id);
            if (!order) {
                return res.status(404).json({ message: "Đơn hàng không tồn tại" });
            }
            order.status = status;
            await order.save();
            res.status(200).json({ message: "Cập nhật trạng thái thành công", data: order });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = OrderController;
