const { mongoose } = require('../config/mongodb');

const transactionSchema = new mongoose.Schema({
  supabaseTransactionId: String,
  orderId: String,
  buyerId: String,
  sellerId: String,
  amount: Number,
  currency: { type: String, enum: ['HBAR', 'KES', 'USD'] },
  status: { type: String, enum: ['pending', 'completed', 'failed'] },
  paymentMethod: { type: String, enum: ['hedera', 'paystack'] },
  transactionRef: String,
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);