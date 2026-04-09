const { CartItem, Product } = require('../models');

class CartController {

    // Lấy giỏ hàng
    static async get(req, res) {
        try {
            const items = await CartItem.findAll({
                where: { user_id: req.user.id },
                include: [{ model: Product, as: 'product' }],
                order: [['created_at', 'ASC']]
            });

            // Tính tổng
            let subtotal = 0;
            items.forEach(item => {
                subtotal += item.product.price * item.quantity;
            });

            res.status(200).json({
                status: 200,
                data: {
                    items,
                    subtotal,
                    count: items.length
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Thêm vào giỏ (hoặc tăng số lượng nếu đã có)
    static async add(req, res) {
        try {
            const { product_id, quantity = 1 } = req.body;

            const existing = await CartItem.findOne({
                where: { user_id: req.user.id, product_id }
            });

            if (existing) {
                existing.quantity += quantity;
                await existing.save();
                return res.status(200).json({ message: "Đã cập nhật số lượng", data: existing });
            }

            const item = await CartItem.create({
                user_id: req.user.id,
                product_id,
                quantity
            });

            res.status(201).json({ message: "Đã thêm vào giỏ hàng", data: item });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Cập nhật số lượng
    static async updateQuantity(req, res) {
        try {
            const { quantity } = req.body;
            const item = await CartItem.findOne({
                where: { id: req.params.id, user_id: req.user.id }
            });

            if (!item) {
                return res.status(404).json({ message: "Không tìm thấy trong giỏ hàng" });
            }

            if (quantity <= 0) {
                await item.destroy();
                return res.status(200).json({ message: "Đã xóa khỏi giỏ hàng" });
            }

            item.quantity = quantity;
            await item.save();
            res.status(200).json({ message: "Đã cập nhật số lượng", data: item });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Xóa khỏi giỏ
    static async remove(req, res) {
        try {
            const result = await CartItem.destroy({
                where: { id: req.params.id, user_id: req.user.id }
            });
            if (!result) {
                return res.status(404).json({ message: "Không tìm thấy trong giỏ hàng" });
            }
            res.status(200).json({ message: "Đã xóa khỏi giỏ hàng" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Xóa toàn bộ giỏ hàng
    static async clear(req, res) {
        try {
            await CartItem.destroy({ where: { user_id: req.user.id } });
            res.status(200).json({ message: "Đã xóa toàn bộ giỏ hàng" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CartController;
