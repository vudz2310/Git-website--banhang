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
