const { Product, Category } = require('../models');
const { Op } = require('sequelize');

class ProductController {

    // Lấy tất cả sản phẩm (có lọc, sắp xếp)
    static async get(req, res) {
        try {
            const { category_id, sort, min_price, max_price, search } = req.query;

            const where = { is_available: 1 };
            if (category_id) where.category_id = category_id;
            if (min_price || max_price) {
                where.price = {};
                if (min_price) where.price[Op.gte] = parseInt(min_price);
                if (max_price) where.price[Op.lte] = parseInt(max_price);
            }
            if (search) {
                where.name = { [Op.like]: `%${search}%` };
            }

            let order = [['id', 'ASC']];
            if (sort === 'price-asc') order = [['price', 'ASC']];
            else if (sort === 'price-desc') order = [['price', 'DESC']];
            else if (sort === 'new') order = [['created_at', 'DESC']];
            else if (sort === 'popular') order = [['review_count', 'DESC']];

            const products = await Product.findAll({
                where,
                order,
                include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }]
            });

            res.status(200).json({ status: 200, data: products });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy sản phẩm theo ID
    static async getById(req, res) {
        try {
            const product = await Product.findByPk(req.params.id, {
                include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }]
            });
            if (!product) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại" });
            }
            res.status(200).json({ status: 200, data: product });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy sản phẩm theo danh mục
    static async getByCategory(req, res) {
        try {
            const products = await Product.findAll({
                where: { category_id: req.params.categoryId, is_available: 1 },
                include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }]
            });
            res.status(200).json({ status: 200, data: products });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Thêm sản phẩm
    static async create(req, res) {
        try {
            const product = await Product.create(req.body);
            res.status(201).json({ message: "Thêm sản phẩm thành công", data: product });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Cập nhật sản phẩm
    static async update(req, res) {
        try {
            const product = await Product.findByPk(req.params.id);
            if (!product) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại" });
            }
            await product.update(req.body);
            res.status(200).json({ message: "Cập nhật sản phẩm thành công", data: product });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Xóa sản phẩm
    static async delete(req, res) {
        try {
            const product = await Product.findByPk(req.params.id);
            if (!product) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại" });
            }
            await product.destroy();
            res.status(200).json({ message: "Xóa sản phẩm thành công" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ProductController;
