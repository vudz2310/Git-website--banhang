import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true }, // Image URL or path
    redirectUrl: { type: String, default: '' }, // URL to redirect when clicked
    isActive: { type: Boolean, default: true },
    sort_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

export const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;

// Hàm seed banner mẫu khi kết nối DB thành công
const seedBanners = async () => {
    try {
        const count = await Banner.countDocuments();
        if (count === 0) {
            await Banner.create([
                {
                    title: "Siêu Ưu Đãi Điện Thoại Cao Cấp - Trả Góp 0%",
                    image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1200&auto=format&fit=crop",
                    redirectUrl: "/products",
                    isActive: true,
                    sort_order: 1
                },
                {
                    title: "Laptop Thiết Kế Mỏng Nhẹ - Giảm Ngay 2 Triệu Đồng",
                    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
                    redirectUrl: "/products",
                    isActive: true,
                    sort_order: 2
                },
                {
                    title: "Phụ Kiện & Đồ Chơi Công Nghệ Đồng Giá Từ 99k",
                    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200&auto=format&fit=crop",
                    redirectUrl: "/products",
                    isActive: true,
                    sort_order: 3
                }
            ]);
            console.log("Banners seeded successfully!");
        }
    } catch (err) {
        console.error("Error seeding banners:", err);
    }
};

mongoose.connection.once('open', seedBanners);
