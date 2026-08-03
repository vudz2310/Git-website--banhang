import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email và mật khẩu là bắt buộc",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản",
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Tài khoản không hoạt động",
            });
        }

        const ok = await bcrypt.compare(password, user.password_hash);

        if (!ok) {
            return res.status(400).json({
                success: false,
                message: "Sai mật khẩu",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                status: user.status,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Đăng nhập thất bại",
        });
    }
};

export const register = async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                message: "Email, mật khẩu và họ tên là bắt buộc",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email đã được sử dụng",
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            email: normalizedEmail,
            password_hash: passwordHash,
            full_name,
            phone,
        });

        return res.status(201).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                status: user.status,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Đăng kí thất bại",
        });
    }
};