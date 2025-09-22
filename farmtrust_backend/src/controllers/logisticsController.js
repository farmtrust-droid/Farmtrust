// controllers/logisticsController.js
import supabase from '../config/supabase.js';
import Shipment from '../models/shipment.js';
import Logistics from '../models/logistics.js';
import axios from 'axios';

export const createShipment = async (req, res) => {
  const { userId, role } = req.user;
  if (role !== 'seller') return res.status(403).json({ error: 'Unauthorized - Seller only' });

  const { product_id, origin_location, destination_location } = req.body;
  const product = await supabase.from('products').select('farmer_id, price').eq('product_id', product_id).single();
  if (!product.data) return res.status(404).json({ error: 'Product not found' });

  let routeData = {};
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin_location}&destination=${destination_location}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    routeData = {
      distance: response.data.routes[0]?.legs[0]?.distance?.text || 'Unknown',
      duration: response.data.routes[0]?.legs[0]?.duration?.text || 'Unknown',
      polyline: response.data.routes[0]?.overview_polyline?.points || null
    };
  } catch (error) {
    console.error('Route optimization error:', error);
    routeData = { note: 'Route calculation failed' };
  }

  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const trackingCode = `FT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  const { data, error } = await supabase
    .from('shipments')
    .insert({
      product_id,
      farmer_id: product.data.farmer_id,
      buyer_id: userId,
      origin_location,
      destination_location,
      shipment_date: new Date(),
      estimated_delivery: estimatedDelivery,
      tracking_code: trackingCode,
      route_data: routeData
    })
    .select();
  if (error) return res.status(500).json({ error: 'Supabase error: ' + error.message });

  await Shipment.create({
    supabaseShipmentId: data[0].shipment_id,
    productId: product_id,
    farmerId: product.data.farmer_id,
    buyerId: userId,
    originLocation: origin_location,
    destinationLocation: destination_location,
    shipmentDate: new Date(),
    estimatedDelivery,
    trackingCode,
    routeData,
    metadata: { price: product.data.price }
  });

  await supabase.channel('public:shipments').send({
    event: 'new_shipment',
    payload: { shipment: data[0] }
  });

  res.json({ shipment: data[0] });
};

export const getShipment = async (req, res) => {
  const { userId, role } = req.user;
  const { shipment_id } = req.params;

  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('shipment_id', shipment_id)
    .single();
  if (error || !data) return res.status(404).json({ error: 'Shipment not found' });

  if (role !== 'logistics' && role !== 'admin' && data.farmer_id !== userId && data.buyer_id !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const mongoData = await Shipment.findOne({ supabaseShipmentId: data.shipment_id });
  const shipment = { ...data, ...mongoData?.toObject() };

  res.json({ shipment });
};

export const updateShipmentStatus = async (req, res) => {
  const { userId, role } = req.user;
  const { shipment_id } = req.params;
  const { status } = req.body;

  if (role !== 'logistics' && role !== 'seller' && role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase
    .from('shipments')
    .update({ status })
    .eq('shipment_id', shipment_id)
    .select();
  if (error) return res.status(500).json({ error: 'Supabase error: ' + error.message });

  await Shipment.findOneAndUpdate(
    { supabaseShipmentId: shipment_id },
    { $set: { status } }
  );

  await supabase.channel('public:shipments').send({
    event: 'shipment_update',
    payload: { shipment: data[0], status }
  });

  res.json({ shipment: data[0] });
};

export const logTrackingEvent = async (req, res) => {
  const { userId, role } = req.user;
  const { shipment_id, location, temperature, humidity, device_id } = req.body;

  if (role !== 'logistics' && role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized - Logistics or Admin only' });
  }

  const { data, error } = await supabase
    .from('logistics')
    .insert({
      shipment_id,
      timestamp: new Date(),
      location,
      temperature,
      humidity,
      device_id
    })
    .select();
  if (error) return res.status(500).json({ error: 'Supabase error: ' + error.message });

  await Logistics.create({
    supabaseLogId: data[0].log_id,
    shipmentId: shipment_id,
    timestamp: new Date(),
    location,
    temperature,
    humidity,
    deviceId: device_id,
    metadata: {}
  });

  await supabase.channel('public:logistics').send({
    event: 'tracking_event',
    payload: { log: data[0] }
  });

  res.json({ log: data[0] });
};

export default { createShipment, getShipment, updateShipmentStatus, logTrackingEvent };