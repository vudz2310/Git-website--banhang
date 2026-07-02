import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  full_name: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  ward: { type: String, default: '' },
  district: { type: String, default: '' },
  city: { type: String, default: '' },
  is_default: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

export const Address = mongoose.model('Address', addressSchema);
export default Address;
