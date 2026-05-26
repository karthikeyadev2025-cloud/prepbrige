import React, { useEffect, useRef, useState, useCallback } from 'react'

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight

    // Particles
    const NUM = 120
    const particles = Array.from({ length: NUM }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.3,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.1,
      color: Math.random() > 0.5 ? '124,58,237' : '0,212,255',
    }))

    // Connection lines
    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(124,58,237,${0.12 * (1 - dist / 130)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      drawLines()
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`
        ctx.fill()
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />
  )
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = '', prefix = '', duration = 2000 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          setVal(Math.floor(ease * target))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref} style={{ display: 'inline-block' }}>
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  )
}

// ─── Floating Exam Card ───────────────────────────────────────────────────────
function FloatingCard({ exam, icon, color, delay, x, y }) {
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      background: `rgba(${color},0.12)`,
      border: `1px solid rgba(${color},0.35)`,
      borderRadius: 14, padding: '10px 16px',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', gap: 8,
      animation: `floatCard 6s ease-in-out ${delay}s infinite`,
      zIndex: 2, whiteSpace: 'nowrap',
      boxShadow: `0 0 20px rgba(${color},0.15)`,
    }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: `rgb(${color})` }}>{exam}</span>
    </div>
  )
}

// ─── Success Story Ticker ─────────────────────────────────────────────────────
const STORIES = [
  { name: 'Ramesh Kumar', rank: 'IAS Rank 23', state: 'Bihar', year: '2024' },
  { name: 'Priya Sharma', rank: 'SSC CGL AIR 4', state: 'Rajasthan', year: '2024' },
  { name: 'Ankit Yadav', rank: 'IBPS PO Selected', state: 'UP', year: '2024' },
  { name: 'Kavitha Nair', rank: 'UPSC CSE AIR 89', state: 'Kerala', year: '2023' },
  { name: 'Suresh Patel', rank: 'RRB NTPC AIR 11', state: 'Gujarat', year: '2024' },
  { name: 'Deepa Reddy', rank: 'SBI PO Cleared', state: 'Telangana', year: '2024' },
  { name: 'Arjun Singh', rank: 'BPSC Rank 7', state: 'Bihar', year: '2024' },
  { name: 'Meena Gupta', rank: 'CTET Qualified', state: 'MP', year: '2024' },
]


// ─── Hero Typewriter ──────────────────────────────────────────────────────────
const JOB_WORDS = [
  { word: 'IAS Officer',    gradient: 'linear-gradient(90deg,#7c3aed,#a855f7)', glow: 'rgba(124,58,237,0.6)' },
  { word: 'SSC CGL Job',    gradient: 'linear-gradient(90deg,#0080ff,#00d4ff)', glow: 'rgba(0,128,255,0.6)'  },
  { word: 'Bank PO',        gradient: 'linear-gradient(90deg,#059669,#10b981)', glow: 'rgba(16,185,129,0.6)' },
  { word: 'Railway Job',    gradient: 'linear-gradient(90deg,#dc2626,#f97316)', glow: 'rgba(220,38,38,0.6)'  },
  { word: 'IPS Officer',    gradient: 'linear-gradient(90deg,#7c3aed,#00d4ff)', glow: 'rgba(124,58,237,0.6)' },
  { word: 'Police Officer', gradient: 'linear-gradient(90deg,#1d4ed8,#3b82f6)', glow: 'rgba(29,78,216,0.6)'  },
  { word: 'Teacher (KVS)',  gradient: 'linear-gradient(90deg,#d97706,#f59e0b)', glow: 'rgba(217,119,6,0.6)'  },
]

function HeroTypewriter() {
  const [wordIdx, setWordIdx]   = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase]       = useState('typing') // typing | pause | deleting
  const [showUnder, setShowUnder] = useState(false)

  useEffect(() => {
    const current = JOB_WORDS[wordIdx].word
    let timeout

    if (phase === 'typing') {
      if (displayed.length < current.length) {
        timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80)
      } else {
        setShowUnder(true)
        timeout = setTimeout(() => setPhase('pause'), 1800)
      }
    } else if (phase === 'pause') {
      timeout = setTimeout(() => { setShowUnder(false); setPhase('deleting') }, 300)
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40)
      } else {
        setWordIdx(i => (i + 1) % JOB_WORDS.length)
        setPhase('typing')
      }
    }
    return () => clearTimeout(timeout)
  }, [phase, displayed, wordIdx])

  const { gradient, glow } = JOB_WORDS[wordIdx]

  return (
    <div style={{ marginBottom: 24, animation: 'heroSlideIn 0.8s ease both' }}>
      {/* Line 1: "Your Dream" */}
      <div style={{ fontSize: 'clamp(2.2rem,5.5vw,4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'white', marginBottom: 4 }}>
        Your Dream
      </div>

      {/* Line 2: Typewriter word — changes each cycle */}
      <div style={{ fontSize: 'clamp(2.2rem,5.5vw,4rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 4, minHeight: '1.15em', position: 'relative', display: 'inline-block' }}>
        <span style={{
          background: gradient,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: `drop-shadow(0 0 18px ${glow})`,
          transition: 'filter 0.4s ease',
          animation: phase === 'typing' && displayed.length === JOB_WORDS[wordIdx].word.length ? 'wordPop 0.4s ease' : 'none',
        }}>
          {displayed}
        </span>

        {/* Blinking cursor */}
        <span style={{
          display: 'inline-block', width: 3, height: '0.85em',
          background: gradient.includes('7c3aed') ? '#a855f7' : gradient.includes('0080ff') ? '#00d4ff' : gradient.includes('059669') ? '#10b981' : gradient.includes('dc2626') ? '#f97316' : '#a855f7',
          borderRadius: 2, marginLeft: 4, verticalAlign: 'middle',
          animation: 'cursorBlink 1s step-end infinite',
          boxShadow: `0 0 8px ${glow}`,
        }} />

        {/* Animated underline */}
        {showUnder && (
          <div style={{
            position: 'absolute', bottom: -4, left: 0,
            height: 3, borderRadius: 2,
            background: gradient,
            boxShadow: `0 0 10px ${glow}`,
            animation: 'underlineGrow 0.35s ease forwards',
          }} />
        )}
      </div>

      {/* Line 3: "Starts Here." + shimmer ₹599 */}
      <div style={{ fontSize: 'clamp(2.2rem,5.5vw,4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 14, flexWrap: 'wrap', animation: 'heroSlideIn 0.8s ease 0.15s both' }}>
        <span style={{ color: 'rgba(255,255,255,0.85)' }}>Starts Here.</span>
        <span style={{
          background: 'linear-gradient(90deg, #10b981 0%, #00d4ff 30%, #ffffff 50%, #00d4ff 70%, #10b981 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmer599 2.5s linear infinite, glowPulse599 2.5s ease-in-out infinite',
          fontStyle: 'normal',
        }}>₹599.</span>
      </div>
    </div>
  )
}

// ─── Main HeroVideo Component ─────────────────────────────────────────────────
export default function HeroVideo() {
  const [activeStory, setActiveStory] = useState(0)
  const videoRef = useRef(null)

  // Cycle success stories
  useEffect(() => {
    const t = setInterval(() => setActiveStory(s => (s + 1) % STORIES.length), 3000)
    return () => clearInterval(t)
  }, [])

  const FLOATING_CARDS = [
    { exam: 'IAS / IPS', icon: '🏛️', color: '124,58,237', delay: 0, x: 5, y: 18 },
    { exam: 'SSC CGL', icon: '📋', color: '0,128,255', delay: 1, x: 78, y: 12 },
    { exam: 'IBPS PO', icon: '🏦', color: '5,150,105', delay: 2, x: 82, y: 55 },
    { exam: 'RRB NTPC', icon: '🚂', color: '220,38,38', delay: 0.5, x: 3, y: 68 },
    { exam: 'NEET UG', icon: '⚕️', color: '220,38,38', delay: 1.5, x: 75, y: 80 },
    { exam: 'JEE Mains', icon: '⚙️', color: '0,128,255', delay: 2.5, x: 10, y: 82 },
    { exam: 'BPSC', icon: '🗺️', color: '8,145,178', delay: 1, x: 88, y: 32 },
    { exam: 'CTET', icon: '📖', color: '217,119,6', delay: 3, x: 15, y: 40 },
  ]

  return (
    <section style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden', background: 'linear-gradient(135deg, #08090f 0%, #0d0a1a 40%, #080d14 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Particle canvas background */}
      <ParticleCanvas />

      {/* Glowing blobs */}
      <div style={{ position: 'absolute', top: '5%', left: '15%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0, animation: 'blobPulse 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0, animation: 'blobPulse 10s ease-in-out 2s infinite' }} />
      <div style={{ position: 'absolute', top: '40%', right: '25%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0, animation: 'blobPulse 12s ease-in-out 4s infinite' }} />

      {/* Floating exam cards */}
      {FLOATING_CARDS.map((c, i) => <FloatingCard key={i} {...c} />)}

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 860, width: '100%' }}>

        {/* Live badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--r-full)', padding: '8px 18px', marginBottom: 28, fontSize: '0.82rem', fontWeight: 600, color: '#10b981' }}>
          <span style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981', animation: 'livePulse 2s ease-in-out infinite', display: 'inline-block' }} />
          2,45,832 aspirants preparing right now · Free for everyone
        </div>

        {/* Main headline — typewriter */}
        <HeroTypewriter />

        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.18rem)', color: 'rgba(148,163,184,0.9)', maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.75, animation: 'heroSlideIn 0.8s ease 0.2s both' }}>
          One login for <strong style={{ color: '#fff' }}>200+ exams</strong> — UPSC, SSC, Banking, Railways, State PSC &amp; more.
          AI tutor in <strong style={{ color: '#fff' }}>22 Indian languages</strong>. Real mock tests. Live current affairs. All for less than a chai per day.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52, animation: 'heroSlideIn 0.8s ease 0.3s both' }}>
          <a href="/auth?signup=1" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', borderRadius: 'var(--r-full)', fontWeight: 800, fontSize: '1.05rem', color: 'white', textDecoration: 'none', boxShadow: '0 0 40px rgba(124,58,237,0.5)', transition: 'transform 0.2s,box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(124,58,237,0.7)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.5)' }}
          >
            ⚡ Start Preparing Free →
          </a>
          <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 28px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--r-full)', fontWeight: 700, fontSize: '1rem', color: 'white', textDecoration: 'none', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
          >
            🎬 Watch How It Works
          </a>
        </div>

        {/* Animated stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 680, margin: '0 auto 48px', animation: 'heroSlideIn 0.8s ease 0.4s both' }}>
          {[
            { value: 500000, suffix: '+', label: 'Questions', color: '#00d4ff', prefix: '' },
            { value: 200, suffix: '+', label: 'Exams Covered', color: '#7c3aed', prefix: '' },
            { value: 599, suffix: '/yr', label: 'All Access Plan', color: '#10b981', prefix: '₹' },
            { value: 22, suffix: '', label: 'Indian Languages', color: '#f59e0b', prefix: '' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 12px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: s.color, marginBottom: 4 }}>
                <Counter target={s.value} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Success story ticker */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-full)', padding: '10px 20px', animation: 'heroSlideIn 0.8s ease 0.5s both' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: 'white', flexShrink: 0 }}>
            {STORIES[activeStory].name[0]}
          </div>
          <div style={{ textAlign: 'left', minWidth: 240 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', transition: 'all 0.4s' }}>
              🎉 {STORIES[activeStory].name} — <span style={{ color: '#10b981' }}>{STORIES[activeStory].rank}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.7)' }}>
              {STORIES[activeStory].state} · {STORIES[activeStory].year} · Prepared with PrepBridge
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {STORIES.map((_, i) => (
              <div key={i} onClick={() => setActiveStory(i)} style={{ width: i === activeStory ? 18 : 5, height: 5, borderRadius: 3, background: i === activeStory ? '#10b981' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 10, animation: 'bounce 2s ease-in-out infinite' }}>
        <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll to explore</span>
        <div style={{ width: 24, height: 38, border: '2px solid rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
          <div style={{ width: 4, height: 8, background: 'rgba(0,212,255,0.7)', borderRadius: 2, animation: 'scrollDot 2s ease-in-out infinite' }} />
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes floatCard {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-16px) rotate(1deg); }
        }
        @keyframes blobPulse {
          0%,100% { transform: scale(1) translate(0,0); opacity:1; }
          33% { transform: scale(1.15) translate(20px,-10px); opacity:0.7; }
          66% { transform: scale(0.9) translate(-10px,15px); opacity:0.9; }
        }
        @keyframes heroSlideIn {
          from { opacity:0; transform: translateY(28px); }
          to { opacity:1; transform: translateY(0); }
        }
        @keyframes livePulse {
          0%,100% { box-shadow:0 0 8px #10b981; }
          50% { box-shadow:0 0 18px #10b981, 0 0 30px rgba(16,185,129,0.4); }
        }
        @keyframes scrollDot {
          0% { transform:translateY(0); opacity:1; }
          100% { transform:translateY(14px); opacity:0; }
        }
        @keyframes bounce {
          0%,100% { transform:translateX(-50%) translateY(0); }
          50% { transform:translateX(-50%) translateY(-8px); }
        }
        @keyframes cursorBlink {
          0%,100% { opacity:1; }
          50% { opacity:0; }
        }
        @keyframes wordPop {
          0% { opacity:0; transform: translateY(12px) scale(0.95); filter: blur(4px); }
          60% { opacity:1; transform: translateY(-3px) scale(1.02); filter: blur(0); }
          100% { opacity:1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes shimmer599 {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glowPulse599 {
          0%,100% { text-shadow: 0 0 20px rgba(16,185,129,0.5); }
          50% { text-shadow: 0 0 40px rgba(16,185,129,0.9), 0 0 80px rgba(0,212,255,0.4); }
        }
        @keyframes underlineGrow {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  )
}
