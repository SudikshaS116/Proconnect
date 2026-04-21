import Notification from '../models/Notification.js'

// Get all my notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate('sender', 'name headline profilePhoto')
      .sort({ createdAt: -1 })
      .limit(50)
    res.status(200).json(notifications)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Mark single notification as read
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true })
    res.status(200).json({ message: 'Marked as read' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { read: true }
    )
    res.status(200).json({ message: 'All marked as read' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Notification deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.userId,
      read: false
    })
    res.status(200).json({ count })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}