import{
  createProf,
  getProfileByUserId,
  updateProf,
  deleteProfileByUserId
} from '../Model/profileModel.js';

// Create a new profile
export const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, email, phone, bio, country, city, skills, avatar_url } = req.body;
    
    const profile = await createProf(userId, fullName, email, phone, bio, country, city, skills, avatar_url);
    res.status(201).json({ success: true, profile });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating profile' });
  }
};

// Get profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    res.json({ success: true, profile });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error getting profile' });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const existing = await getProfileByUserId(userId);
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    const { fullName, email, phone, bio, country, city, skills, avatar_url } = req.body;
    
    const updated = await updateProf(
      userId,
      fullName || existing.name,
      email|| existing.name,
      phone|| existing.name,
      country|| existing.name, 
      city|| existing.name,
      skills|| existing.name,
      bio || existing.bio,
      avatar_url || existing.avatar_url
    );
    
    res.json({ success: true, message: 'Profile updated successfully', profile: updated });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

// Delete profile
export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await deleteProfileByUserId(userId);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    res.json({ success: true, message: 'Profile deleted successfully' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting profile' });
  }
};



export const updateAvailability = async (req, res) => {
  const userId = req.user?.id;
  const { availability } = req.body;

  if (!availability) {
    return res.status(400).json({ success: false, message: 'Availability status required' });
  }

  try {
    await client.query(
      'UPDATE profiles SET availability = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [availability, userId]
    );

    return res.status(200).json({ success: true, message: 'Availability updated' });
  } catch (err) {
    console.error('Error updating availability:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
