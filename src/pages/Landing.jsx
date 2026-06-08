import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/useStore'
import { useTranslation } from 'react-i18next'
import { Zap, CheckCircle, ArrowRight, BookOpen, ShieldAlert, Award, Sparkles, MessageSquare, ChevronDown, Check, X, AlertCircle } from 'lucide-react'
import HeroVideo from '../components/HeroVideo'
import StorySection from '../components/StorySection'
import { EXAM_CATEGORIES, ALL_LANGUAGES } from '../data/exams'
import { openInBrowser } from '../services/nativeService'

/* ── App download badge SVGs ── */
function PlayStoreBadge() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.18 23.5a2 2 0 01-1.08-1.77V2.27A2 2 0 013.18.5l.14.08 11.65 11.65v.14L3.32 23.42l-.14.08z" fill="url(#gp1)"/>
      <path d="M18.82 16.27L14.97 12.5v-.14l3.85-3.77.09.05 4.56 2.59c1.3.74 1.3 1.95 0 2.69l-4.56 2.59-.09-.24z" fill="url(#gp2)"/>
      <path d="M18.91 16.03L14.97 12.1 3.18 23.5c.43.45 1.13.5 1.9.05l13.83-7.52" fill="url(#gp3)"/>
      <path d="M18.91 8.23L5.08.71C4.31.26 3.61.31 3.18.76l11.79 11.34 3.94-3.87z" fill="url(#gp4)"/>
      <defs>
        <linearGradient id="gp1" x1="13.18" y1="12.5" x2="1.09" y2="12.5" gradientUnits="userSpaceOnUse"><stop stopColor="#00A0FF"/><stop offset="1" stopColor="#00A0FF" stopOpacity="0"/></linearGradient>
        <linearGradient id="gp2" x1="23.82" y1="12.18" x2="13.66" y2="12.18" gradientUnits="userSpaceOnUse"><stop stopColor="#FFD000"/><stop offset="1" stopColor="#FFBC00"/></linearGradient>
        <linearGradient id="gp3" x1="15.82" y1="14.3" x2="2.09" y2="27.82" gradientUnits="userSpaceOnUse"><stop stopColor="#FF3A44"/><stop offset="1" stopColor="#C31162"/></linearGradient>
        <linearGradient id="gp4" x1="1.55" y1="-1.2" x2="11.63" y2="8.66" gradientUnits="userSpaceOnUse"><stop stopColor="#32A071"/><stop offset="1" stopColor="#2DA771"/></linearGradient>
      </defs>
    </svg>
  )
}

function AppStoreBadge() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

