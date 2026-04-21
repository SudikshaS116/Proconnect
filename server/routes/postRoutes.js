import express from 'express'
import {
  createPost,
  getAllPosts,
  likePost,
  addComment,
  deletePost
} from '../controllers/postController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', authMiddleware, createPost)
router.get('/', authMiddleware, getAllPosts)
router.put('/:id/like', authMiddleware, likePost)
router.post('/:id/comment', authMiddleware, addComment)
router.delete('/:id', authMiddleware, deletePost)

export default router