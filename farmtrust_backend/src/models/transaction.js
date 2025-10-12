import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  supabaseTransactionId: String,
  orderId: String,
  buyerId: String,
  sellerId: String,
  amount: Number,
  currency: String,
  status: String,
  paymentMethod: String,
  transactionRef: String,
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);