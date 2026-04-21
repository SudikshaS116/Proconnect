import Post from '../models/Post.js'
import Notification from '../models/Notification.js'
import User from '../models/User.js'

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body
    if (!content && !image) {
      return res.status(400).json({ message: 'Post cannot be empty' })
    }
    const post = await Post.create({
      author: req.userId,
      content: content || '',
      image: image || ''
    })
    await post.populate('author', 'name headline profilePhoto')
    res.status(201).json(post)
  } catch (error) {
    console.log('POST CREATE ERROR:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name headline profilePhoto')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 })
    res.status(200).json(posts)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const alreadyLiked = post.likes.includes(req.userId)
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.userId)
    } else {
      post.likes.push(req.userId)

      // Notify post author (not if liking own post)
      if (post.author.toString() !== req.userId) {
        const liker = await User.findById(req.userId)
        await Notification.create({
          recipient: post.author,
          sender: req.userId,
          type: 'post_like',
          message: `${liker.name} liked your post`,
          link: '/dashboard'
        })
      }
    }
    await post.save()
    res.status(200).json(post)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const addComment = async (req, res) => {
  try {
    const { text } = req.body
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    post.comments.push({ user: req.userId, text })
    await post.save()
    await post.populate('comments.user', 'name')

    // Notify post author (not if commenting on own post)
    if (post.author.toString() !== req.userId) {
      const commenter = await User.findById(req.userId)
      await Notification.create({
        recipient: post.author,
        sender: req.userId,
        type: 'post_comment',
        message: `${commenter.name} commented on your post`,
        link: '/dashboard'
      })
    }

    res.status(200).json(post)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    await post.deleteOne()
    res.status(200).json({ message: 'Post deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}