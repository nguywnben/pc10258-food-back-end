const { Category } = require('../models');

class CategoryController {

    static async get(req, res) {
        try {
            const categories = await Category.findAll({
                order: [['sort_order', 'ASC']]
            });
            res.status(200).json({
                status: 200,
                message: "Lấy danh sách danh mục thành công",
                data: categories,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);

            if (!category) {
                return res.status(404).json({ message: "Danh mục không tồn tại" });
            }

            res.status(200).json({ status: 200, data: category });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { name, icon, sort_order, status } = req.body;

            // Kiểm tra trùng sort_order
            const existingOrder = await Category.findOne({ where: { sort_order } });
            if (existingOrder) {
                return res.status(400).json({ message: "Thứ tự hiển thị này đã tồn tại" });
            }

            const category = await Category.create({ name, icon, sort_order, status });

            res.status(201).json({
                message: "Thêm danh mục thành công",
                data: category
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, icon, sort_order, status } = req.body;

            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "Danh mục không tồn tại" });
            }

            // Kiểm tra trùng sort_order nếu có thay đổi
            if (sort_order !== undefined && Number(sort_order) !== category.sort_order) {
                const existingOrder = await Category.findOne({ where: { sort_order } });
                if (existingOrder) {
                    return res.status(400).json({ message: "Thứ tự hiển thị này đã tồn tại" });
                }
            }

            if (name !== undefined) category.name = name;
            if (icon !== undefined) category.icon = icon;
            if (sort_order !== undefined) category.sort_order = sort_order;
            if (status !== undefined) category.status = status;
            await category.save();

            res.status(200).json({
                message: "Cập nhật danh mục thành công",
                data: category
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;

            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "Danh mục không tồn tại" });
            }

            await category.destroy();
            res.status(200).json({ message: "Xóa danh mục thành công" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CategoryController;
