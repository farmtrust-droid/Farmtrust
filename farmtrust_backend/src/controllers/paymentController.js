const { supabase } = require('../config/supabase');
const Transaction = require('../models/transaction');
const axios = require('axios');
const { transferHBAR } = require('../utils/hedera');

const processPayment = async (req, res) => {
  const { order_id, amount, currency, payment_method } = req.body;
  const { address, contact, role } = req.user;
  if (role !== 'buyer') return res.status(403).json({ error: 'Unauthorized' });

  const buyer_id = address || contact;
  const order = await supabase.from('orders').select('seller_id, product_id').match({ id: order_id }).single();
  if (!order.data) return res.status(404).json({ error: 'Order not found' });

  let transactionRef;
  let status = 'pending';

  try {
    if (payment_method === 'hedera' && currency === 'HBAR') {
      const seller = await supabase.from('users').select('wallet_address').match({ id: order.data.seller_id }).single();
      if (!seller.data?.wallet_address) return res.status(400).json({ error: 'Seller wallet not found' });

      transactionRef = await transferHBAR(buyer_id, seller.data.wallet_address, amount);
      status = 'completed';
    } else if (payment_method === 'paystack' && ['KES', 'USD'].includes(currency)) {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: contact || (await supabase.from('users').select('email').match({ id: buyer_id }).single()).data.email,
          amount: amount * 100, // Paystack expects amount in kobo/cents
          currency,
          reference: `farmtrust-${Date.now()}`
        },
        { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
      );
      transactionRef = response.data.data.reference;
      status = 'pending'; // Requires webhook to confirm
    } else {
      return res.status(400).json({ error: 'Invalid payment method or currency' });
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({ order_id, buyer_id, seller_id: order.data.seller_id, amount, currency, status, payment_method, transaction_ref: transactionRef })
      .select();
    if (error) return res.status(500).json({ error: 'Supabase error: ' + error.message });

    await Transaction.create({
      supabaseTransactionId: data[0].id,
      orderId: order_id,
      buyerId: buyer_id,
      sellerId: order.data.seller_id,
      amount,
      currency,
      status,
      paymentMethod: payment_method,
      transactionRef,
      metadata: {}
    });

    await supabase.channel('public:transactions').send({
      event: 'new_transaction',
      payload: { transaction: data[0] }
    });

    res.json({ transaction: data[0] });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
};

module.exports = { processPayment };