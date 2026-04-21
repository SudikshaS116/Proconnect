import express from 'express'
import {
  getAllUsers,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getMyConnections
} from '../controllers/connectionController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/users', authMiddleware, getAllUsers)
router.get('/my-connections', authMiddleware, getMyConnections)
router.post('/send/:userId', authMiddleware, sendConnectionRequest)
router.post('/accept/:userId', authMiddleware, acceptConnectionRequest)
router.post('/reject/:userId', authMiddleware, rejectConnectionRequest)
router.delete('/remove/:userId', authMiddleware, removeConnection)

export default router