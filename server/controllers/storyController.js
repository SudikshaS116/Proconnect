import Story from '../models/Story.js'

export const createStory = async (req, res) => {
  try {
    const { content, image, backgroundColor } = req.body
    if (!content && !image) {
      return res.status(400).json({ message: 'Story cannot be empty' })
    }
    const story = await Story.create({
      author: req.userId,
      content,
      image,
      backgroundColor: backgroundColor || '#1d4ed8'
    })
    await story.populate('author', 'name headline profilePhoto')
    res.status(201).json(story)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getStories = async (req, res) => {
  try {
    const stories = await Story.find({
      expiresAt: { $gt: new Date() }
    })
      .populate('author', 'name headline profilePhoto')
      .populate('viewers', 'name profilePhoto')
      .sort({ createdAt: -1 })
    res.status(200).json(stories)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
    if (!story) return res.status(404).json({ message: 'Story not found' })

    // Add viewer if not already viewed
    const alreadyViewed = story.viewers.some(
      v => v.toString() === req.userId.toString()
    )
    if (!alreadyViewed) {
      story.viewers.push(req.userId)
      await story.save()
    }

    // Return with populated viewers
    const populated = await Story.findById(story._id)
      .populate('author', 'name headline profilePhoto')
      .populate('viewers', 'name profilePhoto')

    res.status(200).json(populated)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
    if (!story) return res.status(404).json({ message: 'Story not found' })
    if (story.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    await story.deleteOne()
    res.status(200).json({ message: 'Story deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}