import User from '../models/User.js'

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { name, headline, about, location, skills, experience, education } = req.body
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, headline, about, location, skills, experience, education },
      { new: true }
    ).select('-password')
    res.status(200).json({ message: 'Profile updated', user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Search users by name or skills
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query
    if (!query) return res.status(200).json([])

    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { headline: { $regex: query, $options: 'i' } },
        { skills: { $in: [new RegExp(query, 'i')] } },
        { location: { $regex: query, $options: 'i' } }
      ]
    }).select('-password').limit(10)

    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}