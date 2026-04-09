const { Favorite, Product, Category } = require('../models');

class FavoriteController {

    // Lấy danh sách yêu thích
    static async get(req, res) {
        try {
            const favorites = await Favorite.findAll({
                where: { user_id: req.user.id },
                include: [{
                    model: Product,
                    as: 'product',
                    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }]
                }],
                order: [['created_at', 'DESC']]
            });
            res.status(200).json({ status: 200, data: favorites });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Thêm vào yêu thích
    static async add(req, res) {
        try {
            const { product_id } = req.body;

            const existing = await Favorite.findOne({
                where: { user_id: req.user.id, product_id }
            });
            if (existing) {
                return res.status(400).json({ message: "Món này đã có trong danh sách yêu thích" });
            }

            const favorite = await Favorite.create({
                user_id: req.user.id,
                product_id
            });

            res.status(201).json({ message: "Đã thêm vào yêu thích", data: favorite });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Bỏ yêu thích
    static async remove(req, res) {
        try {
            const result = await Favorite.destroy({
                where: { user_id: req.user.id, product_id: req.params.productId }
            });
            if (!result) {
                return res.status(404).json({ message: "Không tìm thấy trong danh sách yêu thích" });
            }
            res.status(200).json({ message: "Đã bỏ yêu thích" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = FavoriteController;
