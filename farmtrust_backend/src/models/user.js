import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  supabaseUserId: String,
  email: String,
  phone: String,
  name: String,
  role: { type: String, required: true, enum: ['farmer', 'buyer', 'seller', 'logistics', 'admin'] },
  location: String, // Farmer-specific
  certifications: { type: Object, default: {} }, // Farmer-specific
  walletAddress: String,
  network: { type: String, enum: ['hedera', 'thirdweb', null] },
  credibilityScore: { type: Number, default: 0.0 },
  password: String,
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);