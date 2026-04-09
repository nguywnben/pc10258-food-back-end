const { Promotion } = require('../models');
const { Op } = require('sequelize');

class PromotionController {

    // Kiểm tra mã giảm giá
    static async validate(req, res) {
        try {
            const { code, order_total } = req.body;

            const promo = await Promotion.findOne({
                where: {
                    code,
                    start_date: { [Op.lte]: new Date() },
                    end_date: { [Op.gte]: new Date() }
                }
            });

            if (!promo) {
                return res.status(404).json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" });
            }

            if (promo.max_uses && promo.used_count >= promo.max_uses) {
                return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });
            }

            if (order_total && order_total < promo.min_order) {
                return res.status(400).json({
                    message: `Đơn hàng tối thiểu ${promo.min_order.toLocaleString()}₫ để áp dụng mã này`
                });
            }

            let discount = 0;
            if (promo.discount_type === 'fixed') {
                discount = promo.discount_value;
            } else {
                discount = Math.floor((order_total || 0) * promo.discount_value / 100);
            }

            res.status(200).json({
                status: 200,
                data: {
                    code: promo.code,
                    description: promo.description,
                    discount_type: promo.discount_type,
                    discount_value: promo.discount_value,
                    discount_amount: discount
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Lấy tất cả promotions
    static async getAll(req, res) {
        try {
            const promotions = await Promotion.findAll({ order: [['created_at', 'DESC']] });
            res.status(200).json({ status: 200, data: promotions });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Tạo promotion
    static async create(req, res) {
        try {
            const promo = await Promotion.create(req.body);
            res.status(201).json({ message: "Tạo mã giảm giá thành công", data: promo });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Cập nhật promotion
    static async update(req, res) {
        try {
            const promo = await Promotion.findByPk(req.params.id);
            if (!promo) {
                return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
            }
            await promo.update(req.body);
            res.status(200).json({ message: "Cập nhật thành công", data: promo });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Xóa promotion
    static async delete(req, res) {
        try {
            const promo = await Promotion.findByPk(req.params.id);
            if (!promo) {
                return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
            }
            await promo.destroy();
            res.status(200).json({ message: "Xóa mã giảm giá thành công" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = PromotionController;
