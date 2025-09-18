const { mongoose } = require('../config/mongodb');

const userSchema = new mongoose.Schema({
  supabaseUserId: String,
  email: String,
  phone: String,
  walletAddress: String,
  network: { type: String, enum: ['hedera', 'thirdweb', null] },
  name: String,
  role: { type: String, required: true, enum: ['farmer', 'buyer', 'seller', 'logistics', 'admin'] },
  credibilityScore: { type: Number, default: 0.0 },
  certifications: { type: Object, default: {} },
  metadata: { type: Object, default: {} },
  password: String, // Optional, syncs with Supabase
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);