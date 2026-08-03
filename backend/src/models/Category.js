import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    sort_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

export const Category = mongoose.model('Category', categorySchema);
export default Category;
