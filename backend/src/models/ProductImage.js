import mongoose from 'mongoose';

const productImageSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    url: { type: String, required: true },
    is_primary: { type: Boolean, default: false },
    sort_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

export const ProductImage = mongoose.model('ProductImage', productImageSchema);
export default ProductImage;
