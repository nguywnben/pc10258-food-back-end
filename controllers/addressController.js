const { Address } = require('../models');

class AddressController {

    // Lấy danh sách địa chỉ của user hiện tại
    static async get(req, res) {
        try {
            const addresses = await Address.findAll({
                where: { user_id: req.user.id },
                order: [['is_default', 'DESC'], ['created_at', 'DESC']]
            });
            res.status(200).json({ status: 200, data: addresses });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Thêm địa chỉ mới
    static async create(req, res) {
        try {
            const { label, full_address, is_default } = req.body;

            // Nếu đặt mặc định, bỏ mặc định các địa chỉ cũ
            if (is_default) {
                await Address.update({ is_default: 0 }, { where: { user_id: req.user.id } });
            }

            const address = await Address.create({
                user_id: req.user.id,
                label,
                full_address,
                is_default: is_default ? 1 : 0
            });

            res.status(201).json({ message: "Thêm địa chỉ thành công", data: address });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Cập nhật địa chỉ
    static async update(req, res) {
        try {
            const address = await Address.findOne({
                where: { id: req.params.id, user_id: req.user.id }
            });
            if (!address) {
                return res.status(404).json({ message: "Địa chỉ không tồn tại" });
            }

            const { label, full_address, is_default } = req.body;
            if (is_default) {
                await Address.update({ is_default: 0 }, { where: { user_id: req.user.id } });
            }

            if (label !== undefined) address.label = label;
            if (full_address !== undefined) address.full_address = full_address;
            if (is_default !== undefined) address.is_default = is_default ? 1 : 0;
            await address.save();

            res.status(200).json({ message: "Cập nhật địa chỉ thành công", data: address });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Xóa địa chỉ
    static async delete(req, res) {
        try {
            const address = await Address.findOne({
                where: { id: req.params.id, user_id: req.user.id }
            });
            if (!address) {
                return res.status(404).json({ message: "Địa chỉ không tồn tại" });
            }
            await address.destroy();
            res.status(200).json({ message: "Xóa địa chỉ thành công" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AddressController;
