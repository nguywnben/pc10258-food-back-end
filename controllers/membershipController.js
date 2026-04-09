const { MembershipPlan, User } = require('../models');

class MembershipController {

    // Lấy danh sách gói
    static async getPlans(req, res) {
        try {
            const plans = await MembershipPlan.findAll({ order: [['price', 'ASC']] });
            res.status(200).json({ status: 200, data: plans });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Nâng cấp tài khoản
    static async upgrade(req, res) {
        try {
            const { plan_id } = req.body;

            const plan = await MembershipPlan.findByPk(plan_id);
            if (!plan) {
                return res.status(404).json({ message: "Gói không tồn tại" });
            }

            const user = await User.findByPk(req.user.id);
            if (user.membership === 'premium') {
                return res.status(400).json({ message: "Bạn đã là thành viên premium" });
            }

            user.membership = 'premium';
            await user.save();

            res.status(200).json({
                message: "Nâng cấp thành công!",
                data: { membership: user.membership, plan: plan.name }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Tạo gói mới
    static async create(req, res) {
        try {
            const plan = await MembershipPlan.create(req.body);
            res.status(201).json({ message: "Tạo gói thành công", data: plan });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Cập nhật gói
    static async update(req, res) {
        try {
            const plan = await MembershipPlan.findByPk(req.params.id);
            if (!plan) {
                return res.status(404).json({ message: "Gói không tồn tại" });
            }
            await plan.update(req.body);
            res.status(200).json({ message: "Cập nhật thành công", data: plan });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Xóa gói
    static async delete(req, res) {
        try {
            const plan = await MembershipPlan.findByPk(req.params.id);
            if (!plan) {
                return res.status(404).json({ message: "Gói không tồn tại" });
            }
            await plan.destroy();
            res.status(200).json({ message: "Xóa gói thành công" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = MembershipController;
