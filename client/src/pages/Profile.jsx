import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loginSuccess } from '../redux/slices/authSlice'
import axios from 'axios'
import Navbar from '../components/Navbar'

function Profile() {
  const { user, token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    about: '',
    location: '',
    skills: '',
    experience: [],
    education: [],
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        headline: user.headline || '',
        about: user.about || '',
        location: user.location || '',
        skills: user.skills?.join(', ') || '',
        experience: user.experience || [],
        education: user.education || [],
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await axios.put(
        'http://localhost:5000/api/users/update',
        {
          ...formData,
          skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      dispatch(loginSuccess({ user: res.data.user, token }))
      setMessage('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-8 space-y-4">

        {message && (
          <div className="bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 p-3 rounded-md text-sm text-center">
            {message}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600" />
          <div className="px-6 pb-6">
            <div className="flex justify-between items-start">
              <div className="-mt-12">
                <div className="w-24 h-24 rounded-full bg-blue-600 border-4 border-white dark:border-gray-800 flex items-center justify-center text-white text-4xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={loading}
                className="mt-4 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEditing ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <div className="mt-4 space-y-3">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className={inputClass} />
                <input name="headline" value={formData.headline} onChange={handleChange} placeholder="Headline" className={inputClass} />
                <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className={inputClass} />
              </div>
            ) : (
              <div className="mt-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.name}</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{user?.headline || 'Add a headline'}</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{user?.location || 'Add location'}</p>
                <p className="text-blue-600 text-sm mt-1">{user?.connections?.length || 0} connections</p>
              </div>
            )}
          </div>
        </div>

        {/* About */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">About</h2>
          {isEditing ? (
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Write a summary about yourself..."
              rows={4}
              className={inputClass}
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {user?.about || 'Add a summary about yourself'}
            </p>
          )}
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Skills</h2>
          {isEditing ? (
            <input
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, MongoDB (comma separated)"
              className={inputClass}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {user?.skills?.length > 0 ? (
                user.skills.map((skill) => (
                  <span key={skill} className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm">Add your skills</p>
              )}
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Experience</h2>
          {formData.experience.map((exp, index) => (
            <div key={index} className="mb-3 pb-3 border-b dark:border-gray-700 last:border-0">
              {isEditing ? (
                <div className="space-y-2">
                  <input value={exp.role} onChange={(e) => { const updated = [...formData.experience]; updated[index].role = e.target.value; setFormData({ ...formData, experience: updated }) }} placeholder="Role" className={inputClass} />
                  <input value={exp.company} onChange={(e) => { const updated = [...formData.experience]; updated[index].company = e.target.value; setFormData({ ...formData, experience: updated }) }} placeholder="Company" className={inputClass} />
                  <input value={exp.duration} onChange={(e) => { const updated = [...formData.experience]; updated[index].duration = e.target.value; setFormData({ ...formData, experience: updated }) }} placeholder="Duration" className={inputClass} />
                  <button onClick={() => { const updated = formData.experience.filter((_, i) => i !== index); setFormData({ ...formData, experience: updated }) }} className="text-red-500 text-xs hover:underline">Remove</button>
                </div>
              ) : (
                <>
                  <h3 className="font-medium text-gray-800 dark:text-white">{exp.role}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{exp.company}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">{exp.duration}</p>
                </>
              )}
            </div>
          ))}
          {isEditing && (
            <button onClick={() => setFormData({ ...formData, experience: [...formData.experience, { role: '', company: '', duration: '' }] })} className="mt-2 text-blue-600 text-sm font-medium hover:underline">+ Add Experience</button>
          )}
          {!isEditing && formData.experience.length === 0 && (
            <p className="text-gray-400 text-sm">Add your experience</p>
          )}
        </div>

        {/* Education */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Education</h2>
          {formData.education.map((edu, index) => (
            <div key={index} className="mb-3 pb-3 border-b dark:border-gray-700 last:border-0">
              {isEditing ? (
                <div className="space-y-2">
                  <input value={edu.school} onChange={(e) => { const updated = [...formData.education]; updated[index].school = e.target.value; setFormData({ ...formData, education: updated }) }} placeholder="School/University" className={inputClass} />
                  <input value={edu.degree} onChange={(e) => { const updated = [...formData.education]; updated[index].degree = e.target.value; setFormData({ ...formData, education: updated }) }} placeholder="Degree" className={inputClass} />
                  <input value={edu.year} onChange={(e) => { const updated = [...formData.education]; updated[index].year = e.target.value; setFormData({ ...formData, education: updated }) }} placeholder="Year" className={inputClass} />
                  <button onClick={() => { const updated = formData.education.filter((_, i) => i !== index); setFormData({ ...formData, education: updated }) }} className="text-red-500 text-xs hover:underline">Remove</button>
                </div>
              ) : (
                <>
                  <h3 className="font-medium text-gray-800 dark:text-white">{edu.school}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{edu.degree}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">{edu.year}</p>
                </>
              )}
            </div>
          ))}
          {isEditing && (
            <button onClick={() => setFormData({ ...formData, education: [...formData.education, { school: '', degree: '', year: '' }] })} className="mt-2 text-blue-600 text-sm font-medium hover:underline">+ Add Education</button>
          )}
          {!isEditing && formData.education.length === 0 && (
            <p className="text-gray-400 text-sm">Add your education</p>
          )}
        </div>

      </div>
    </div>
  )
}

export default Profile