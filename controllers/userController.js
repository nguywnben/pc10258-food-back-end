const { User, Wallet } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserController {
    // Đăng ký
    static async register(req, res) {
        try {
            const { full_name, email, phone, password } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email đã tồn tại!' });
            }

            const user = await User.create({ full_name, email, phone, password });

            // Tạo ví cho user mới
            await Wallet.create({ user_id: user.id, balance: 0 });

            res.status(201).json({
                message: "Đăng ký thành công!",
                user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone }
            });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    // Đăng nhập
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: "Email hoặc mật khẩu không chính xác!" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Email hoặc mật khẩu không chính xác!" });
            }

            const token = jwt.sign(
                { id: user.id, full_name: user.full_name, email: user.email, role: user.role, membership: user.membership },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            const userWithMembership = await User.findByPk(user.id, {
                attributes: { exclude: ['password'] },
                include: [{
                    model: require('../models').MembershipPlan,
                    as: 'currentMembership',
                    attributes: ['id', 'name', 'price']
                }]
            });

            return res.status(200).json({
                message: "Đăng nhập thành công!",
                token,
                user: {
                    id: userWithMembership.id,
                    full_name: userWithMembership.full_name,
                    email: userWithMembership.email,
                    phone: userWithMembership.phone,
                    avatar_url: userWithMembership.avatar_url,
                    role: userWithMembership.role,
                    membership: userWithMembership.membership,
                    membership_plan: userWithMembership.currentMembership
                }
            });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server!", error: error.message });
        }
    }

    // Lấy thông tin profile
    static async getProfile(req, res) {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: { exclude: ['password'] },
                include: [{
                    model: require('../models').MembershipPlan,
                    as: 'currentMembership',
                    attributes: ['id', 'name', 'price']
                }]
            });
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng!" });
            }
            const userData = user.toJSON();
            userData.membership_plan = userData.currentMembership;
            delete userData.currentMembership;
            res.status(200).json({ data: userData });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    // Cập nhật thông tin
    static async updateProfile(req, res) {
        try {
            const { full_name, email, phone } = req.body;
            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng!" });
            }

            if (full_name) user.full_name = full_name;
            if (email) user.email = email;
            if (phone) user.phone = phone;
            await user.save();

            const userWithMembership = await User.findByPk(user.id, {
                attributes: { exclude: ['password'] },
                include: [{
                    model: require('../models').MembershipPlan,
                    as: 'currentMembership',
                    attributes: ['id', 'name', 'price']
                }]
            });

            const userData = userWithMembership.toJSON();
            userData.membership_plan = userData.currentMembership;
            delete userData.currentMembership;

            res.status(200).json({
                message: "Cập nhật thành công!",
                user: userData
            });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    // Đổi mật khẩu
    static async changePassword(req, res) {
        try {
            const { current_password, new_password } = req.body;
            const user = await User.findByPk(req.user.id);

            const isMatch = await bcrypt.compare(current_password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Mật khẩu hiện tại không đúng!" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(new_password, salt);
            await user.save();

            res.status(200).json({ message: "Đổi mật khẩu thành công!" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    // [Admin] Lấy tất cả users
    static async getAll(req, res) {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password'] }
            });
            res.status(200).json({ status: 200, data: users });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Xóa user
    static async delete(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng!" });
            }
            await user.destroy();
            res.status(200).json({ message: "Xóa người dùng thành công!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // [Admin] Khóa/Mở khóa user
    static async lockUser(req, res) {
        try {
            const { id } = req.params;
            const { is_locked } = req.body;

            if (typeof is_locked !== 'boolean') {
                return res.status(400).json({ message: "Trường is_locked phải là boolean (true/false)!" });
            }

            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng!" });
            }

            // Không cho khóa admin
            if (user.role === 'admin') {
                return res.status(403).json({ message: "Không thể khóa tài khoản admin!" });
            }

            user.is_locked = is_locked;
            await user.save();

            const userData = await User.findByPk(id, {
                attributes: { exclude: ['password'] }
            });

            const action = is_locked ? 'khóa' : 'mở khóa';
            res.status(200).json({
                message: `${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công!`,
                user: userData
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserController;
