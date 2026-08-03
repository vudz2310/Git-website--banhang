import mongoose from 'mongoose';

const userVoucherSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', required: true },
    assigned_at: { type: Date, default: Date.now },
    is_used: { type: Boolean, default: false },
    used_at: { type: Date, default: null }
});

// Composite index to ensure a user claims a specific voucher only once (optional but good practice)
userVoucherSchema.index({ user_id: 1, voucher_id: 1 }, { unique: true });

export const UserVoucher = mongoose.model('UserVoucher', userVoucherSchema);
export default UserVoucher;
