import express from 'express'
import {
  getConversations,
  getMessages,
  sendMessage
} from '../controllers/messageController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/conversations', authMiddleware, getConversations)
router.get('/:userId', authMiddleware, getMessages)
router.post('/:userId', authMiddleware, sendMessage)

export default router