import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true, unique: true },
    quantity: { type: Number, default: 0 },
    low_stock_threshold: { type: Number, default: 5 },
    updated_at: { type: Date, default: Date.now }
});

inventorySchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

export const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
