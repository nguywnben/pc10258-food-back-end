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

    /**
     * Get current membership of user
     * GET /api/membership/current
     * Returns: { id, name, price, features } or 404 if no membership
     */
    static async getCurrent(req, res) {
        try {
            const user = await User.findByPk(req.user.id, {
                include: [
                    {
                        association: 'currentMembership',
                        attributes: ['id', 'name', 'price', 'features']
                    }
                ]
            });

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            // If user has no current membership plan, return 404
            if (!user.currentMembership) {
                return res.status(404).json({ message: "User has no membership plan" });
            }

            res.status(200).json({
                status: 200,
                data: user.currentMembership
            });
        } catch (error) {
            console.error('Error getting current membership:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Upgrade to a new membership plan
     * POST /api/membership/upgrade
     * Body: { plan_id: number }
     * 
     * Rules:
     * - Cannot select the same plan as current
     * - Can only upgrade to higher tier (price comparison)
     * - Cannot downgrade
     */
    static async upgrade(req, res) {
        try {
            const { plan_id } = req.body;

            if (!plan_id) {
                return res.status(400).json({ message: "plan_id is required" });
            }

            // Get the new plan
            const newPlan = await MembershipPlan.findByPk(plan_id);
            if (!newPlan) {
                return res.status(404).json({ message: "Gói không tồn tại" });
            }

            // Get current user with their current membership
            const user = await User.findByPk(req.user.id, {
                include: [
                    {
                        association: 'currentMembership',
                        attributes: ['id', 'name', 'price']
                    }
                ]
            });

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            const currentMembership = user.currentMembership;

            // Rule 1: Can't select the same plan
            if (currentMembership && currentMembership.id === plan_id) {
                return res.status(400).json({ 
                    message: "Bạn đã đang sử dụng gói này rồi" 
                });
            }

            // Rule 2: Can only upgrade (not downgrade)
            if (currentMembership && newPlan.price <= currentMembership.price) {
                return res.status(400).json({ 
                    message: "Bạn chỉ có thể nâng cấp lên gói cao hơn, không thể lùi lại" 
                });
            }

            // Update user's membership plan
            user.membership_plan_id = plan_id;
            user.membership = 'premium';  // For backward compatibility
            await user.save();

            res.status(200).json({
                status: 200,
                message: "Nâng cấp thành công!",
                data: {
                    membership_id: user.membership_plan_id,
                    plan_name: newPlan.name,
                    plan_price: newPlan.price
                }
            });
        } catch (error) {
            console.error('Error upgrading membership:', error);
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
