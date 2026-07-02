import Voucher from '../models/Voucher.js';
import UserVoucher from '../models/UserVoucher.js';

export const getAvailableVouchers = async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      is_active: true,
      valid_from: { $lte: now },
      valid_until: { $gte: now },
      $expr: { $lt: ["$used_count", "$usage_limit"] }
    });

    const data = vouchers.map(v => {
      const obj = v.toJSON();
      obj.id = obj._id.toString();
      return obj;
    });

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserVouchers = async (req, res) => {
  try {
    const { userId } = req.params;
    const userVouchers = await UserVoucher.find({ user_id: userId }).populate('voucher_id');
    
    const data = userVouchers.map(uv => {
      if (!uv.voucher_id) return null;
      return {
        id: uv._id.toString(),
        user_id: uv.user_id.toString(),
        voucher_id: uv.voucher_id._id.toString(),
        assigned_at: uv.assigned_at,
        is_used: uv.is_used,
        used_at: uv.used_at,
        voucher: {
          id: uv.voucher_id._id.toString(),
          code: uv.voucher_id.code,
          name: uv.voucher_id.name,
          description: uv.voucher_id.description,
          discount_type: uv.voucher_id.discount_type,
          discount_value: uv.voucher_id.discount_value,
          min_order_amount: uv.voucher_id.min_order_amount,
          max_discount: uv.voucher_id.max_discount,
          usage_limit: uv.voucher_id.usage_limit,
          used_count: uv.voucher_id.used_count,
          valid_from: uv.voucher_id.valid_from,
          valid_until: uv.voucher_id.valid_until,
          is_active: uv.voucher_id.is_active
        }
      };
    }).filter(Boolean);

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
