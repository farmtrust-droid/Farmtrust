import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  supabaseProductId: String,
  userId: String,
  name: String,
  description: String,
  images: [String],
  sustainability: { carbonFootprint: Number, waterUsage: Number },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);