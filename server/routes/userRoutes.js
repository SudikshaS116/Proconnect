import express from 'express'
import {
  getMyProfile,
  updateProfile,
  getUserProfile,
  searchUsers
} from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/me', authMiddleware, getMyProfile)
router.get('/search', authMiddleware, searchUsers)
router.put('/update', authMiddleware, updateProfile)
router.get('/:id', authMiddleware, getUserProfile)

export default router