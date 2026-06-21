import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

export const Subscriber = mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;
