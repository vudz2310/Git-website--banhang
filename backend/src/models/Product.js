import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, unique: true, sparse: true, default: null },
    description: { type: String, default: '' },
    product_img: { type: String, default: '' },
    product_img_alt: { type: String, default: '' },
    product_img_title: { type: String, default: '' },
    brand: { type: String, default: '' },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

productSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const Product = mongoose.model('Product', productSchema);
export default Product;
