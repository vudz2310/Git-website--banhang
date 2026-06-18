// User model schema
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', userSchema);
export default User;

// Hàm tạo admin mẫu một cách an toàn sau khi kết nối MongoDB thành công
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
    try {
        const adminExist = await User.findOne({ email: "admin@gmail.com" });

        if (!adminExist) {
            const passwordHash = await bcrypt.hash("123456", 12);

            await User.create({
                email: "admin@gmail.com",
                password_hash: passwordHash,
                full_name: "admin",
                phone: "0123456789",
                avatar: "",
                role: "admin",
                status: "active",
            });

            console.log("Admin user seeded successfully!");
        }
    } catch (err) {
        console.error("Error seeding admin user:", err);
    }
};

// Đợi kết nối database mở ra rồi mới chạy seed
mongoose.connection.once('open', seedAdmin);