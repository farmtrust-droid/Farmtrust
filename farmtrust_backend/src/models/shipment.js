import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  supabaseShipmentId: String,
  productId: String,
  farmerId: String,
  buyerId: String,
  originLocation: String,
  destinationLocation: String,
  shipmentDate: Date,
  status: { type: String, enum: ['pending', 'in_transit', 'delivered', 'cancelled'] },
  estimatedDelivery: Date,
  trackingCode: String,
  routeData: { type: Object, default: {} },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Shipment', shipmentSchema);