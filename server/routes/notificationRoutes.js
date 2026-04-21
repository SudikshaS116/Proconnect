import express from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notificationController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, getNotifications)
router.get('/unread-count', authMiddleware, getUnreadCount)
router.put('/:id/read', authMiddleware, markAsRead)
router.put('/mark-all-read', authMiddleware, markAllAsRead)
router.delete('/:id', authMiddleware, deleteNotification)

export default router