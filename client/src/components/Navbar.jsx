import BASE_URL from '../utils/api'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../redux/slices/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { toggleTheme } from '../redux/slices/themeSlice'
import axios from 'axios'

function Navbar() {
  const { user, token } = useSelector((state) => state.auth)
  const { isDark } = useSelector((state) => state.theme)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef(null)

  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }
    const timer = setTimeout(() => {
      handleSearch()
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearch = async () => {
    setSearching(true)
    try {
      const res = await axios.get(
        `https://proconnect-07nx.onrender.com/api/users/search?query=${searchQuery}`,
        config
      )
      setSearchResults(res.data)
      setShowResults(true)
    } catch (error) {
      console.log(error)
    } finally {
      setSearching(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        'HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/notifications/unread-count',
        config
      )
      setUnreadCount(res.data.count)
    } catch (error) {
      console.log(error)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleSelectUser = (userId) => {
    setShowResults(false)
    setSearchQuery('')
    navigate(`/user/${userId}`)
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm fixed top-0 left-0 right-0 z-50 border-b dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">

        {/* Left - Logo + Search */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <h1 className="text-2xl font-bold text-blue-600">ProConnect</h1>
          </Link>
          {/* Search Box */}
          <div className="relative hidden md:block" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search people, skills..."
              className="bg-gray-100 dark:bg-gray-700 dark:text-white px-4 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
            />
            {searching && (
              <div className="absolute right-3 top-2 text-gray-400 text-xs">...</div>
            )}

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-10 left-0 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <>
                    <div className="p-2 border-b">
                      <p className="text-xs text-gray-400 px-2">
                        {searchResults.length} result(s) found
                      </p>
                    </div>
                    {searchResults.map((u) => (
                      <div
                        key={u._id}
                        onClick={() => handleSelectUser(u._id)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {u.headline || 'ProConnect Member'}
                          </p>
                          {u.skills?.length > 0 && (
                            <p className="text-xs text-blue-500 truncate">
                              {u.skills.slice(0, 3).join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right - Nav Links */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>

          <Link to="/network" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Network</span>
          </Link>

          <Link to="/messaging" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Messaging</span>
          </Link>

          <Link to="/notifications" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm flex flex-col items-center relative">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span>Notifications</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-lg"
              title="Toggle dark mode"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            <Link to="/profile" className="flex flex-col items-center text-gray-600 hover:text-blue-600 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span>Me</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar