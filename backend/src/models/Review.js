import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    comment: { type: String, default: '' },
    is_approved: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    status: { type: String, default: '' },
    created_at: { type: Date, default: Date.now }
});


export const Review = mongoose.model('Review', reviewSchema);
export default Review;
