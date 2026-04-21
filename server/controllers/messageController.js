import Message from '../models/Message.js'
import User from '../models/User.js'

// Get all conversations (unique users I have messaged)
export const getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId },
        { receiver: req.userId }
      ]
    }).populate('sender', 'name headline profilePhoto')
      .populate('receiver', 'name headline profilePhoto')
      .sort({ createdAt: -1 })

    // Get unique conversation partners
    const conversationMap = {}
    messages.forEach(msg => {
      const other = msg.sender._id.toString() === req.userId
        ? msg.receiver
        : msg.sender
      if (!conversationMap[other._id]) {
        conversationMap[other._id] = {
          user: other,
          lastMessage: msg,
          unread: msg.receiver._id.toString() === req.userId && !msg.read ? 1 : 0
        }
      }
    })

    res.status(200).json(Object.values(conversationMap))
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get messages between me and another user
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ]
    }).populate('sender', 'name profilePhoto')
      .sort({ createdAt: 1 })

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: req.userId, read: false },
      { read: true }
    )

    res.status(200).json(messages)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params
    const { content } = req.body

    const message = await Message.create({
      sender: req.userId,
      receiver: userId,
      content
    })

    await message.populate('sender', 'name profilePhoto')
    await message.populate('receiver', 'name profilePhoto')

    res.status(201).json(message)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}