import { useEffect, useState } from 'react'

function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState(1)
  // phase 1 = meeting scene
  // phase 2 = ProConnect name appears
  // phase 3 = string connects members
  // phase 4 = fade out → go to app

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 2500)
    const t2 = setTimeout(() => setPhase(3), 4000)
    const t3 = setTimeout(() => setPhase(4), 6000)
    const t4 = setTimeout(() => onComplete(), 7200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])

  const members = [
    { id: 1, name: 'Alex',    role: 'Designer',   x: 150, y: 180, color: '#6366f1' },
    { id: 2, name: 'Sara',    role: 'Developer',  x: 350, y: 100, color: '#ec4899' },
    { id: 3, name: 'Mike',    role: 'Marketing',  x: 550, y: 180, color: '#f59e0b' },
    { id: 4, name: 'Priya',   role: 'Manager',    x: 350, y: 310, color: '#10b981' },
    { id: 5, name: 'James',   role: 'Sales',      x: 180, y: 330, color: '#3b82f6' },
    { id: 6, name: 'Sudiksha',role: 'AI Engineer',x: 520, y: 330, color: '#8b5cf6' },
  ]

  const connections = [
    [1, 2], [2, 3], [3, 4], [4, 5], [5, 1],
    [2, 4], [1, 4], [3, 5], [2, 6], [4, 6],
    [3, 6], [1, 6]
  ]

  const getPos = (id) => members.find(m => m.id === id)

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-1000
        ${phase === 4 ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
    >
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.7 + 0.1,
              animationDuration: Math.random() * 3 + 1 + 's',
              animationDelay: Math.random() * 2 + 's'
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center">

        {/* Meeting Table + Members SVG */}
        <div className="relative w-full" style={{ maxWidth: '700px', height: '350px' }}>
  <svg width="100%" height="350" viewBox="0 0 700 450" className="absolute inset-0">

            {/* Connection strings — phase 3 */}
            {phase >= 3 && connections.map(([a, b], i) => {
              const from = getPos(a)
              const to = getPos(b)
              return (
                <line
                  key={i}
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke="url(#lineGrad)"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                  style={{
                    strokeDasharray: '300',
                    strokeDashoffset: '300',
                    animation: `drawLine 0.6s ease forwards`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              )
            })}

            {/* Gradient for lines */}
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8"/>
              </linearGradient>
            </defs>

            {/* Round meeting table */}
            <ellipse
              cx="350" cy="240"
              rx="160" ry="90"
              fill="none"
              stroke="#334155"
              strokeWidth="3"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.3))'
              }}
            />
            <ellipse
              cx="350" cy="240"
              rx="155" ry="85"
              fill="#1e293b"
              fillOpacity="0.8"
            />

            {/* Laptop on table */}
            {[280, 320, 360, 400].map((x, i) => (
              <g key={i}>
                <rect x={x-15} y={228} width="30" height="20" rx="2"
                  fill="#334155" stroke="#475569" strokeWidth="1"/>
                <rect x={x-13} y={230} width="26" height="15" rx="1"
                  fill="#0ea5e9" fillOpacity="0.6"/>
                <rect x={x-18} y={248} width="36" height="3" rx="1"
                  fill="#475569"/>
              </g>
            ))}

            {/* Presentation screen at top */}
            <rect x="280" y="60" width="140" height="80" rx="6"
              fill="#1e293b" stroke="#6366f1" strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.5))' }}
            />
            <rect x="285" y="65" width="130" height="70" rx="4"
              fill="#0f172a"/>
            {/* Screen content */}
            <text x="350" y="95" textAnchor="middle"
              fill="#6366f1" fontSize="11" fontWeight="bold"
              fontFamily="sans-serif">ProConnect</text>
            <line x1="295" y1="105" x2="405" y2="105"
              stroke="#334155" strokeWidth="1"/>
            <rect x="295" y="110" width="60" height="4" rx="2" fill="#334155"/>
            <rect x="295" y="118" width="80" height="4" rx="2" fill="#334155"/>
            <rect x="295" y="126" width="50" height="4" rx="2" fill="#334155"/>
            {/* Screen stand */}
            <line x1="350" y1="140" x2="350" y2="158"
              stroke="#334155" strokeWidth="3"/>
            <rect x="330" y="157" width="40" height="4" rx="2" fill="#334155"/>

            {/* Members */}
            {members.map((m, i) => (
              <g
                key={m.id}
                style={{
                  animation: `popIn 0.5s ease forwards`,
                  animationDelay: `${i * 0.15}s`,
                  opacity: 0
                }}
              >
                {/* Glow ring — phase 3 */}
                {phase >= 3 && (
                  <circle
                    cx={m.x} cy={m.y} r="32"
                    fill="none"
                    stroke={m.color}
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    style={{
                      animation: 'pulse 2s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                )}

                {/* Avatar circle */}
                <circle
                  cx={m.x} cy={m.y} r="26"
                  fill={m.color}
                  fillOpacity="0.9"
                  style={{ filter: `drop-shadow(0 0 8px ${m.color}80)` }}
                />

                {/* Shirt/body */}
                <ellipse cx={m.x} cy={m.y + 48} rx="18" ry="12"
                  fill={m.color} fillOpacity="0.6"/>

                {/* Face */}
                <circle cx={m.x} cy={m.y - 4} r="14"
                  fill="#fde68a"/>
                {/* Eyes */}
                <circle cx={m.x - 5} cy={m.y - 6} r="2" fill="#1e293b"/>
                <circle cx={m.x + 5} cy={m.y - 6} r="2" fill="#1e293b"/>
                {/* Smile */}
                <path
                  d={`M ${m.x - 5} ${m.y + 1} Q ${m.x} ${m.y + 6} ${m.x + 5} ${m.y + 1}`}
                  fill="none" stroke="#92400e" strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Hair */}
                <ellipse cx={m.x} cy={m.y - 14} rx="14" ry="6"
                  fill={i % 2 === 0 ? '#92400e' : '#1e293b'}/>

                {/* Name tag */}
                <rect
                  x={m.x - 28} y={m.y + 32}
                  width="56" height="18" rx="9"
                  fill="#0f172a"
                  fillOpacity="0.9"
                  stroke={m.color}
                  strokeWidth="1"
                />
                <text
                  x={m.x} y={m.y + 45}
                  textAnchor="middle"
                  fill="white"
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  {m.name}
                </text>

                {/* Speech bubble for manager */}
                {m.role === 'Manager' && phase === 1 && (
                  <g>
                    <rect x={m.x + 28} y={m.y - 50} width="90" height="28"
                      rx="8" fill="#6366f1" fillOpacity="0.9"/>
                    <polygon
                      points={`${m.x + 28},${m.y - 28} ${m.x + 20},${m.y - 18} ${m.x + 38},${m.y - 28}`}
                      fill="#6366f1" fillOpacity="0.9"
                    />
                    <text x={m.x + 73} y={m.y - 32}
                      textAnchor="middle" fill="white"
                      fontSize="9" fontFamily="sans-serif">
                      Let&apos;s connect!
                    </text>
                    <text x={m.x + 73} y={m.y - 20}
                      textAnchor="middle" fill="white"
                      fontSize="9" fontFamily="sans-serif">
                      🌐 ProConnect
                    </text>
                  </g>
                )}
              </g>
            ))}

            {/* Floating dots animation */}
            {phase >= 3 && [...Array(8)].map((_, i) => (
              <circle
                key={i}
                r="3"
                fill={members[i % members.length].color}
                fillOpacity="0.7"
                style={{
                  animation: `float${i % 3} ${2 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              >
                <animateMotion
                  dur={`${2 + i * 0.4}s`}
                  repeatCount="indefinite"
                  path={`M ${members[i % 6].x} ${members[i % 6].y}
                         L ${members[(i + 1) % 6].x} ${members[(i + 1) % 6].y}`}
                />
              </circle>
            ))}
          </svg>
        </div>

        {/* ProConnect Title — phase 2+ */}
        <div
          className={`text-center transition-all duration-700 -mt-8
            ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h1
            className="text-6xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #ec4899, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.5))'
            }}
          >
            ProConnect
          </h1>
          <p
            className={`text-gray-400 text-lg mt-2 transition-all duration-700 delay-300
              ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}
          >
            Connecting Professionals Worldwide
          </p>

          {/* Connecting tagline — phase 3 */}
          <div
            className={`flex items-center justify-center gap-2 mt-3 transition-all duration-700
              ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-indigo-500"/>
            <span className="text-indigo-400 text-sm font-medium">
              ✨ Building your network
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-indigo-500"/>
          </div>
        </div>

        {/* Loading bar */}
        <div
          className={`mt-6 w-64 h-1 bg-gray-800 rounded-full overflow-hidden transition-opacity duration-500
            ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
              animation: 'loadBar 4.5s ease forwards',
              width: '0%'
            }}
          />
        </div>

        {/* Skip button */}
        <button
          onClick={onComplete}
          className="mt-4 text-gray-600 hover:text-gray-400 text-xs transition-colors"
        >
          Skip intro →
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.5); }
          70%  { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes loadBar {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes pulse {
          0%, 100% { r: 32; opacity: 0.4; }
          50%       { r: 38; opacity: 0.1; }
        }
      `}</style>
    </div>
  )
}

export default IntroAnimation