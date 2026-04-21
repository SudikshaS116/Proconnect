import express from 'express'
import {
  createStory,
  getStories,
  viewStory,
  deleteStory
} from '../controllers/storyController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', authMiddleware, createStory)
router.get('/', authMiddleware, getStories)
router.put('/:id/view', authMiddleware, viewStory)
router.delete('/:id', authMiddleware, deleteStory)

export default router