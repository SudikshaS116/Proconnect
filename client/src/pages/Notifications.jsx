import BASE_URL from '../utils/api'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

function Notifications() {
  const { token } = useSelector((state) => state.auth)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('https://proconnect-07nx.onrender.com/api/notifications', config)
      setNotifications(res.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await axios.put('HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/notifications/mark-all-read', {}, config)
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.log(error)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/notifications/${id}/read`, {}, config)
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n))
    } catch (error) {
      console.log(error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/notifications/${id}`, config)
      setNotifications(notifications.filter(n => n._id !== id))
    } catch (error) {
      console.log(error)
    }
  }

  const handleClick = async (notification) => {
    await handleMarkRead(notification._id)
    navigate(notification.link || '/dashboard')
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request': return '🤝'
      case 'connection_accepted': return '✅'
      case 'post_like': return '👍'
      case 'post_comment': return '💬'
      case 'message': return '✉️'
      default: return '🔔'
    }
  }

  const formatTime = (date) => {
    const now = new Date()
    const then = new Date(date)
    const diff = Math.floor((now - then) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-8">

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-blue-600 mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-sm text-blue-600 hover:underline font-medium">
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-400">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <div className="text-5xl mb-3">🔔</div>
            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition
                  ${!notification.read ? 'border-l-4 border-blue-600' : ''}`}
                onClick={() => handleClick(notification)}
              >
                <div className="text-2xl flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {notification.sender?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-800 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"/>}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(notification._id) }}
                    className="text-gray-300 dark:text-gray-600 hover:text-red-500 text-xs p-1"
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications