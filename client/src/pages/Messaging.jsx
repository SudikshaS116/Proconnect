import BASE_URL from '../utils/api'
import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar'

const socket = io('${BASE_URL}')

function Messaging() {
  const { user, token } = useSelector((state) => state.auth)
  const [connections, setConnections] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    if (user?._id) socket.emit('join', user._id)
    socket.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message])
    })
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users)
    })
    return () => {
      socket.off('receiveMessage')
      socket.off('onlineUsers')
    }
  }, [user])

  useEffect(() => {
    fetchConnections()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConnections = async () => {
    try {
      const res = await axios.get('${BASE_URL}/api/connections/my-connections', config)
      setConnections(res.data.connections)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchMessages = async (userId) => {
    setLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/messages/${userId}`, config)
      setMessages(res.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = (u) => {
    setSelectedUser(u)
    fetchMessages(u._id)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return
    try {
      const res = await axios.post(
        `${BASE_URL}/api/messages/${selectedUser._id}`,
        { content: newMessage },
        config
      )
      setMessages(prev => [...prev, res.data])
      socket.emit('sendMessage', res.data)
      setNewMessage('')
    } catch (error) {
      console.log(error)
    }
  }

  const isOnline = (userId) => onlineUsers.includes(userId)

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex h-[calc(100vh-120px)]">

          {/* Left - Chat List */}
          <div className="w-80 border-r dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="font-bold text-gray-800 dark:text-white text-lg">Messaging</h2>
              <input
                type="text"
                placeholder="Search conversations..."
                className="mt-2 w-full bg-gray-100 dark:bg-gray-700 dark:text-white px-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {connections.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No connections yet!
                </div>
              ) : (
                connections.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleSelectUser(u)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b dark:border-gray-700
                      ${selectedUser?._id === u._id ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      {isOnline(u._id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"/>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">{u.name}</h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.headline || 'ProConnect Member'}</p>
                    </div>
                    {isOnline(u._id) && <span className="text-xs text-green-500 flex-shrink-0">Online</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right - Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-800">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </div>
                    {isOnline(selectedUser._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"/>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{selectedUser.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {isOnline(selectedUser._id) ? '🟢 Online' : '⚫ Offline'}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                  {loading ? (
                    <div className="text-center text-gray-400 text-sm">Loading...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-8">
                      Say hi to {selectedUser.name}! 👋
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.sender._id === user?._id || msg.sender === user?._id
                      return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm
                            ${isMe
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow rounded-bl-none'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Message ${selectedUser.name}...`}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 w-10 h-10 flex items-center justify-center"
                  >➤</button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:bg-gray-900">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Your Messages</h3>
                <p className="text-sm mt-2">Select a connection to start chatting</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Messaging