function AppDownloadSection() {
  const [cfg] = useState(() => {
    try {
      const s = localStorage.getItem('prepbridge_admin_settings')
      if (s) return JSON.parse(s)
    } catch { /* ignore */ }
    return {}
  })
  const [ref, visible] = useScrollReveal()

  const enabled = cfg.appStoreEnabled !== false
  const showPlay = cfg.showPlayStore !== false
  const showApple = cfg.showAppStore !== false
  const playUrl = cfg.playStoreUrl || 'https://play.google.com/store/apps/details?id=in.prepbridge.app'
  const appleUrl = cfg.appStoreUrl || 'https://apps.apple.com/app/prepbridge/id0000000000'
  const headline = cfg.appStoreHeadline || 'Take Your Prep Everywhere'
  const subtext = cfg.appStoreSubtext || 'Native app for Android & iOS. Works offline. Push alerts for every exam. No laptop needed.'

  if (!enabled) return null

  return (
    <section ref={ref} style={{
      padding: 'clamp(40px,7vw,90px) clamp(16px,4vw,24px)',
      background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(0,212,255,0.06) 50%, rgba(16,185,129,0.08) 100%)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,212,255,0.12), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateX(-30px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-full)', padding: '5px 14px', fontSize: '0.78rem', fontWeight: 700, color: '#10b981', marginBottom: 18, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              📱 Available Now
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, marginBottom: 14, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {headline}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
              {subtext}
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {showPlay && (
                <button
                  onClick={() => openInBrowser(playUrl)}
                  aria-label="Get PrepBridge on Google Play"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#000', border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <PlayStoreBadge />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>GET IT ON</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Google Play</div>
                  </div>
                </button>
              )}

              {showApple && (
                <button
                  onClick={() => openInBrowser(appleUrl)}
                  aria-label="Download PrepBridge on the App Store"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#000', border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <AppStoreBadge />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>DOWNLOAD ON THE</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>App Store</div>
                  </div>
                </button>
              )}
            </div>

            <div style={{ marginTop: 20, fontSize: '0.78rem', color: 'var(--text-4)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <span>⭐ 4.9 rating</span>
              <span>📥 1L+ downloads</span>
              <span>🆓 Free to start</span>
            </div>
          </div>

          <div style={{ flexShrink: 0, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateX(30px)', transition: 'opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s' }}>
            <div style={{ position: 'relative', width: 200 }}>
              <div style={{
                width: 200, height: 400,
                background: 'linear-gradient(180deg, #111827 0%, #0d1020 100%)',
                borderRadius: 36,
                border: '2.5px solid rgba(255,255,255,0.12)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 80, height: 24, background: '#0a0f1e', borderRadius: '0 0 16px 16px', zIndex: 10 }} />
                <div style={{ padding: '32px 14px 14px', height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                    <span>9:41</span><span>●●●●</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={12} color="white" />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'white' }}>PrepBridge</span>
                  </div>
                  {[
                    { label: 'Daily Quiz', sub: '+10 pts', color: '#7c3aed' },
                    { label: 'AI Tutor', sub: 'Ask K²', color: '#00d4ff' },
                    { label: 'Mock Test', sub: 'Active session', color: '#10b981' },
                  ].map((c, i) => (
                    <div key={i} style={{ background: `${c.color}18`, border: `1px solid ${c.color}33`, borderRadius: 10, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'white' }}>{c.label}</span>
                      <span style={{ fontSize: '0.6rem', color: c.color, fontWeight: 600 }}>{c.sub}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 4, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🔥</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f59e0b' }}>15 day streak</span>
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, background: 'rgba(13,16,32,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
                  {['🏠','📖','⚡','🏆','👤'].map((icon, i) => (
                    <div key={i} style={{ fontSize: i === 0 ? '1rem' : '0.82rem', opacity: i === 0 ? 1 : 0.4 }}>{icon}</div>
                  ))}
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', width: 160, height: 40, background: 'rgba(124,58,237,0.3)', filter: 'blur(20px)', borderRadius: '50%', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   STATIC DATA
   ───────────────────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '🤖', title: '24/7 Language AI Tutor', desc: 'Real-time AI explains any complex syllabus topic in 22 regional Indian languages instantly.', color: '#00d4ff' },
  { icon: '📊', title: '₹149 PeakPredict AI', desc: 'Unlocks advanced historical weightage analysis, predicting future paper structures with high probability.', color: '#7c3aed' },
  { icon: '🔒', title: 'Secured Solve Engine', desc: 'Protected online-only environments for official PYQs. Fully simulated exam rules with downloads disabled.', color: '#10b981' },
  { icon: '📱', title: 'Zero-Lag Offline Mode', desc: 'Installable PWA that works on slow 2G networks. Practice on the go on any basic device.', color: '#f59e0b' },
  { icon: '🔔', title: 'Vacancies & Admit alerts', desc: 'Instant push alerts matching your tracks the moment central or state boards announce updates.', color: '#f43f5e' },
  { icon: '💡', title: 'Auto rank analytics', desc: 'Compare accuracy scores on national percentiles and pinpoint precise logical focus shifts.', color: '#0080ff' },
]

const EXAMS_MARQUEE = [
  'IAS/IPS','SSC CGL','IBPS PO','SBI Clerk','RRB NTPC','CTET',
  'BPSC','UPPSC','TNPSC','MPSC','NDA','GATE','NEET','JEE',
  'CLAT','AILET','AP LAWCET','TS LAWCET','CBSE Class 12'
]

const TESTIMONIALS = [
  { name: 'Ramesh Kumar', state: 'Bihar', exam: 'IAS Rank 23 — UPSC 2024', text: 'PrepBridge made full-length UPSC syllabi accessible in native Hindi. K² explanations helped me resolve core doubts without expensive coaching fees.', avatar: 'R', color: '#7c3aed' },
  { name: 'Priya Nair', state: 'Kerala', exam: 'SSC CGL AIR 4 — 2024', text: 'The PeakPredict syllabus highlights were outstanding. Highly accurate topic predictions allowed me to distribute my study cycles extremely efficiently.', avatar: 'P', color: '#00d4ff' },
  { name: 'Suresh Patel', state: 'Gujarat', exam: 'RRB NTPC AIR 11 — 2024', text: 'I completed my mocks in Gujarati. The native translation engine feels absolute. Live timed sections prepared me perfectly.', avatar: 'S', color: '#10b981' },
]

/* ─────────────────────────────────────────────────────────────────────────────
   SCROLL & EFFECTS HOOKS
   ───────────────────────────────────────────────────────────────────────────── */
function useScrollReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const h = () => {
      const el = document.documentElement
      setProgress((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
    }
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  return progress
}

function RevealDiv({ children, style = {}, delay = 0, direction = 'up' }) {
  const [ref, visible] = useScrollReveal()
  const from = { up: 'translateY(30px)', left: 'translateX(-30px)', right: 'translateX(30px)', scale: 'scale(0.92)' }[direction] || 'translateY(30px)'
  return (
    <div ref={ref} style={{ transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`, opacity: visible ? 1 : 0, transform: visible ? 'none' : from, ...style }}>
      {children}
    </div>
  )
}

function TiltCard({ children, style = {} }) {
  const ref = useRef(null)
  const handleMove = (e) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 10
    const y = ((e.clientY - r.top) / r.height - 0.5) * -10
    el.style.transform = `perspective(500px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`
    el.style.borderColor = 'rgba(255,255,255,0.18)'
  }
  const handleLeave = () => {
    const el = ref.current; if (!el) return
    el.style.transform = 'perspective(500px) rotateY(0deg) rotateX(0deg) translateY(0px)'
    el.style.borderColor = 'rgba(255,255,255,0.07)'
  }
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.2s ease, border-color 0.2s ease', willChange: 'transform', ...style }}>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   EXAM CATEGORIES SHOWCASE Component
   ───────────────────────────────────────────────────────────────────────────── */
function ExamCategoriesShowcase() {
  const [activeTrack, setActiveTrack] = useState('govt') // 'govt' | 'entrance'
  const [expandedCat, setExpandedCat] = useState('upsc')

  const govtCats = EXAM_CATEGORIES.filter(cat => cat.type === 'govt' || !cat.type)
  const entranceCats = EXAM_CATEGORIES.filter(cat => cat.type === 'entrance')

  const activeCats = activeTrack === 'govt' ? govtCats : entranceCats

  return (
    <section id="categories" style={{ padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,24px)', maxWidth: 1100, margin: '0 auto' }}>
      <RevealDiv style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--purple)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Exam Catalog
        </div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 12 }}>
          Supported Tracks &amp; <span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Categories</span>
        </h2>
        <p style={{ color: 'var(--text-3)', maxWidth: 580, margin: '0 auto 32px', fontSize: '0.92rem' }}>
          Explore the exact competitive exams we cover. Instantly launch AI-generated mocks mapped to the latest trends.
        </p>

        {/* Track switch buttons */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: 4, gap: 4 }}>
          <button
            onClick={() => { setActiveTrack('govt'); setExpandedCat(govtCats[0]?.id || '') }}
            style={{
              padding: '10px 24px', borderRadius: 999, border: 'none', background: activeTrack === 'govt' ? 'linear-gradient(135deg,#7c3aed,#00d4ff)' : 'transparent',
              color: activeTrack === 'govt' ? 'white' : 'var(--text-3)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.25s',
              minHeight: 44
            }}
          >
            💼 Government Job Exams
          </button>
          <button
            onClick={() => { setActiveTrack('entrance'); setExpandedCat(entranceCats[0]?.id || '') }}
            style={{
              padding: '10px 24px', borderRadius: 999, border: 'none', background: activeTrack === 'entrance' ? 'linear-gradient(135deg,#7c3aed,#00d4ff)' : 'transparent',
              color: activeTrack === 'entrance' ? 'white' : 'var(--text-3)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.25s',
              minHeight: 44
            }}
          >
            🎓 College Entrance &amp; Boards
          </button>
        </div>
      </RevealDiv>

      {/* Grid structure: Left side categories cards, Right side dynamic active exam details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'start' }}>
        
        {/* Category Selector Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeCats.map((cat) => {
            const isSelected = expandedCat === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setExpandedCat(cat.id)}
                style={{
                  textAlign: 'left',
                  padding: '16px 20px',
                  background: isSelected ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)',
                  border: isSelected ? `1.5px solid ${cat.color || '#7c3aed'}` : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  minHeight: 64
                }}
                onMouseEnter={e => { if(!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { if(!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                  <div>
                    <span style={{ display: 'block', color: 'white', fontWeight: 700, fontSize: '0.92rem' }}>{cat.label}</span>
                    <span style={{ display: 'block', color: 'var(--text-4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>
                      {cat.exams.length} active exams · {cat.id === 'state_psc' || cat.id === 'police' ? 'State Specific' : 'National'}
                    </span>
                  </div>
                </div>
                <ChevronDown size={18} style={{ transform: isSelected ? 'rotate(-90deg)' : 'none', color: isSelected ? cat.color : 'var(--text-4)', transition: 'transform 0.2s' }} />
              </button>
            )
          })}
        </div>

        {/* Selected Category Expanded Info panel */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 24,
          padding: '24px clamp(16px,4vw,28px)',
          backdropFilter: 'blur(10px)',
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {(() => {
            const cat = EXAM_CATEGORIES.find(c => c.id === expandedCat)
            if (!cat) return <div style={{ color: 'var(--text-4)', margin: 'auto' }}>Select an exam category to explore</div>

            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>{cat.label}</h3>
                    <div style={{ display: 'inline-block', background: `${cat.color}22`, border: `1px solid ${cat.color}44`, borderRadius: 6, padding: '3px 8px', fontSize: '0.68rem', fontWeight: 700, color: cat.color, marginTop: 4, textTransform: 'uppercase' }}>
                      {cat.id.toUpperCase()} syllabus active
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Supported Exams &amp; Details</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto', paddingRight: 6 }}>
                    {cat.exams.map((exam) => (
                      <div
                        key={exam.id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: 12,
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12
                        }}
                      >
                        <div>
                          <span style={{ display: 'block', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{exam.name}</span>
                          <span style={{ display: 'block', color: 'var(--text-3)', fontSize: '0.72rem', marginTop: 1 }}>{exam.fullName}</span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', color: '#10b981', fontWeight: 700, fontSize: '0.78rem' }}>{exam.vacancies?.toLocaleString() || 'N/A'} Seats</span>
                          <span style={{ display: 'block', color: 'var(--text-4)', fontSize: '0.64rem', marginTop: 1 }}>Next: {exam.nextDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to="/auth?signup=1"
                  style={{
                    background: 'linear-gradient(135deg,#7c3aed,#00d4ff)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                    padding: '12px 20px',
                    borderRadius: 12,
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
                >
                  Start {cat.label} Practice Mocks <ArrowRight size={16} />
                </Link>
              </>
            )
          })()}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   INTERACTIVE TRY-BEFORE-SIGNUP DEMO Component
   ───────────────────────────────────────────────────────────────────────────── */
function InteractiveMockDemo() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [checked, setChecked] = useState(false)
  const [scores, setScores] = useState(0)
  const [finished, setFinished] = useState(false)

  const questions = [
    {
      q: 'Under which Article of the Indian Constitution is the right to life and personal liberty protected?',
      options: ['Article 14 (Equality)', 'Article 19 (Speech)', 'Article 21 (Life)', 'Article 32 (Constitutional Remedies)'],
      correct: 2,
      explanation: 'Article 21 declares that no person shall be deprived of his life or personal liberty except according to procedure established by law. This fundamental right cannot be suspended even during a National Emergency.'
    },
    {
      q: 'Which of the following sections exhibits the highest predictive weightage (84% frequency rate) in central general aptitude tests?',
      options: ['Analogy & Classification', 'Constitutional Amendments', 'Compound Interest Shortcuts', 'National Park Geo-mapping'],
      correct: 1,
      explanation: 'PrepPredict AI telemetry identifies Constitutional Amendments as high-frequency scoring topics. Reviewing articles like 368, 42nd/44th amendments boosts expected points by 12%.'
    },
    {
      q: 'What is the primary role of the Supreme Court under its writ jurisdiction defined in Article 32?',
      options: ['Advising the Cabinet', 'Enforcement of Fundamental Rights', 'Water dispute arbitration', 'Reviewing state legislative powers'],
      correct: 1,
      explanation: 'Article 32 provides the right to approach the Supreme Court directly for the enforcement of Fundamental Rights. Dr. B.R. Ambedkar termed it the "heart and soul" of the Constitution.'
    }
  ]

  const activeQuestion = questions[currentIdx]

  const handleSelect = (idx) => {
    if (checked) return
    setSelectedOpt(idx)
  }

  const handleCheck = () => {
    if (selectedOpt === null) return
    setChecked(true)
    if (selectedOpt === activeQuestion.correct) {
      setScores(prev => prev + 1)
    }
  }

  const handleNext = () => {
    setSelectedOpt(null)
    setChecked(false)
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
    } else {
      setFinished(true)
    }
  }

  const handleReset = () => {
    setCurrentIdx(0)
    setSelectedOpt(null)
    setChecked(false)
    setScores(0)
    setFinished(false)
  }

  return (
    <section id="demo" style={{ padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,24px)', background: 'linear-gradient(180deg, var(--bg) 0%, rgba(12,10,24,0.7) 100%)' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <RevealDiv style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-full)', padding: '6px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: 14, textTransform: 'uppercase' }}>
            ⚡ Interactive Demo
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 900, marginBottom: 10 }}>
            Try a <span style={{ background: 'linear-gradient(90deg,#00d4ff,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Live Mock Test</span>
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: '0.92rem' }}>
            No signup required. Test our interactive interface and read real-time K² AI explanations.
          </p>
        </RevealDiv>

        <RevealDiv direction="scale">
          <div style={{
            background: 'rgba(13,10,24,0.85)',
            border: '2px solid rgba(255,255,255,0.06)',
            borderRadius: 24,
            padding: 'clamp(20px, 4vw, 36px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            {!finished ? (
              <div>
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14, marginBottom: 20 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-4)', fontWeight: 700 }}>
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(124,58,237,0.15)', color: '#a855f7', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                    <Sparkles size={12} /> Simulated Negative Marking: -0.25
                  </span>
                </div>

                {/* Question */}
                <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.2rem)', fontWeight: 800, color: 'white', lineHeight: 1.5, marginBottom: 24 }}>
                  {activeQuestion.q}
                </p>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {activeQuestion.options.map((opt, i) => {
                    const isSelected = selectedOpt === i
                    let borderCol = 'rgba(255,255,255,0.07)'
                    let bgCol = 'rgba(255,255,255,0.015)'

                    if (isSelected) {
                      borderCol = '#7c3aed'
                      bgCol = 'rgba(124,58,237,0.08)'
                    }

                    if (checked) {
                      if (i === activeQuestion.correct) {
                        borderCol = '#10b981'
                        bgCol = 'rgba(16,185,129,0.1)'
                      } else if (isSelected) {
                        borderCol = '#f43f5e'
                        bgCol = 'rgba(244,63,94,0.1)'
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        disabled={checked}
                        style={{
                          textAlign: 'left',
                          padding: '14px 18px',
                          borderRadius: 12,
                          background: bgCol,
                          border: `1.5px solid ${borderCol}`,
                          color: isSelected || (checked && i === activeQuestion.correct) ? 'white' : 'var(--text-2)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.92rem',
                          cursor: checked ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                          minHeight: 48, // Touch target height compliance
                        }}
                      >
                        <span>{opt}</span>
                        {checked && i === activeQuestion.correct && <Check size={18} color="#10b981" />}
                        {checked && isSelected && i !== activeQuestion.correct && <X size={18} color="#f43f5e" />}
                      </button>
                    )
                  })}
                </div>

                {/* Actions row */}
                <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {!checked ? (
                    <button
                      onClick={handleCheck}
                      disabled={selectedOpt === null}
                      style={{
                        padding: '12px 28px',
                        borderRadius: 12,
                        border: 'none',
                        background: selectedOpt === null ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#7c3aed,#00d4ff)',
                        color: selectedOpt === null ? 'var(--text-4)' : 'white',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        cursor: selectedOpt === null ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        minHeight: 44
                      }}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      style={{
                        padding: '12px 28px',
                        borderRadius: 12,
                        border: 'none',
                        background: 'linear-gradient(135deg,#10b981,#00d4ff)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        minHeight: 44
                      }}
                    >
                      {currentIdx === questions.length - 1 ? 'Finish Test' : 'Next Question →'}
                    </button>
                  )}
                </div>

                {/* K2 AI Explanation */}
                {checked && (
                  <div style={{
                    marginTop: 24,
                    background: 'rgba(124,58,237,0.05)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    borderLeft: '4px solid #7c3aed',
                    borderRadius: '4px 12px 12px 4px',
                    padding: '16px 20px',
                    animation: 'slideIn 0.3s ease forwards'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a855f7', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: 6 }}>
                      <Sparkles size={14} /> K² AI Explainer
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                      {activeQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏆</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: 8 }}>Mini Mock Test Completed!</h3>
                <p style={{ color: 'var(--text-3)', fontSize: '0.95rem', marginBottom: 24 }}>
                  You scored <strong style={{ color: '#10b981' }}>{scores} out of {questions.length}</strong> correct options.
                </p>

                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleReset}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'transparent',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      minHeight: 44
                    }}
                  >
                    🔄 Retake Demo Mocks
                  </button>
                  <Link
                    to="/auth?signup=1"
                    style={{
                      padding: '12px 28px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg,#7c3aed,#00d4ff)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      minHeight: 44
                    }}
                  >
                    ⚡ Access 5 Lakh+ Mocks &amp; AI Tutor Now
                  </Link>
                </div>
              </div>
            )}
          </div>
        </RevealDiv>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   PEAKPREDICT & SECURE SOLVED PAPERS SPOTLIGHT Component
   ───────────────────────────────────────────────────────────────────────────── */
function AddonSpotlight() {
  return (
    <section id="addons" style={{ padding: 'clamp(48px,8vw,100px) clamp(16px,4vw,24px)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        {/* Spotlight 1: PeakPredict */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center', marginBottom: 80 }}>
          
          {/* Left: visuals */}
          <div style={{ flex: 1, minWidth: 300, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(124,58,237,0.25)',
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span style={{ fontSize: '0.72rem', background: '#7c3aed', color: 'white', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>
                  K² PEAKPREDICT ACTIVE
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'white' }}>₹149 Unlock Addon</span>
              </div>
              
              {/* Syllabus weightage bar chart mock */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { topic: 'Constitutional Amendments', freq: '84%', color: '#7c3aed', width: '84%' },
                  { topic: 'Fundamental Rights & Writs', freq: '79%', color: '#00d4ff', width: '79%' },
                  { topic: 'Federalism & Interstate laws', freq: '38%', color: 'var(--text-4)', width: '38%' },
                  { topic: 'Judiciary appointments', freq: '22%', color: 'var(--text-4)', width: '22%' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                      <span style={{ color: 'white', fontWeight: 600 }}>{item.topic}</span>
                      <span style={{ color: item.color, fontWeight: 700 }}>{item.freq} Weightage</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: item.width, height: '100%', background: item.color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 20, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: 12 }}>
                <AlertCircle size={16} color="#a855f7" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-2)', lineHeight: 1.4 }}>
                  <strong>Important Note:</strong> We strictly respect exam integrity and do not leak actual papers. PrepPredict leverages historical frequency statistics to isolate high-probability syllabus areas.
                </p>
              </div>
            </div>
          </div>

          {/* Right: text info */}
          <div style={{ flex: 1.2, minWidth: 300 }}>
            <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 'var(--r-full)', padding: '5px 14px', fontSize: '0.78rem', fontWeight: 700, color: '#a855f7', marginBottom: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              📊 AI Syllabus Telemetry
            </div>
            <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 900, marginBottom: 14, color: 'white', lineHeight: 1.2 }}>
              K² PeakPredict Addon
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 20 }}>
              Examine historical exam trends, isolate recurring subject topics, and practice with high-probability questions.
            </p>
            <ul style={{ paddingLeft: 18, color: 'var(--text-2)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 8, margin: '0 0 28px' }}>
              <li><strong>Probability Filtering:</strong> Generates papers emphasizing key core weightages.</li>
              <li><strong>Affordable Addon Pricing:</strong> Unlock for your exam track at just <strong>₹149</strong>.</li>
              <li><strong>Safe Guess Papers:</strong> Refines your revision schedule during the final weeks leading to exam dates.</li>
            </ul>

            <Link
              to="/auth?signup=1"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: '12px 24px',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            >
              Add to Practice Mocks →
            </Link>
          </div>
        </div>

        {/* Spotlight 2: Secured Solved Papers */}
        <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: 48, alignItems: 'center' }}>
          
          {/* Left: text info */}
          <div style={{ flex: 1.2, minWidth: 300 }}>
            <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-full)', padding: '5px 14px', fontSize: '0.78rem', fontWeight: 700, color: '#10b981', marginBottom: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              🔒 Secured online environment
            </div>
            <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 900, marginBottom: 14, color: 'white', lineHeight: 1.2 }}>
              Strictly Online PYQs
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 20 }}>
              To ensure mock exam conditions and safeguard premium study material, past papers must be completed directly inside our platform.
            </p>
            <ul style={{ paddingLeft: 18, color: 'var(--text-2)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 8, margin: '0 0 28px' }}>
              <li><strong>Downloads Disabled:</strong> Question papers cannot be downloaded as PDFs.</li>
              <li><strong>Online Runner:</strong> Full compliance with negative marking and actual section timers.</li>
              <li><strong>Detailed Solutions:</strong> Complete access to K² step-by-step AI answers inside your dashboard.</li>
            </ul>

            <Link
              to="/auth?signup=1"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: '12px 24px',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            >
              Start Solved PYQs Mocks →
            </Link>
          </div>

          {/* Right: visuals */}
          <div style={{ flex: 1, minWidth: 300, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              position: 'relative'
            }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>Mock Session Runner</span>
                <span style={{ fontSize: '0.68rem', color: '#f43f5e', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  ⬇️ PDF DOWNLOAD DISABLED
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '10px 14px' }}>
                  <BookOpen size={16} color="#10b981" />
                  <span style={{ fontSize: '0.82rem', color: 'white', fontWeight: 600 }}>Secured Exam Runner Mode Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '10px 14px' }}>
                  <ShieldAlert size={16} color="#f59e0b" />
                  <span style={{ fontSize: '0.82rem', color: 'white', fontWeight: 600 }}>Secure Browser Anti-Cheat Monitoring</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '10px 14px' }}>
                  <Award size={16} color="#00d4ff" />
                  <span style={{ fontSize: '0.82rem', color: 'white', fontWeight: 600 }}>Graded Certificate with All India Rank</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN LANDING COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */
export default function Landing() {
  const { user, onboardingComplete } = useUserStore()
  const navigate = useNavigate()
  const scrollProgress = useScrollProgress()
  const { i18n, t } = useTranslation()
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const activeLangObj = ALL_LANGUAGES.find(l => l.code === i18n.language) || ALL_LANGUAGES[0]

  useEffect(() => {
    if (user && onboardingComplete) navigate('/app/dashboard')
    else if (user) navigate('/onboarding')
  }, [user, onboardingComplete, navigate])

  const changeLanguage = (code) => {
    i18n.changeLanguage(code)
    setLangMenuOpen(false)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Scroll Progress Bar ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: 3, width: `${scrollProgress}%`, background: 'linear-gradient(90deg,#7c3aed,#00d4ff,#10b981)', zIndex: 9999, transition: 'width 0.1s', boxShadow: '0 0 10px rgba(124,58,237,0.8)' }} />

      {/* ── Navbar ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,9,15,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(124,58,237,0.5)', animation: 'logoPulse 3s ease-in-out infinite', flexShrink: 0 }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            Prep<span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bridge</span>
          </span>
        </div>

        {/* Nav actions & Language Selector */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          
          {/* Elegant Language switcher dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangMenuOpen(prev => !prev)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--r-full)',
                padding: '7px 12px',
                fontSize: '0.8rem',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                minHeight: 36,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              <span>{activeLangObj.flag} {activeLangObj.native}</span>
              <ChevronDown size={12} style={{ transform: langMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {langMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                background: '#0d0d14',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14,
                width: 170,
                maxHeight: 280,
                overflowY: 'auto',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                zIndex: 210,
                padding: 6
              }}>
                {ALL_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: i18n.language === l.code ? 'rgba(124,58,237,0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      color: i18n.language === l.code ? 'white' : 'var(--text-3)',
                      fontWeight: i18n.language === l.code ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      minHeight: 34
                    }}
                  >
                    <span>{l.flag}</span>
                    <span style={{ flex: 1 }}>{l.native}</span>
                    {i18n.language === l.code && <Check size={12} color="#a855f7" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/auth" style={{ color: 'var(--text-2)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', transition: 'all 0.2s', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', minHeight: 36 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}>Login</Link>
          <Link to="/auth?signup=1" style={{ background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', padding: '8px 16px', borderRadius: 'var(--r-full)', boxShadow: '0 0 16px rgba(124,58,237,0.4)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 36 }}>
            Start Free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ paddingTop: 56, position: 'relative' }}>
        <HeroVideo />
      </div>

      {/* ── Marquee ticker — DUAL DIRECTION ── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '12px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 18, animation: 'marquee 22s linear infinite', whiteSpace: 'nowrap', marginBottom: 8 }}>
          {[...EXAMS_MARQUEE, ...EXAMS_MARQUEE].map((e, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-3)', padding: '5px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--r-full)', flexShrink: 0 }}>
              <CheckCircle size={11} color="var(--cyan)" /> {e}
            </span>
          ))}
        </div>
      </div>

      {/* ── STORY SECTION ── */}
      <StorySection />

      {/* ── EXAM CATEGORIES SHOWCASE ── */}
      <ExamCategoriesShowcase />

      {/* ── INTERACTIVE MOCK DEMO ── */}
      <InteractiveMockDemo />

      {/* ── ADDON SPOTLIGHT (PeakPredict & PYQ) ── */}
      <AddonSpotlight />

      {/* ── FEATURES GRID ── */}
      <section id="features" style={{ padding: 'clamp(48px,8vw,100px) clamp(16px,4vw,24px)', maxWidth: 1100, margin: '0 auto' }}>
        <RevealDiv style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--purple)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Features</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 8 }}>Everything to <span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>crack any exam</span></h2>
        </RevealDiv>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <RevealDiv key={i} delay={i * 0.08} direction={i % 2 === 0 ? 'left' : 'right'}>
              <TiltCard style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, height: '100%', cursor: 'default', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: `radial-gradient(circle,${f.color}22,transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ fontSize: '2rem', marginBottom: 16, display: 'inline-block' }}>{f.icon}</div>
                <div style={{ width: 36, height: 3, borderRadius: 2, background: f.color, marginBottom: 14 }} />
                <h3 style={{ marginBottom: 10, fontSize: '1rem', color: 'white', fontWeight: 800 }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </TiltCard>
            </RevealDiv>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,24px)', background: 'var(--bg-2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: 500, height: 500, background: 'var(--cyan)', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.05 }} />
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealDiv style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Success Stories</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900 }}>Real students. <span style={{ background: 'linear-gradient(90deg,#f59e0b,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real results.</span></h2>
          </RevealDiv>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <RevealDiv key={i} delay={i * 0.12}>
                <TiltCard style={{ padding: '28px', background: 'rgba(255,255,255,0.025)', border: `1px solid ${t.color}22`, borderRadius: 20, height: '100%', position: 'relative', cursor: 'default' }}>
                  <div style={{ position: 'absolute', top: -1, left: -1, right: -1, height: 3, background: `linear-gradient(90deg,${t.color},transparent)`, borderRadius: '20px 20px 0 0' }} />
                  <div style={{ fontSize: '2.5rem', color: `${t.color}44`, fontFamily: 'serif', lineHeight: 1, marginBottom: 10 }}>"</div>
                  <p style={{ fontSize: '0.92rem', lineHeight: 1.75, color: 'var(--text-2)', marginBottom: 20 }}>{t.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${t.color},${t.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: 'white', flexShrink: 0 }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'white' }}>{t.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>{t.exam}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>📍 {t.state}</div>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 2 }}>
                    {[...Array(5)].map((_, j) => <span key={j} style={{ color: '#f59e0b', fontSize: '0.75rem' }}>★</span>)}
                  </div>
                </TiltCard>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: 'clamp(48px,8vw,100px) clamp(16px,4vw,24px)', background: 'var(--bg)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse,rgba(124,58,237,0.1),transparent 70%)', pointerEvents: 'none', animation: 'blobPulse 8s ease-in-out infinite' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <RevealDiv>
            <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simple Pricing</div>
            <h2 style={{ marginBottom: 8, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900 }}>One plan. <span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>All exams. Try free.</span></h2>
            <p style={{ marginBottom: 48, color: 'var(--text-3)', fontSize: '0.92rem' }}>2-day free trial for all new students. No credit card required. Cancel anytime.</p>
          </RevealDiv>

          <RevealDiv delay={0.1} direction="scale">
            <div style={{ display: 'inline-block', padding: 2, borderRadius: 30, background: 'linear-gradient(135deg,#7c3aed,#00d4ff,#10b981,#f59e0b)', backgroundSize: '300% 300%', animation: 'borderSpin 4s linear infinite', boxShadow: '0 0 80px rgba(124,58,237,0.3)' }}>
              <div style={{ maxWidth: 500, background: '#0d0a1a', borderRadius: 28, padding: '36px clamp(16px,6vw,40px)', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--r-full)', padding: '5px 16px', fontSize: '0.78rem', fontWeight: 800, color: '#10b981', marginBottom: 20 }}>
                  ✨ Free During Beta Active
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 24 }}>
                  {[
                    { label: 'Monthly', price: '₹249', sub: '/month', tag: null, discount: 'Free in Beta', border: 'rgba(124,58,237,0.4)', glow: 'rgba(124,58,237,0.1)' },
                    { label: '6 Months', price: '₹1,195', sub: '≈₹199/mo', tag: 'Popular', discount: 'Free in Beta', border: 'rgba(0,212,255,0.5)', glow: 'rgba(0,212,255,0.1)' },
                    { label: 'Annual', price: '₹1,999', sub: '≈₹167/mo', tag: 'Best Value', discount: 'Free in Beta', border: 'rgba(245,158,11,0.6)', glow: 'rgba(245,158,11,0.12)' },
                  ].map((p, i) => (
                    <div key={i} style={{
                      background: p.glow, border: `1px solid ${p.border}`,
                      borderRadius: 16, padding: '14px 8px', position: 'relative',
                      boxShadow: `0 0 20px ${p.glow}`
                    }}>
                      {p.tag && (
                        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: i === 2 ? '#f59e0b' : '#00d4ff', color: '#000', fontSize: '0.58rem', fontWeight: 900, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                          {p.tag}
                        </div>
                      )}
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, marginTop: p.tag ? 4 : 0 }}>{p.label}</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{p.price}</div>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(148,163,184,0.6)', marginTop: 3 }}>{p.sub}</div>
                      {p.discount && <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 800, marginTop: 4 }}>{p.discount}</div>}
                    </div>
                  ))}
                </div>

                {/* Features list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 28 }}>
                  {['Access all 200+ central & state mocks', '5 Lakh+ database mock question runs', '22 regional Indian languages available', 'Step-by-step K² AI detailed explanations', 'Secure online simulator matching exam laws'].map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.87rem', color: 'var(--text-2)' }}>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link to="/auth?signup=1" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: '16px 28px', background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', borderRadius: 'var(--r-full)', fontWeight: 800, fontSize: '1rem', color: 'white', textDecoration: 'none', boxShadow: '0 0 30px rgba(124,58,237,0.5)', width: '100%', boxSizing: 'border-box', minHeight: 48 }}>
                  Start Free Beta Trial <ArrowRight size={18} style={{ marginLeft: 8 }} />
                </Link>
                <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--text-4)' }}>No credit card required. Start solving instantly.</div>
              </div>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* ── APP DOWNLOAD ── */}
      <AppDownloadSection />

      {/* ── FOOTER ── */}
      <footer style={{ padding: '44px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <RevealDiv>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="white" />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>
              Prep<span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bridge</span>
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-4)', marginBottom: 8 }}>One dashboard for all central &amp; state competitive exams. Made in India, for India.</p>
          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.4)', letterSpacing: '0.04em' }}>Powered by</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 12px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.02em' }}>K<sup style={{ fontSize: '0.55rem', verticalAlign: 'super' }}>2</sup></span>
              <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.12)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>ADEXOS GLOBAL TECHNOLOGIES</span>
            </span>
          </div>
        </RevealDiv>
      </footer>

      {/* ── ANIMATIONS AND CUSTOM GLOBAL RULES ── */}
      <style>{`
        @keyframes marquee         { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes logoPulse       { 0%,100%{box-shadow:0 0 12px rgba(124,58,237,0.5)} 50%{box-shadow:0 0 28px rgba(124,58,237,0.9),0 0 50px rgba(0,212,255,0.3)} }
        @keyframes blobPulse       { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.1)} }
        @keyframes borderSpin      { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes slideIn         { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
