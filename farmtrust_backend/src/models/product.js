const { mongoose } = require('../config/mongodb');

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

module.exports = mongoose.model('Product', productSchema);