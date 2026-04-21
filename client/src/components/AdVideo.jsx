import { useState, useRef, useEffect } from 'react'

function AdVideo({ onComplete }) {
  const videoRef = useRef(null)
  const [countdown, setCountdown] = useState(5)
  const [phase, setPhase] = useState('ad')

  useEffect(() => {
    // Try to play video
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video play error:', err)
      })
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Auto skip after 5 seconds
    const autoSkip = setTimeout(() => {
      handleSkip()
    }, 5000)

    return () => {
      clearInterval(timer)
      clearTimeout(autoSkip)
    }
  }, [])

  const handleSkip = () => {
    setPhase('fadeout')
    setTimeout(() => {
      onComplete()
    }, 500)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      style={{
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: 'opacity 0.5s ease'
      }}
    >
      {/* Video — correct path for Vite public folder */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        loop
        src="/ad.mp4"
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.1) 100%)' }}
      />

      {/* ProConnect watermark top left */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}
        >P</div>
        <span className="text-white font-bold text-xl tracking-wide">
          ProConnect
        </span>
      </div>

      {/* Advertisement label top right */}
      <div className="absolute top-6 right-6 z-10">
        <span className="bg-black bg-opacity-60 text-gray-300 text-xs px-3 py-1.5 rounded-full border border-gray-600">
          Advertisement
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden mb-5">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
              animation: 'adProgress 5s linear forwards'
            }}
          />
        </div>

        <div className="flex items-end justify-between">

          {/* Left — Ad text */}
          <div>
            <h2
              className="text-3xl font-black mb-1"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #ec4899, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              ProConnect
            </h2>
            <p className="text-gray-300 text-sm mb-3">
              Connect. Collaborate. Grow Professionally.
            </p>
            <div className="flex gap-4">
              {['🌐 Network', '💬 Message', '📢 Share', '🚀 Grow'].map((item, i) => (
                <span
                  key={item}
                  className="text-white text-xs"
                  style={{
                    animation: 'fadeInUp 0.5s ease forwards',
                    animationDelay: `${i * 0.2}s`,
                    opacity: 0
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Skip button (ALWAYS visible) */}
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleSkip}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: countdown > 0
                  ? 'rgba(0,0,0,0.7)'
                  : 'white',
                color: countdown > 0 ? 'white' : 'black',
                border: countdown > 0 ? '1px solid rgba(255,255,255,0.3)' : 'none'
              }}
            >
              {countdown > 0 ? (
                <>
                  {/* Circular countdown */}
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <circle
                      cx="10" cy="10" r="8"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="10" cy="10" r="8"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * 8}`}
                      strokeDashoffset={`${2 * Math.PI * 8 * (countdown / 5)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 10 10)"
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                    <text
                      x="10" y="14"
                      textAnchor="middle"
                      fill="white"
                      fontSize="8"
                      fontWeight="bold"
                    >{countdown}</text>
                  </svg>
                  Skip Ad
                </>
              ) : (
                <>
                  Skip Ad →
                </>
              )}
            </button>
            <p className="text-gray-500 text-xs">
              {countdown > 0 ? `Auto-skipping in ${countdown}s` : 'Click to skip now'}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes adProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default AdVideo