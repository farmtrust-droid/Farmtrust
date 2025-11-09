import bcrypt from 'bcrypt';
import supabase from '../config/supabase.js';
import User from '../models/user.js';

export const register = async (req, res) => {
  const { full_name, email, phone_number, location, user_type, password } = req.body;

  if (!['farmer', 'agent', 'supplier', 'admin'].includes(user_type)) {
    return res.status(400).json({ error: 'Invalid user type' });
  }
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Full name, email, and password are required' });
  }

  console.log('Register request:', req.body);

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const { data: existingUserByEmail, error: emailCheckError } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUserByEmail) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  if (emailCheckError && emailCheckError.code !== 'PGRST116') {
    console.error('Supabase email check error:', emailCheckError);
    return res.status(500).json({ error: 'Error checking email existence' });
  }

  const { data: existingUserByPhone, error: phoneCheckError } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone_number', phone_number)
    .single();

  if (existingUserByPhone) {
    return res.status(409).json({ error: 'Phone number already registered' });
  }
  if (phoneCheckError && phoneCheckError.code !== 'PGRST116') {
    console.error('Supabase phone check error:', phoneCheckError);
    return res.status(500).json({ error: 'Error checking phone number existence' });
  }

  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.REACT_APP_API_URL || 'http://localhost:8081'}/dashboard`,
      data: { full_name, phone_number, location, user_type },
    },
  });

  if (authError) {
    console.error('Supabase auth error:', authError);
    return res.status(500).json({ error: authError.message });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: authUser.user.id,
      full_name,
      phone_number,
      location,
      user_type,
      is_verified: false,
    })
    .select()
    .single();

  if (profileError) {
    console.error('Supabase profile insert error:', profileError);
    return res.status(500).json({ error: 'Failed to create profile: ' + profileError.message });
  }

  await User.findOneAndUpdate(
    { supabaseUserId: authUser.user.id },
    {
      $set: {
        supabaseUserId: authUser.user.id,
        full_name,
        phone_number,
        location,
        user_type,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    },
    { upsert: true },
  );

  res.status(200).json({ message: 'Account created! Please check your email to verify your account.', user: profile });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  console.log('Login attempt:', { email });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Supabase auth error:', error);
    return res.status(401).json({ error: error.message });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, phone_number, location, user_type, is_verified, avatar_url, created_at, updated_at')
    .eq('user_id', data.user.id)
    .single();

  if (profileError || !profile) {
    console.error('Profile fetch error:', profileError);
    // Create a default profile if not found
    const { data: newProfile, error: newProfileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        full_name: data.user.user_metadata.full_name || 'Unknown',
        phone_number: data.user.user_metadata.phone_number || '',
        location: data.user.user_metadata.location || '',
        user_type: data.user.user_metadata.user_type || 'farmer',
        is_verified: false,
      })
      .select()
      .single();

    if (newProfileError) {
      console.error('Profile creation error:', newProfileError);
      return res.status(500).json({ error: 'Failed to create profile: ' + newProfileError.message });
    }

    await User.findOneAndUpdate(
      { supabaseUserId: data.user.id },
      {
        $set: {
          supabaseUserId: data.user.id,
          full_name: newProfile.full_name,
          phone_number: newProfile.phone_number,
          location: newProfile.location,
          user_type: newProfile.user_type,
          is_verified: newProfile.is_verified,
          avatar_url: newProfile.avatar_url,
          updated_at: new Date(),
        },
      },
      { upsert: true },
    );

    return res.status(200).json({ user: data.user, session: data.session, profile: newProfile });
  }

  await User.findOneAndUpdate(
    { supabaseUserId: data.user.id },
    {
      $set: {
        supabaseUserId: data.user.id,
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        location: profile.location,
        user_type: profile.user_type,
        is_verified: profile.is_verified,
        avatar_url: profile.avatar_url,
        updated_at: new Date(),
      },
    },
    { upsert: true },
  );

  res.status(200).json({ user: data.user, session: data.session, profile });
};

export const signout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Error signing out:', error);
    return res.status(500).json({ error: 'Failed to sign out' });
  }
};