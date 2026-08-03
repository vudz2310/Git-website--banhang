import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    quantity: { type: Number, default: 1 },
    unit_price: { type: Number, required: true },
    created_at: { type: Date, default: Date.now }
});

const cartSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    session_id: { type: String, default: null },
    expires_at: { type: Date, default: null },
    items: [cartItemSchema],
    created_at: { type: Date, default: Date.now }
});

export const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
