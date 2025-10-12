import supabase from '../config/supabase.js';
import Product from '../models/product.js';

export const listProduct = async (req, res) => {
  const { userId, role } = req.user;
  if (!['farmer', 'seller'].includes(role)) return res.status(403).json({ error: 'Unauthorized' });

  const { product_name, description, harvest_date, origin, quantity, price } = req.body;

  const { data, error } = await supabase
    .from('products')
    .insert({ farmer_id: userId, product_name, description, harvest_date, origin, quantity, price })
    .select();
  if (error) return res.status(500).json({ error: 'Supabase error: ' + error.message });

  await Product.create({
    supabaseProductId: data[0].product_id,
    farmerId: userId,
    productName: product_name,
    description,
    harvestDate: harvest_date,
    origin,
    quantity,
    price,
    metadata: {}
  });

  await supabase.channel('public:products').send({
    event: 'new_product',
    payload: { product: data[0] }
  });

  res.json({ product: data[0] });
};

export const getProducts = async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return res.status(500).json({ error: 'Supabase error: ' + error.message });

  const products = await Promise.all(data.map(async (p) => {
    const mongoData = await Product.findOne({ supabaseProductId: p.product_id });
    return { ...p, ...mongoData?.toObject() };
  }));

  res.json(products);
};

export const placeOrder = async (req, res) => {
  const { userId, role } = req.user;
  if (role !== 'buyer') return res.status(403).json({ error: 'Unauthorized' });

  const { product_id, amount } = req.body;
  const product = await supabase.from('products').select('farmer_id, price').eq('product_id', product_id).single();
  if (!product.data) return res.status(404).json({ error: 'Product not found' });

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      product_id,
      consumer_id: userId,
      farmer_id: product.data.farmer_id,
      amount,
      timestamp: new Date(),
      payment_status: 'pending'
    })
    .select();
  if (error) return res.status(500).json({ error: 'Supabase error: ' + error.message });

  await supabase.channel('public:transactions').send({
    event: 'new_transaction',
    payload: { transaction: data[0] }
  });

  res.json({ transaction: data[0] });
};

export default { listProduct, getProducts, placeOrder };