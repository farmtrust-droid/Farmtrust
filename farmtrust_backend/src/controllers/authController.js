const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { supabase } = require('../config/supabase');
const User = require('../models/user');

const register = async (req, res) => {
  const { name, email, phone, role, password } = req.body;
  if (!['farmer', 'buyer', 'seller', 'logistics', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},phone.eq.${phone}`)
    .single();
  if (existingUser) {
    return res.status(409).json({ error: 'Email or phone already registered' });
  }
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Supabase check error:', checkError);
    return res.status(500).json({ error: 'Error checking user existence' });
  }

  const { data, error } = await supabase
    .from('users')
    .insert({ email, phone, role, name, password: hashedPassword })
    .select();
  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Supabase error: ' + error.message });
  }

  await User.findOneAndUpdate(
    { email },
    { $set: { supabaseUserId: data[0].id, email, phone, role, name, password: hashedPassword, metadata: {} } },
    { upsert: true }
  );

  const token = jwt.sign({ contact: email, type: 'email', role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: data[0] });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error || !data) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValidPassword = await bcrypt.compare(password, data.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  await User.findOneAndUpdate(
    { email },
    { $set: { supabaseUserId: data.id, email, phone: data.phone, role: data.role, name: data.name, metadata: {} } },
    { upsert: true }
  );

  const token = jwt.sign({ contact: email, type: 'email', role: data.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: data.id, email: data.email, phone: data.phone, role: data.role, name: data.name } });
};

const sendOTC = async (req, res) => {
  const { contact, type, role } = req.body;
  if (!['farmer', 'buyer', 'seller', 'logistics', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const otc = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 300000;

  req.app.locals.otcs = req.app.locals.otcs || {};
  req.app.locals.otcs[contact] = { otc, expires, role };

  try {
    if (type === 'email') {
      const msg = {
        to: contact,
        from: 'no-reply@farmtrust.com',
        subject: 'FarmTrust Verification Code',
        text: `Your verification code is ${otc}. It expires in 5 minutes.`
      };
      await require('../utils/email').sendEmail(msg);
    } else if (type === 'phone') {
      await require('../utils/sms').sendSMS({
        body: `Your FarmTrust verification code is ${otc}. It expires in 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: contact
      });
    } else {
      return res.status(400).json({ error: 'Invalid contact type' });
    }
    res.json({ message: 'OTC sent' });
  } catch (error) {
    console.error('Error sending OTC:', error);
    res.status(500).json({ error: 'Failed to send OTC' });
  }
};

const verifyOTC = async (req, res) => {
  const { contact, otc, type, name } = req.body;
  const stored = req.app.locals.otcs?.[contact];
  if (!stored || stored.otc !== otc || Date.now() > stored.expires) {
    return res.status(401).json({ error: 'Invalid or expired OTC' });
  }

  const userData = type === 'email' ? { email: contact, role: stored.role, name } : { phone: contact, role: stored.role, name };
  const { data, error } = await supabase
    .from('users')
    .upsert(userData, { onConflict: type === 'email' ? 'email' : 'phone' })
    .select();
  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Supabase error: ' + error.message });
  }

  await User.findOneAndUpdate(
    { [type]: contact },
    { $set: { supabaseUserId: data[0].id, [type]: contact, role: stored.role, name, metadata: {} } },
    { upsert: true }
  );

  const token = jwt.sign({ contact, type, role: stored.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  delete req.app.locals.otcs[contact];
  res.json({ token, user: data[0] });
};

const getNonce = async (req, res) => {
  const { address } = req.params;
  const nonce = Math.random().toString(36).substring(2);
  req.app.locals.nonces = req.app.locals.nonces || {};
  req.app.locals.nonces[address] = { nonce, timestamp: Date.now() };
  res.json({ nonce });
};

const verifyWallet = async (req, res) => {
  const { address, signature, message, role, name } = req.body;
  if (!['farmer', 'buyer', 'seller', 'logistics', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const stored = req.app.locals.nonces?.[address];
  if (!stored || Date.now() > stored.timestamp + 300000) {
    return res.status(401).json({ error: 'Invalid or expired nonce' });
  }

  const isValid = true; // TODO: Implement Hedera signature verification
  if (!isValid) return res.status(401).json({ error: 'Invalid signature' });

  const { data, error } = await supabase
    .from('users')
    .upsert({ wallet_address: address, network: 'hedera', role, name, credibility_score: 0.0 }, { onConflict: 'wallet_address' })
    .select();
  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Supabase error: ' + error.message });
  }

  await User.findOneAndUpdate(
    { walletAddress: address },
    { $set: { supabaseUserId: data[0].id, walletAddress: address, network: 'hedera', role, name, metadata: {} } },
    { upsert: true }
  );

  const token = jwt.sign({ address, network: 'hedera', role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  delete req.app.locals.nonces[address];
  res.json({ token, user: data[0] });
};

module.exports = { register, login, sendOTC, verifyOTC, getNonce, verifyWallet };