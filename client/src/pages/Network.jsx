import BASE_URL from '../utils/api'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Navbar from '../components/Navbar'

function Network() {
  const { user, token } = useSelector((state) => state.auth)
  const [allUsers, setAllUsers] = useState([])
  const [connections, setConnections] = useState([])
  const [requests, setRequests] = useState([])
  const [activeTab, setActiveTab] = useState('discover')
  const [actionLoading, setActionLoading] = useState({})

  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    fetchAllUsers()
    fetchMyConnections()
  }, [])

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get('HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/connections/users', config)
      setAllUsers(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchMyConnections = async () => {
    try {
      const res = await axios.get('HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/connections/my-connections', config)
      setConnections(res.data.connections)
      setRequests(res.data.connectionRequests)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSendRequest = async (userId) => {
    setActionLoading({ ...actionLoading, [userId]: true })
    try {
      await axios.post(`HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/connections/send/${userId}`, {}, config)
      fetchAllUsers()
      fetchMyConnections()
    } catch (error) {
      console.log(error)
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false })
    }
  }

  const handleAccept = async (userId) => {
    setActionLoading({ ...actionLoading, [userId]: true })
    try {
      await axios.post(`HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/connections/accept/${userId}`, {}, config)
      fetchMyConnections()
      fetchAllUsers()
    } catch (error) {
      console.log(error)
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false })
    }
  }

  const handleReject = async (userId) => {
    setActionLoading({ ...actionLoading, [userId]: true })
    try {
      await axios.post(`HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/connections/reject/${userId}`, {}, config)
      fetchMyConnections()
    } catch (error) {
      console.log(error)
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false })
    }
  }

  const handleRemove = async (userId) => {
    setActionLoading({ ...actionLoading, [userId]: true })
    try {
      await axios.delete(`HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/connections/remove/${userId}`, config)
      fetchMyConnections()
      fetchAllUsers()
    } catch (error) {
      console.log(error)
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false })
    }
  }

  const getConnectionStatus = (userId) => {
    if (connections.some(c => c._id === userId)) return 'connected'
    if (requests.some(r => r._id === userId)) return 'request_received'
    return 'none'
  }

  const UserCard = ({ u }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {u.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white">{u.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{u.headline || 'ProConnect Member'}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{u.location || ''}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {getConnectionStatus(u._id) === 'connected' ? (
          <button onClick={() => handleRemove(u._id)} disabled={actionLoading[u._id]} className="text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            Connected ✓
          </button>
        ) : getConnectionStatus(u._id) === 'request_received' ? (
          <div className="flex gap-2">
            <button onClick={() => handleAccept(u._id)} disabled={actionLoading[u._id]} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition">Accept</button>
            <button onClick={() => handleReject(u._id)} disabled={actionLoading[u._id]} className="text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">Ignore</button>
          </div>
        ) : (
          <button onClick={() => handleSendRequest(u._id)} disabled={actionLoading[u._id]} className="text-sm border border-blue-600 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900 transition">
            {actionLoading[u._id] ? '...' : '+ Connect'}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">My Network</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {connections.length} connections · {requests.length} pending requests
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
          <div className="flex border-b dark:border-gray-700">
            {['discover', 'requests', 'connections'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium capitalize transition
                  ${activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                {tab === 'discover' && `Discover (${allUsers.length})`}
                {tab === 'requests' && `Requests (${requests.length})`}
                {tab === 'connections' && `Connections (${connections.length})`}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'discover' && (
          <div className="space-y-3">
            {allUsers.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-400">
                No other users found!
              </div>
            ) : (
              allUsers.map(u => <UserCard key={u._id} u={u} />)
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-400">
                No pending requests
              </div>
            ) : (
              requests.map(u => (
                <div key={u._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{u.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{u.headline || 'ProConnect Member'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(u._id)} disabled={actionLoading[u._id]} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition">Accept</button>
                    <button onClick={() => handleReject(u._id)} disabled={actionLoading[u._id]} className="text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">Ignore</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="space-y-3">
            {connections.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-400">
                No connections yet!
              </div>
            ) : (
              connections.map(u => (
                <div key={u._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{u.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{u.headline || 'ProConnect Member'}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{u.location || ''}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(u._id)} disabled={actionLoading[u._id]} className="text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default Network