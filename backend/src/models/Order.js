import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
    name_snapshot: { type: String, required: true },
    sku_snapshot: { type: String, default: null },
    unit_price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    code: { type: String, required: true, unique: true },
    status: { 
        type: String, 
        enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded'], 
        default: 'pending' 
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0.00 },
    shipping_fee: { type: Number, default: 0.00 },
    tax: { type: Number, default: 0.00 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'VND' },
    payment_status: { 
        type: String, 
        enum: ['pending', 'success', 'failed', 'refunded'], 
        default: 'pending' 
    },
    shipping_status: { 
        type: String, 
        enum: ['pending', 'picked_up', 'in_transit', 'delivered', 'failed'], 
        default: 'pending' 
    },
    placed_at: { type: Date, default: null },
    note: { type: String, default: '' },
    shipping_address_json: { type: String, default: '' },
    items: [orderItemSchema],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const Order = mongoose.model('Order', orderSchema);
export default Order;
