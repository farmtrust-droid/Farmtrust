import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  supabaseProductId: String,
  farmerId: String,
  productName: String,
  description: String,
  harvestDate: Date,
  origin: String,
  quantity: Number,
  price: Number,
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);