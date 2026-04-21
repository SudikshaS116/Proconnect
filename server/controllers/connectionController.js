import User from '../models/User.js'
import Notification from '../models/Notification.js'

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('-password')
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params
    const me = await User.findById(req.userId)
    const other = await User.findById(userId)

    if (!other) return res.status(404).json({ message: 'User not found' })

    if (other.connectionRequests.includes(req.userId)) {
      return res.status(400).json({ message: 'Request already sent' })
    }

    if (other.connections.includes(req.userId)) {
      return res.status(400).json({ message: 'Already connected' })
    }

    other.connectionRequests.push(req.userId)
    await other.save()

    // Create notification
    await Notification.create({
      recipient: userId,
      sender: req.userId,
      type: 'connection_request',
      message: `${me.name} sent you a connection request`,
      link: '/network'
    })

    res.status(200).json({ message: 'Connection request sent' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params
    const me = await User.findById(req.userId)
    const other = await User.findById(userId)

    if (!me.connectionRequests.includes(userId)) {
      return res.status(400).json({ message: 'No request found' })
    }

    me.connections.push(userId)
    other.connections.push(req.userId)

    me.connectionRequests = me.connectionRequests.filter(
      id => id.toString() !== userId
    )

    await me.save()
    await other.save()

    // Create notification
    await Notification.create({
      recipient: userId,
      sender: req.userId,
      type: 'connection_accepted',
      message: `${me.name} accepted your connection request`,
      link: '/network'
    })

    res.status(200).json({ message: 'Connection accepted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const rejectConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params
    const me = await User.findById(req.userId)

    me.connectionRequests = me.connectionRequests.filter(
      id => id.toString() !== userId
    )
    await me.save()

    res.status(200).json({ message: 'Request rejected' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const removeConnection = async (req, res) => {
  try {
    const { userId } = req.params
    const me = await User.findById(req.userId)
    const other = await User.findById(userId)

    me.connections = me.connections.filter(id => id.toString() !== userId)
    other.connections = other.connections.filter(
      id => id.toString() !== req.userId
    )

    await me.save()
    await other.save()

    res.status(200).json({ message: 'Connection removed' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getMyConnections = async (req, res) => {
  try {
    const me = await User.findById(req.userId)
      .populate('connections', 'name headline profilePhoto location')
      .populate('connectionRequests', 'name headline profilePhoto location')
    res.status(200).json({
      connections: me.connections,
      connectionRequests: me.connectionRequests
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}