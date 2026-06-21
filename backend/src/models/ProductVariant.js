import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant_sku: { type: String, unique: true, sparse: true, default: null },
    color: { type: String, default: null },
    size: { type: String, default: null },
    price: { type: Number, required: true },
    compare_price: { type: Number, default: null },
    weight: { type: Number, default: null },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

export const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
export default ProductVariant;
