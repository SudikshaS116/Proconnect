import BASE_URL from '../utils/api'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Navbar from '../components/Navbar'

function UserProfile() {
  const { id } = useParams()
  const { user, token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('none')
  const [actionLoading, setActionLoading] = useState(false)

  const config = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    if (id === user?._id) { navigate('/profile'); return }
    fetchProfile()
    checkConnectionStatus()
  }, [id])

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/users/${id}`, config)
      setProfile(res.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const checkConnectionStatus = async () => {
    try {
      const res = await axios.get('HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/connections/my-connections', config)
      const isConnected = res.data.connections.some(c => c._id === id)
      const hasRequest = res.data.connectionRequests.some(r => r._id === id)
      if (isConnected) setConnectionStatus('connected')
      else if (hasRequest) setConnectionStatus('request_received')
    } catch (error) {
      console.log(error)
    }
  }

  const handleConnect = async () => {
    setActionLoading(true)
    try {
      await axios.post(`HTTPS://PROCONNECT-07NX.ONRENDER.COM/api/connections/send/${id}`, {}, config)
      setConnectionStatus('request_sent')
    } catch (error) {
      console.log(error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="flex items-center justify-center pt-32 text-gray-400">Loading...</div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="flex items-center justify-center pt-32 text-gray-400">User not found</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-8 space-y-4">

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600" />
          <div className="px-6 pb-6">
            <div className="flex justify-between items-start">
              <div className="-mt-12">
                <div className="w-24 h-24 rounded-full bg-blue-600 border-4 border-white dark:border-gray-800 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {connectionStatus === 'connected' ? (
                  <button onClick={() => navigate('/messaging')} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition">
                    💬 Message
                  </button>
                ) : connectionStatus === 'request_sent' ? (
                  <button disabled className="border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 px-4 py-1.5 rounded-full text-sm">
                    Request Sent ✓
                  </button>
                ) : (
                  <button onClick={handleConnect} disabled={actionLoading} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
                    {actionLoading ? '...' : '+ Connect'}
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{profile.name}</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{profile.headline || 'ProConnect Member'}</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{profile.location || ''}</p>
              <p className="text-blue-600 text-sm mt-1">{profile.connections?.length || 0} connections</p>
            </div>
          </div>
        </div>

        {profile.about && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">About</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{profile.about}</p>
          </div>
        )}

        {profile.skills?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.experience?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Experience</h2>
            {profile.experience.map((exp, index) => (
              <div key={index} className="mb-3 pb-3 border-b dark:border-gray-700 last:border-0">
                <h3 className="font-medium text-gray-800 dark:text-white">{exp.role}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{exp.company}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">{exp.duration}</p>
              </div>
            ))}
          </div>
        )}

        {profile.education?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Education</h2>
            {profile.education.map((edu, index) => (
              <div key={index} className="mb-3 pb-3 border-b dark:border-gray-700 last:border-0">
                <h3 className="font-medium text-gray-800 dark:text-white">{edu.school}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{edu.degree}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">{edu.year}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default UserProfile