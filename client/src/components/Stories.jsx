import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'

const COLORS = [
  '#1d4ed8', '#7c3aed', '#db2777',
  '#dc2626', '#d97706', '#059669',
  '#0891b2', '#4f46e5'
]

function Stories() {
  const { user, token } = useSelector((state) => state.auth)
  const [stories, setStories] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [storyIndex, setStoryIndex] = useState(0)
  const [newStory, setNewStory] = useState({ content: '', backgroundColor: '#1d4ed8' })
  const [storyImage, setStoryImage] = useState(null)
  const [storyImagePreview, setStoryImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const fileRef = useRef(null)
  const progressRef = useRef(null)

  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    fetchStories()
  }, [])

  useEffect(() => {
    if (selectedGroup && !paused) {
      setProgress(0)
      clearInterval(progressRef.current)
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNextInGroup()
            return 0
          }
          return prev + 2
        })
      }, 100)
    } else {
      clearInterval(progressRef.current)
    }
    return () => clearInterval(progressRef.current)
  }, [selectedGroup, storyIndex, paused])

  const fetchStories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stories', config)
      setStories(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleCreateStory = async () => {
    if (!newStory.content.trim() && !storyImage) return
    setLoading(true)
    try {
      let imageUrl = ''
      if (storyImage) {
        const formData = new FormData()
        formData.append('file', storyImage)
        formData.append('upload_preset', 'proconnect')
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
          formData
        )
        imageUrl = uploadRes.data.secure_url
      }
      await axios.post('http://localhost:5000/api/stories', {
        content: newStory.content,
        backgroundColor: newStory.backgroundColor,
        image: imageUrl
      }, config)
      setNewStory({ content: '', backgroundColor: '#1d4ed8' })
      setStoryImage(null)
      setStoryImagePreview(null)
      setShowCreate(false)
      fetchStories()
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewGroup = async (group) => {
    // Always fetch fresh stories before viewing
    try {
      const res = await axios.get('http://localhost:5000/api/stories', config)
      const freshStories = res.data
      setStories(freshStories)

      // Rebuild the group with fresh data
      const freshGroup = {
        author: group.author,
        stories: freshStories.filter(s => s.author._id === group.author._id)
      }

      if (freshGroup.stories.length === 0) {
        alert('This story has expired!')
        return
      }

      setSelectedGroup(freshGroup)
      setStoryIndex(0)
      setPaused(false)

      // Mark first story as viewed
      const viewRes = await axios.put(
        `http://localhost:5000/api/stories/${freshGroup.stories[0]._id}/view`,
        {},
        config
      )

      // Update with viewer data
      setSelectedGroup({
        ...freshGroup,
        stories: freshGroup.stories.map(s =>
          s._id === freshGroup.stories[0]._id ? viewRes.data : s
        )
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleNextInGroup = () => {
    clearInterval(progressRef.current)
    setProgress(0)
    if (selectedGroup && storyIndex < selectedGroup.stories.length - 1) {
      const nextIndex = storyIndex + 1
      setStoryIndex(nextIndex)
      setPaused(false)
      axios.put(
        `http://localhost:5000/api/stories/${selectedGroup.stories[nextIndex]._id}/view`,
        {},
        config
      ).then(res => {
        setSelectedGroup(prev => ({
          ...prev,
          stories: prev.stories.map(s =>
            s._id === selectedGroup.stories[nextIndex]._id ? res.data : s
          )
        }))
      }).catch(console.log)
    } else {
      setSelectedGroup(null)
      setStoryIndex(0)
    }
  }

  const handlePrevInGroup = () => {
    clearInterval(progressRef.current)
    setProgress(0)
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1)
      setPaused(false)
    }
  }

  const handleDeleteStory = async (storyId) => {
    try {
      await axios.delete(`http://localhost:5000/api/stories/${storyId}`, config)
      if (selectedGroup.stories.length <= 1) {
        setSelectedGroup(null)
        setStoryIndex(0)
      } else {
        const updatedGroupStories = selectedGroup.stories.filter(s => s._id !== storyId)
        const newIndex = Math.min(storyIndex, updatedGroupStories.length - 1)
        setSelectedGroup({ ...selectedGroup, stories: updatedGroupStories })
        setStoryIndex(newIndex)
      }
      fetchStories()
    } catch (error) {
      console.log(error)
    }
  }

  const togglePause = () => setPaused(prev => !prev)

  // Check if current story belongs to logged in user
  const isMyStory = (story) => {
    if (!story || !user) return false
    const authorId = story.author?._id || story.author
    const userId = user._id || user.id
    return authorId?.toString() === userId?.toString()
  }

  // Group stories by author
  const groupedStories = stories.reduce((acc, story) => {
    const authorId = story.author._id
    if (!acc[authorId]) {
      acc[authorId] = { author: story.author, stories: [] }
    }
    acc[authorId].stories.push(story)
    return acc
  }, {})

  const myGroup = groupedStories[user?._id] || groupedStories[user?.id]
  const otherGroups = Object.values(groupedStories).filter(g => {
    const gId = g.author._id?.toString()
    const myId = (user?._id || user?.id)?.toString()
    return gId !== myId
  })

  const currentStory = selectedGroup?.stories[storyIndex]

  return (
    <>
      {/* Stories Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <div className="flex gap-3 overflow-x-auto pb-2">

          {/* My Story */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            {myGroup ? (
              <button
                onClick={() => handleViewGroup(myGroup)}
                className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 hover:scale-105 transition"
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white dark:border-gray-800"
                  style={{ backgroundColor: myGroup.stories[0].backgroundColor }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </button>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="w-16 h-16 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-gray-700 transition"
              >
                <span className="text-blue-500 text-2xl">+</span>
              </button>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center w-16 truncate">
              My Story
            </span>
          </div>

          {/* Add More button if I have stories */}
          {myGroup && (
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setShowCreate(true)}
                className="w-16 h-16 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-gray-700 transition"
              >
                <span className="text-blue-500 text-2xl">+</span>
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center w-16 truncate">
                Add More
              </span>
            </div>
          )}

          {/* Other users' stories */}
          {otherGroups.map(({ author, stories: authorStories }) => (
            <div key={author._id} className="flex flex-col items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleViewGroup({ author, stories: authorStories })}
                className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 hover:scale-105 transition"
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white dark:border-gray-800"
                  style={{ backgroundColor: authorStories[0].backgroundColor }}
                >
                  {author.name?.charAt(0).toUpperCase()}
                </div>
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center w-16 truncate">
                {author.name?.split(' ')[0]}
              </span>
            </div>
          ))}

          {Object.keys(groupedStories).length === 0 && (
            <div className="flex items-center text-gray-400 text-sm ml-2">
              No stories yet — be the first!
            </div>
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedGroup && currentStory && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-sm mx-4">

            {/* Progress Bars */}
            <div className="flex gap-1 mb-3 px-2">
              {selectedGroup.stories.map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{
                      width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {currentStory.author?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {currentStory.author?.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {new Date(currentStory.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                    {selectedGroup.stories.length > 1 &&
                      ` · ${storyIndex + 1}/${selectedGroup.stories.length}`
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={togglePause} className="text-white text-lg hover:text-gray-300">
                  {paused ? '▶️' : '⏸️'}
                </button>

                {/* Delete button — uses isMyStory helper for reliable comparison */}
                {isMyStory(currentStory) && (
                  <button
                    onClick={() => handleDeleteStory(currentStory._id)}
                    className="text-gray-300 hover:text-red-400 transition"
                    title="Delete story"
                  >
                    🗑️
                  </button>
                )}

                <button
                  onClick={() => {
                    clearInterval(progressRef.current)
                    setSelectedGroup(null)
                    setStoryIndex(0)
                  }}
                  className="text-white text-xl hover:text-gray-300"
                >✕</button>
              </div>
            </div>

            {/* Story Card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: currentStory.backgroundColor }}
            >
              {currentStory.image && (
                <img
                  src={currentStory.image}
                  alt="story"
                  className="w-full object-contain max-h-96"
                  style={{ display: 'block' }}
                />
              )}

              {!currentStory.image && currentStory.content && (
                <div className="flex items-center justify-center p-8" style={{ minHeight: '400px' }}>
                  <p className="text-white text-2xl font-semibold text-center leading-relaxed drop-shadow-lg">
                    {currentStory.content}
                  </p>
                </div>
              )}

              {currentStory.image && currentStory.content && (
                <div className="px-4 py-3 bg-black bg-opacity-40">
                  <p className="text-white text-sm text-center">{currentStory.content}</p>
                </div>
              )}

              {/* Views */}
              <div className="px-4 py-2 bg-black bg-opacity-20">
                <div className="flex justify-between items-center">
                  <span className="text-white text-xs">
                    👁️ {currentStory.viewers?.length || 0} views
                  </span>
                  {paused && <span className="text-yellow-300 text-xs">⏸ Paused</span>}
                </div>

                {/* Viewer names — only for owner */}
                {isMyStory(currentStory) && currentStory.viewers?.length > 0 && (
                  <div className="mt-2 max-h-20 overflow-y-auto">
                    <p className="text-white text-xs mb-1 font-medium">Viewed by:</p>
                    <div className="flex flex-wrap gap-1">
                      {currentStory.viewers.map((viewer, i) => (
                           <span key={i} className="text-gray-900 text-xs bg-white px-2 py-0.5 rounded-full font-medium">
                                {typeof viewer === 'object' ? viewer.name : viewer}
                            </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-4 px-2">
              <button
                onClick={handlePrevInGroup}
                disabled={storyIndex === 0}
                className="text-white bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-full text-sm disabled:opacity-30 transition"
              >← Prev</button>
              <button
                onClick={handleNextInGroup}
                className="text-white bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-full text-sm transition"
              >
                {storyIndex === selectedGroup.stories.length - 1 ? 'Close ✕' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">

            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Create Story</h2>
              <button
                onClick={() => {
                  setShowCreate(false)
                  setStoryImagePreview(null)
                  setStoryImage(null)
                  setNewStory({ content: '', backgroundColor: '#1d4ed8' })
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
              >✕</button>
            </div>

            <div
              className="mx-4 mt-4 rounded-xl overflow-hidden"
              style={{ backgroundColor: newStory.backgroundColor }}
            >
              {storyImagePreview ? (
                <img src={storyImagePreview} alt="preview" className="w-full object-contain max-h-48" />
              ) : (
                <div className="flex items-center justify-center" style={{ minHeight: '120px' }}>
                  {newStory.content ? (
                    <p className="text-white text-lg font-semibold text-center px-4 drop-shadow">
                      {newStory.content}
                    </p>
                  ) : (
                    <p className="text-white text-opacity-50 text-sm">Story preview</p>
                  )}
                </div>
              )}
              {storyImagePreview && newStory.content && (
                <div className="px-3 py-2 bg-black bg-opacity-40">
                  <p className="text-white text-sm text-center">{newStory.content}</p>
                </div>
              )}
            </div>

            <div className="p-4 space-y-4">
              <textarea
                value={newStory.content}
                onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                placeholder={storyImagePreview ? "Add a caption..." : "Write something for your story..."}
                rows={2}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
              />

              {!storyImagePreview && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Background Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewStory({ ...newStory, backgroundColor: color })}
                        className={`w-8 h-8 rounded-full transition hover:scale-110 ${newStory.backgroundColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      setStoryImage(file)
                      setStoryImagePreview(URL.createObjectURL(file))
                    }
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current.click()}
                  className="w-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  📷 {storyImagePreview ? 'Change Image' : 'Add Image'}
                </button>
                {storyImagePreview && (
                  <button
                    onClick={() => { setStoryImage(null); setStoryImagePreview(null) }}
                    className="text-red-500 text-xs mt-1 hover:underline"
                  >Remove image</button>
                )}
              </div>

              <button
                onClick={handleCreateStory}
                disabled={loading || (!newStory.content.trim() && !storyImage)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Posting...' : '🚀 Share Story'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Stories