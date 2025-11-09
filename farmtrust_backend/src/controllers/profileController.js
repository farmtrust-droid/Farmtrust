import supabase from '../config/supabase.js';

export const getProfile = async (req, res) => {
  const { userId } = req.params;

  console.log('Fetching profile for userId:', userId);

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, phone_number, location, user_type, is_verified, avatar_url, created_at, updated_at')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      console.error('Profile fetch error:', error);
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};