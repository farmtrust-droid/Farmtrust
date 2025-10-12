import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import supabase from '../config/supabase.js';
import User from '../models/user.js';

export const register = async (req, res) => {
  const { name, email, phone, role, password, location, certifications } = req.body;
  if (!['farmer', 'buyer', 'seller', 'logistics', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (role === 'farmer' && (!location || !certifications)) {
    return res.status(400).json({ error: 'Location and certifications are required for farmers' });
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

  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { phone, name, role, location, certifications } }
  });
  if (authError) {
    console.error('Supabase auth error:', authError);
    return res.status(500).json({ error: 'Auth error: ' + authError.message });
  }

  const { data, error } = await supabase
    .from('users')
    .insert({ id: authUser.user.id, email, phone, role, name, location, certifications, password: hashedPassword })
    .select();
  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Supabase error: ' + error.message });
  }

  await User.findOneAndUpdate(
    { email },
    { $set: { supabaseUserId: data[0].id, email, phone, role, name, location, certifications, password: hashedPassword, metadata: {} } },
    { upsert: true }
  );

  const token = jwt.sign({ userId: data[0].id, contact: email, type: 'email', role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: data[0] });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, email, phone, role, name, location, certifications, password')
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
    { $set: { supabaseUserId: data.id, email, phone: data.phone, role: data.role, name: data.name, location: data.location, certifications: data.certifications, metadata: {} } },
    { upsert: true }
  );

  const token = jwt.sign({ userId: data.id, contact: email, type: 'email', role: data.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: data.id, email: data.email, phone: data.phone, role: data.role, name: data.name, location: data.location, certifications: data.certifications } });
};

export const sendOTC = async (req, res) => {
  const { contact, type, role, name, location, certifications } = req.body;
  if (!['farmer', 'buyer', 'seller', 'logistics', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (role === 'farmer' && (!location || !certifications)) {
    return res.status(400).json({ error: 'Location and certifications are required for farmers' });
  }
  const otc = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 300000;

  req.app.locals.otcs = req.app.locals.otcs || {};
  req.app.locals.otcs[contact] = { otc, expires, role, name, location, certifications };

  try {
    if (type === 'email') {
      const msg = {
        to: contact,
        from: 'no-reply@farmtrust.com',
        subject: 'FarmTrust Verification Code',
        text: `Your verification code is ${otc}. It expires in 5 minutes.`
      };
      await (await import('../utils/email.js')).sendEmail(msg);
    } else if (type === 'phone') {
      await (await import('../utils/sms.js')).sendSMS({
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

export const verifyOTC = async (req, res) => {
  const { contact, otc, type } = req.body;
  const stored = req.app.locals.otcs?.[contact];
  if (!stored || stored.otc !== otc || Date.now() > stored.expires) {
    return res.status(401).json({ error: 'Invalid or expired OTC' });
  }

  const { name, role, location, certifications } = stored;
  const userData = type === 'email' 
    ? { email: contact, role, name, location, certifications } 
    : { phone: contact, role, name, location, certifications };

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
    { $set: { supabaseUserId: data[0].id, [type]: contact, role, name, location, certifications, metadata: {} } },
    { upsert: true }
  );

  const token = jwt.sign({ userId: data[0].id, contact, type, role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  delete req.app.locals.otcs[contact];
  res.json({ token, user: data[0] });
};

export const getNonce = async (req, res) => {
  const { address } = req.params;
  const nonce = Math.random().toString(36).substring(2);
  req.app.locals.nonces = req.app.locals.nonces || {};
  req.app.locals.nonces[address] = { nonce, timestamp: Date.now() };
  res.json({ nonce });
};

export const verifyWallet = async (req, res) => {
  const { address, signature, message, role, name, location, certifications } = req.body;
  if (!['farmer', 'buyer', 'seller', 'logistics', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (role === 'farmer' && (!location || !certifications)) {
    return res.status(400).json({ error: 'Location and certifications are required for farmers' });
  }
  const stored = req.app.locals.nonces?.[address];
  if (!stored || Date.now() > stored.timestamp + 300000) {
    return res.status(401).json({ error: 'Invalid or expired nonce' });
  }

  const isValid = true; // TODO: Implement Hedera signature verification
  if (!isValid) return res.status(401).json({ error: 'Invalid signature' });

  const { data, error } = await supabase
    .from('users')
    .upsert({ wallet_address: address, network: 'hedera', role, name, location, certifications, credibility_score: 0.0 }, { onConflict: 'wallet_address' })
    .select();
  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Supabase error: ' + error.message });
  }

  await User.findOneAndUpdate(
    { walletAddress: address },
    { $set: { supabaseUserId: data[0].id, walletAddress: address, network: 'hedera', role, name, location, certifications, metadata: {} } },
    { upsert: true }
  );

  const token = jwt.sign({ userId: data[0].id, address, network: 'hedera', role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  delete req.app.locals.nonces[address];
  res.json({ token, user: data[0] });
};

export default { register, login, sendOTC, verifyOTC, getNonce, verifyWallet };