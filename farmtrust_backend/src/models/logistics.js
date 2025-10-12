import mongoose from 'mongoose';

const logisticsSchema = new mongoose.Schema({
  supabaseLogId: String,
  shipmentId: String,
  timestamp: Date,
  location: String,
  temperature: Number,
  humidity: Number,
  deviceId: String,
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Logistics', logisticsSchema);