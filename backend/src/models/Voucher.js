import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    discount_type: { type: String, enum: ['percentage', 'fixed'], required: true },
    discount_value: { type: Number, required: true },
    min_order_amount: { type: Number, default: 0.00 },
    max_discount: { type: Number, default: null },
    usage_limit: { type: Number, required: true },
    used_count: { type: Number, default: 0 },
    valid_from: { type: Date, required: true },
    valid_until: { type: Date, required: true },
    is_active: { type: Boolean, default: true }
});

export const Voucher = mongoose.model('Voucher', voucherSchema);
export default Voucher;
