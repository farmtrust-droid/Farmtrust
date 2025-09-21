const { supabase } = require('../config/supabase');
const Product = require('../models/product');

const listProduct = async (req, res) => {
  const { userId, role } = req.user;
  if (!['farmer', 'seller'].includes(role)) return res.status(403).json({ error: 'Unauthorized' });

  const { name, quantity, price, description, images, sustainability, metadata } = req.body;

  const { data, error } = await supabase
    .from('products')
    .insert({ user_id: userId, name, quantity, price })
    .select();
  if (error) return res.status(500).json({ error: 'Supabase error: ' + error.message });

  await Product.create({
    supabaseProductId: data[0].id,
    userId,
    name,
    description,
    images,
    sustainability,
    metadata
  });

  await supabase.channel('public:products').send({
    event: 'new_product',
    payload: { product: data[0] }
  });

  res.json({ product: data[0] });
};

const getProducts = async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return res.status(500).json({ error: 'Supabase error: ' + error.message });

  const products = await Promise.all(data.map(async (p) => {
    const mongoData = await Product.findOne({ supabaseProductId: p.id });
    return { ...p, ...mongoData?.toObject() };
  }));

  res.json(products);
};

const placeOrder = async (req, res) => {
  const { userId, role } = req.user;
  if (role !== 'buyer') return res.status(403).json({ error: 'Unauthorized' });

  const { product_id, amount } = req.body;
  const product = await supabase.from('products').select('user_id').match({ id: product_id }).single();
  if (!product.data) return res.status(404).json({ error: 'Product not found' });

  const { data, error } = await supabase
    .from('orders')
    .insert({ product_id, buyer_id: userId, seller_id: product.data.user_id, amount, status: 'pending' })
    .select();
  if (error) return res.status(500).json({ error: 'Supabase error: ' + error.message });

  await supabase.channel('public:orders').send({
    event: 'new_order',
    payload: { order: data[0] }
  });

  res.json({ order: data[0] });
};

module.exports = { listProduct, getProducts, placeOrder };