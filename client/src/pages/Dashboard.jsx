import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Stories from '../components/Stories'
import { loginSuccess } from '../redux/slices/authSlice'

function PeopleSidebar({ token, currentUser }) {
  const [people, setPeople] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [myConnections, setMyConnections] = useState([])

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/connections/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPeople(res.data.slice(0, 3))
      } catch (error) {
        console.log(error)
      }
    }

    const fetchMyConnections = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/connections/my-connections', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const ids = res.data.connections.map(c => c._id)
        const reqIds = res.data.connectionRequests.map(r => r._id)
        setMyConnections([...ids, ...reqIds])
      } catch (error) {
        console.log(error)
      }
    }

    fetchPeople()
    fetchMyConnections()
  }, [])

  const handleConnect = async (userId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/connections/send/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSentRequests(prev => [...prev, userId])
    } catch (error) {
      console.log(error)
    }
  }

  const getStatus = (userId) => {
    if (myConnections.includes(userId)) return 'connected'
    if (sentRequests.includes(userId)) return 'sent'
    return 'none'
  }

  if (people.length === 0) return (
    <p className="text-sm text-gray-400 dark:text-gray-500">No suggestions yet</p>
  )

  return (
    <>
      {people.map((person) => (
        <div key={person._id} className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {person.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{person.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate w-24">
                {person.headline || 'ProConnect Member'}
              </p>
            </div>
          </div>
          {getStatus(person._id) === 'connected' ? (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Connected ✓
            </span>
          ) : getStatus(person._id) === 'sent' ? (
            <span className="text-xs text-gray-400 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded-full">
              Sent ✓
            </span>
          ) : (
            <button
              onClick={() => handleConnect(person._id)}
              className="text-xs border border-blue-600 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900 transition"
            >
              Connect
            </button>
          )}
        </div>
      ))}
    </>
  )
}

function Dashboard() {
  const { user, token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(false)
  const [commentText, setCommentText] = useState({})
  const [showComments, setShowComments] = useState({})
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [shareMessage, setShareMessage] = useState('')
  const photoRef = useRef(null)
  const videoRef = useRef(null)

  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/me', config)
        dispatch(loginSuccess({ user: res.data, token }))
      } catch (error) {
        console.log(error)
      }
    }
    fetchMe()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts', config)
      setPosts(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (photoRef.current) photoRef.current.value = ''
    if (videoRef.current) videoRef.current.value = ''
  }

  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedImage) return
    setLoading(true)
    try {
      let imageUrl = ''
      if (selectedImage) {
        try {
          const formData = new FormData()
          formData.append('file', selectedImage)
          formData.append('upload_preset', 'proconnect')
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          const uploadRes = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
            formData
          )
          imageUrl = uploadRes.data.secure_url
        } catch (uploadError) {
          console.log('Image upload failed:', uploadError)
        }
      }
      const res = await axios.post(
        'http://localhost:5000/api/posts',
        { content: newPost, image: imageUrl },
        config
      )
      setPosts([res.data, ...posts])
      setNewPost('')
      setSelectedImage(null)
      setImagePreview(null)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        config
      )
      setPosts(posts.map(p => p._id === postId ? res.data : p))
    } catch (error) {
      console.log(error)
    }
  }

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`,
        { text: commentText[postId] },
        config
      )
      setPosts(posts.map(p => p._id === postId ? res.data : p))
      setCommentText({ ...commentText, [postId]: '' })
    } catch (error) {
      console.log(error)
    }
  }

  const handleShare = (post) => {
    const text = `Check out this post by ${post.author?.name} on ProConnect: "${post.content?.slice(0, 100)}..."`
    if (navigator.share) {
      navigator.share({ title: 'ProConnect Post', text: text })
    } else {
      navigator.clipboard.writeText(text)
      setShareMessage(post._id)
      setTimeout(() => setShareMessage(''), 2000)
    }
  }

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, config)
      setPosts(posts.filter(p => p._id !== postId))
    } catch (error) {
      console.log(error)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <input type="file" accept="image/*" ref={photoRef} onChange={handleImageSelect} className="hidden" />
      <input type="file" accept="video/*" ref={videoRef} onChange={handleImageSelect} className="hidden" />

      <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Left Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-blue-400 to-blue-600"/>
              <div className="flex flex-col items-center -mt-8 pb-4 px-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h2 className="mt-2 font-semibold text-gray-800 dark:text-white text-center">{user?.name}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  {user?.headline || 'Add a headline'}
                </p>
                <Link to="/profile" className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                  View Profile
                </Link>
              </div>
              <div className="border-t dark:border-gray-700 px-4 py-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Connections</span>
                  <span className="text-blue-600 font-semibold">
                    {user?.connections?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Feed */}
          <div className="md:col-span-2 space-y-4">
            <Stories />

            {/* Create Post */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={3}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {imagePreview && (
                <div className="mt-3 relative">
                  <img src={imagePreview} alt="preview" className="w-full rounded-lg max-h-64 object-cover" />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500"
                  >✕</button>
                </div>
              )}

              <div className="flex justify-between items-center mt-3 pt-3 border-t dark:border-gray-700">
                <div className="flex gap-4">
                  <button
                    onClick={() => photoRef.current.click()}
                    className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm hover:text-blue-600 font-medium"
                  >📷 Photo</button>
                  <button
                    onClick={() => videoRef.current.click()}
                    className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm hover:text-blue-600 font-medium"
                  >🎥 Video</button>
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={loading || (!newPost.trim() && !selectedImage)}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            {posts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-400">
                No posts yet. Be the first to post!
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        {post.author?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                          {post.author?.name}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {post.author?.headline || 'ProConnect Member'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    {post.author?._id === user?._id && (
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >🗑️ Delete</button>
                    )}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{post.content}</p>

                  {post.image && (
                    <img src={post.image} alt="post" className="w-full rounded-lg mb-3 max-h-96 object-cover" />
                  )}

                  <div className="flex gap-4 text-xs text-gray-400 dark:text-gray-500 mb-2 pb-2 border-b dark:border-gray-700">
                    <span>👍 {post.likes?.length || 0} likes</span>
                    <span>💬 {post.comments?.length || 0} comments</span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition flex-1 justify-center
                        ${post.likes?.includes(user?._id)
                          ? 'text-blue-600 bg-blue-50 dark:bg-blue-900'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >👍 Like</button>
                    <button
                      onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                      className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-1 justify-center"
                    >💬 Comment</button>
                    <button
                      onClick={() => handleShare(post)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-1 justify-center"
                    >
                      {shareMessage === post._id ? '✅ Copied!' : '🔁 Share'}
                    </button>
                  </div>

                  {showComments[post._id] && (
                    <div className="mt-2">
                      {post.comments?.map((comment, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {comment.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 flex-1">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {comment.user?.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <input
                          type="text"
                          value={commentText[post._id] || ''}
                          onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                          placeholder="Add a comment..."
                          className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleComment(post._id)}
                          className="text-blue-600 text-xs font-medium hover:text-blue-700"
                        >Post</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">People you may know</h3>
              <PeopleSidebar token={token} currentUser={user} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Trending</h3>
              {['React 19 released', 'AI in Web Development', 'Top skills for 2025'].map((item) => (
                <div key={item} className="mb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 cursor-pointer">• {item}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard