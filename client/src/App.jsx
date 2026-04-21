import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Network from './pages/Network'
import Messaging from './pages/Messaging'
import Notifications from './pages/Notifications'
import UserProfile from './pages/UserProfile'
import IntroAnimation from './components/IntroAnimation'
import AdVideo from './components/AdVideo'

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  // Track which screen we're on
  // 'ad' → 'intro' → 'app'
  const [screen, setScreen] = useState(() => {
    if (sessionStorage.getItem('introSeen')) return 'app'
    return 'ad'
  })

  const handleAdComplete = () => {
    setScreen('intro')
  }

  const handleIntroComplete = () => {
    sessionStorage.setItem('introSeen', 'true')
    setScreen('app')
  }

  // Show ad video first
  if (screen === 'ad') {
    return <AdVideo onComplete={handleAdComplete} />
  }

  // Then show animation
  if (screen === 'intro') {
    return <IntroAnimation onComplete={handleIntroComplete} />
  }

  // Then show the actual app
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/network" element={isAuthenticated ? <Network /> : <Navigate to="/login" />} />
      <Route path="/messaging" element={isAuthenticated ? <Messaging /> : <Navigate to="/login" />} />
      <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} />
      <Route path="/user/:id" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App