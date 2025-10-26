import express from 'express';
import supabase from '../config/supabase.js';

const router = express.Router();

/**
 * @swagger
 * /api/profile/{userId}:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, phone_number, location, user_type, is_verified, avatar_url, created_at, updated_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;