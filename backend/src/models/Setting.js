import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'general', 'footer', 'social'
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // stores configuration data dynamically
    description: { type: String, default: '' },
    updated_at: { type: Date, default: Date.now }
});

settingSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const Setting = mongoose.model('Setting', settingSchema);
export default Setting;

// Hàm tự động seed cấu hình mặc định (tên website, footer, mạng xã hội)
const seedSettings = async () => {
    try {
        // 1. Seed cấu hình chung
        const generalExist = await Setting.findOne({ key: "general" });
        if (!generalExist) {
            await Setting.create({
                key: "general",
                value: {
                    site_name: "Shop Điện thoại VIP",
                    logo_url: "",
                    contact_email: "support@shopdienthoaivip.com",
                    contact_phone: "0123 456 789",
                    address: "123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội, Việt Nam",
                    seo_title: "Shop Điện thoại VIP - Điện thoại, laptop, phụ kiện chính hãng",
                    seo_description: "Cung cấp các sản phẩm công nghệ cao cấp chính hãng chất lượng với mức giá tốt nhất thị trường."
                },
                description: "Cấu hình thông tin chung của website"
            });
            console.log("General settings seeded successfully!");
        }

        // 2. Seed cấu hình Footer để admin tuỳ chỉnh
        const footerExist = await Setting.findOne({ key: "footer" });
        if (!footerExist) {
            await Setting.create({
                key: "footer",
                value: {
                    about_us: "Shop Điện thoại VIP tự hào là đơn vị cung cấp các thiết bị di động, máy tính bảng và phụ kiện chính hãng, uy tín hàng đầu Việt Nam.",
                    columns: [
                        {
                            title: "Giới thiệu",
                            links: [
                                { label: "Về chúng tôi", url: "/about" },
                                { label: "Hệ thống cửa hàng", url: "/contact" },
                                { label: "Tuyển dụng", url: "/careers" }
                            ]
                        },
                        {
                            title: "Chính sách",
                            links: [
                                { label: "Chính sách bảo mật", url: "/privacy" },
                                { label: "Điều khoản dịch vụ", url: "/terms" },
                                { label: "Chính sách đổi trả", url: "/returns" },
                                { label: "Chính sách giao hàng", url: "/shipping" }
                            ]
                        },
                        {
                            title: "Liên hệ & Hỗ trợ",
                            links: [
                                { label: "Hướng dẫn mua hàng", url: "/how-to-buy" },
                                { label: "Phương thức thanh toán", url: "/payment-methods" },
                                { label: "Liên hệ trực tiếp", url: "/contact" }
                            ]
                        }
                    ]
                },
                description: "Cấu hình các cột liên kết ở chân trang (Footer)"
            });
            console.log("Footer settings seeded successfully!");
        }

        // 3. Seed liên kết mạng xã hội
        const socialExist = await Setting.findOne({ key: "social" });
        if (!socialExist) {
            await Setting.create({
                key: "social",
                value: {
                    facebook: "https://facebook.com/shopdienthoaivip",
                    instagram: "https://instagram.com/shopdienthoaivip",
                    youtube: "https://youtube.com/c/shopdienthoaivip",
                    tiktok: "https://tiktok.com/@shopdienthoaivip"
                },
                description: "Liên kết mạng xã hội của website"
            });
            console.log("Social settings seeded successfully!");
        }

    } catch (err) {
        console.error("Error seeding settings:", err);
    }
};

// Thực hiện seed ngay sau khi kết nối DB mở
mongoose.connection.once('open', seedSettings);
