import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/useStore'
import { useTranslation } from 'react-i18next'
import { 
  Zap, CheckCircle, ArrowRight, BookOpen, ShieldAlert, Award, 
  Sparkles, MessageSquare, ChevronDown, Check, X, AlertCircle, 
  Menu, Compass, BarChart2, Shield, Signal, Bell, Users, Landmark 
} from 'lucide-react'
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
  const { t } = useTranslation()
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
      padding: 'clamp(50px,8vw,100px) clamp(16px,4vw,24px)',
      background: 'linear-gradient(180deg, #030408 0%, #060912 100%)',
      borderTop: '1px solid rgba(255,255,255,0.03)',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="radial-glow-indigo" style={{ top: '-20%', left: '-10%', opacity: 0.7 }} />
      <div className="radial-glow-emerald" style={{ bottom: '-20%', right: '-5%', opacity: 0.6 }} />

      <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(15px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-full)', padding: '5px 14px', fontSize: '0.75rem', fontWeight: 800, color: '#10b981', marginBottom: 18, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              📱 {t('landing.pricing.beta', 'Free During Beta Active')}
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, marginBottom: 14, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'white' }}>
              {headline}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
              {subtext}
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {showPlay && (
                <button
                  onClick={() => openInBrowser(playUrl)}
                  aria-label="Get PrepBridge on Google Play"
                  className="bento-btn-interactive"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#07090e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '12px 22px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                >
                  <PlayStoreBadge />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>GET IT ON</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Google Play</div>
                  </div>
                </button>
              )}

              {showApple && (
                <button
                  onClick={() => openInBrowser(appleUrl)}
                  aria-label="Download PrepBridge on the App Store"
                  className="bento-btn-interactive"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#07090e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '12px 22px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                >
                  <AppStoreBadge />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>DOWNLOAD ON THE</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>App Store</div>
                  </div>
                </button>
              )}
            </div>

            <div style={{ marginTop: 24, fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', gap: 20, flexWrap: 'wrap', fontWeight: 600 }}>
              <span>⭐ 4.9 rating</span>
              <span>📥 1L+ downloads</span>
              <span>🆓 Free to start</span>
            </div>
          </div>

          <div style={{ flexShrink: 0, margin: '0 auto', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <div style={{
                width: 220, height: 440,
                background: 'linear-gradient(180deg, #090b11 0%, #030408 100%)',
                borderRadius: 40,
                border: '1.5px solid rgba(255,255,255,0.08)',
                boxShadow: '0 24px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 90, height: 26, background: '#030408', borderRadius: '0 0 16px 16px', zIndex: 10, border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }} />
                <div style={{ padding: '36px 16px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
                    <span>9:41</span><span>●●●●</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg,#10b981,#6366f1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={12} color="white" />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>PrepBridge</span>
                  </div>
                  {[
                    { label: 'Daily Quiz', sub: '+10 pts', color: '#10b981' },
                    { label: 'AI Tutor', sub: 'Ask K²', color: '#6366f1' },
                    { label: 'Mock Test', sub: 'Active session', color: '#10b981' },
                  ].map((c, i) => (
                    <div key={i} style={{ background: `${c.color}0c`, border: `1px solid ${c.color}22`, borderRadius: 12, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>{c.label}</span>
                      <span style={{ fontSize: '0.62rem', color: c.color, fontWeight: 700 }}>{c.sub}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 4, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🔥</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b' }}>15 day streak</span>
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: 'rgba(5,7,12,0.98)', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
                  {['🏠','📖','⚡','🏆','👤'].map((icon, i) => (
                    <div key={i} style={{ fontSize: i === 0 ? '1rem' : '0.82rem', opacity: i === 0 ? 1 : 0.3 }}>{icon}</div>
                  ))}
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', width: 180, height: 40, background: 'rgba(16,185,129,0.2)', filter: 'blur(16px)', borderRadius: '50%', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

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
  const from = { up: 'translateY(20px)', left: 'translateX(-20px)', right: 'translateX(20px)', scale: 'scale(0.96)' }[direction] || 'translateY(20px)'
  return (
    <div ref={ref} style={{ transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`, opacity: visible ? 1 : 0, transform: visible ? 'none' : from, ...style }}>
      {children}
    </div>
  )
}

function TiltCard({ children, style = {} }) {
  const ref = useRef(null)
  const handleMove = (e) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 6
    const y = ((e.clientY - r.top) / r.height - 0.5) * -6
    el.style.transform = `perspective(500px) rotateY(${x}deg) rotateX(${y}deg) translateY(-2px)`
    el.style.borderColor = 'rgba(255,255,255,0.12)'
    el.style.background = 'rgba(255,255,255,0.03)'
  }
  const handleLeave = () => {
    const el = ref.current; if (!el) return
    el.style.transform = 'perspective(500px) rotateY(0deg) rotateX(0deg) translateY(0px)'
    el.style.borderColor = 'rgba(255,255,255,0.05)'
    el.style.background = 'rgba(10, 11, 18, 0.6)'
  }
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.2s ease, border-color 0.2s ease, background 0.2s ease', willChange: 'transform', ...style }}>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   EXAM CATEGORIES SHOWCASE Component
   ───────────────────────────────────────────────────────────────────────────── */
function ExamCategoriesShowcase() {
  const { t } = useTranslation()
  const [activeTrack, setActiveTrack] = useState('govt') // 'govt' | 'entrance'

  const govtCats = EXAM_CATEGORIES.filter(cat => cat.type === 'govt' || !cat.type)
  const entranceCats = EXAM_CATEGORIES.filter(cat => cat.type === 'entrance')
  const activeCats = activeTrack === 'govt' ? govtCats : entranceCats

  return (
    <section id="categories" style={{ padding: 'clamp(50px,8vw,100px) clamp(16px,4vw,24px)', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
      <div className="radial-glow-prime-green" style={{ top: '10%', right: '-10%', opacity: 0.6 }} />
      <div className="radial-glow-prime-purple" style={{ bottom: '5%', left: '-5%', opacity: 0.5 }} />

      <RevealDiv style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="prime-badge" style={{ marginBottom: 16 }}>
          ⚡ EXAM HUB PLATFORM
        </div>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 900, marginBottom: 14, color: 'white', letterSpacing: '-0.02em' }}>
          Explore <span style={{ background: 'linear-gradient(90deg,#00e676,#7c4dff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PrepInsta Prime</span> Style Catalog
        </h2>
        <p style={{ color: 'var(--text-2)', maxWidth: 620, margin: '0 auto 36px', fontSize: '0.95rem', lineHeight: 1.7 }}>
          Choose your competitive exam path. Instantly practice national mock exams, review official answer keys, and clear your concepts with 24/7 K² AI Tutor guidance.
        </p>

        {/* Track Switcher */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 999, padding: 6, gap: 4, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }}>
          <button
            onClick={() => setActiveTrack('govt')}
            style={{
              padding: '12px 28px', borderRadius: 999, border: 'none', background: activeTrack === 'govt' ? 'var(--prime-grad-green)' : 'transparent',
              color: activeTrack === 'govt' ? '#030408' : 'var(--text-3)', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.25s',
              minHeight: 46
            }}
          >
            💼 {t('landing.catalog.govt', 'Government Job Exams')}
          </button>
          <button
            onClick={() => setActiveTrack('entrance')}
            style={{
              padding: '12px 28px', borderRadius: 999, border: 'none', background: activeTrack === 'entrance' ? 'var(--prime-grad-purple)' : 'transparent',
              color: activeTrack === 'entrance' ? 'white' : 'var(--text-3)', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.25s',
              minHeight: 46
            }}
          >
            🎓 {t('landing.catalog.entrance', 'College Entrance & Boards')}
          </button>
        </div>
      </RevealDiv>

      {/* Grid structure */}
      <div className="grid-3" style={{ gap: 24, position: 'relative', zIndex: 1 }}>
        {activeCats.map((cat) => {
          const catColor = cat.color || '#00e676';
          return (
            <RevealDiv key={cat.id} direction="scale">
              <div 
                className={`prepinsta-card ${activeTrack === 'entrance' ? 'prepinsta-card-purple' : ''}`}
                style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderTop: `3px solid ${catColor}`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)`
                }}
              >
                <div style={{ padding: '24px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                    <span 
                      style={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 800, 
                        color: catColor, 
                        background: `${catColor}0f`, 
                        border: `1px solid ${catColor}33`, 
                        borderRadius: 30, 
                        padding: '3px 10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {cat.exams.length} Tracks
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'white', marginBottom: 6 }}>{cat.label}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.4 }}>
                    Complete syllabus preparation including previous years question analysis.
                  </p>
                </div>

                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cat.exams.slice(0, 4).map((exam) => (
                    <div 
                      key={exam.id}
                      style={{
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.03)',
                        borderRadius: 12,
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        transition: 'var(--t)'
                      }}
                      className="bento-btn-interactive"
                    >
                      <div style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', color: 'white', fontWeight: 700, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.name}</span>
                        <span style={{ display: 'block', color: 'var(--text-3)', fontSize: '0.68rem', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.fullName}</span>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {exam.vacancies ? (
                          <span style={{ display: 'block', color: '#00e676', fontWeight: 800, fontSize: '0.76rem' }}>{exam.vacancies.toLocaleString()} seats</span>
                        ) : (
                          <span style={{ display: 'block', color: 'var(--text-3)', fontSize: '0.76rem', fontWeight: 700 }}>Active Track</span>
                        )}
                        <span style={{ display: 'block', color: 'var(--text-4)', fontSize: '0.6rem', marginTop: 1 }}>Date: {new Date(exam.nextDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}

                  {cat.exams.length > 4 && (
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, padding: '4px 0' }}>
                      + {cat.exams.length - 4} more exams available in this track
                    </div>
                  )}

                  <Link
                    to="/auth?signup=1"
                    className={`btn btn-sm ${activeTrack === 'govt' ? 'btn-prime-green' : 'btn-prime-purple'}`}
                    style={{
                      width: '100%',
                      marginTop: 'auto',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      gap: 6
                    }}
                  >
                    Start Practice <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </RevealDiv>
          )
        })}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   INTERACTIVE TRY-BEFORE-SIGNUP DEMO Component
   ───────────────────────────────────────────────────────────────────────────── */
function InteractiveMockDemo() {
  const { t } = useTranslation()
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
    <section id="demo" style={{ padding: 'clamp(50px,8vw,100px) clamp(16px,4vw,24px)', background: 'linear-gradient(180deg, #030408 0%, #060912 100%)', position: 'relative' }}>
      <div className="radial-glow-emerald" style={{ bottom: '-10%', left: '-10%', opacity: 0.5 }} />

      <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <RevealDiv style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-full)', padding: '6px 16px', fontSize: '0.75rem', fontWeight: 800, color: '#10b981', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ⚡ Interactive Demo
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, marginBottom: 12, color: 'white' }}>
            {t('landing.demo.title', 'Try a Live Mock Test')}
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            {t('landing.demo.desc', 'No signup required. Test our interactive interface and read real-time K² AI explanations.')}
          </p>
        </RevealDiv>

        <RevealDiv direction="scale">
          <div style={{
            background: 'rgba(10,11,18,0.7)',
            border: '1.5px solid rgba(255,255,255,0.05)',
            borderRadius: 24,
            padding: 'clamp(20px, 4vw, 36px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            position: 'relative',
            backdropFilter: 'blur(24px)'
          }}>
            {!finished ? (
              <div>
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 14, marginBottom: 20 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-3)', fontWeight: 800 }}>
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(99,102,241,0.12)', color: '#818cf8', fontSize: '0.72rem', fontWeight: 800, padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.2)' }}>
                    <Sparkles size={12} /> Simulated Negative Marking: -0.25
                  </span>
                </div>

                {/* Question */}
                <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', fontWeight: 900, color: 'white', lineHeight: 1.5, marginBottom: 24 }}>
                  {activeQuestion.q}
                </p>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {activeQuestion.options.map((opt, i) => {
                    const isSelected = selectedOpt === i
                    let borderCol = 'rgba(255,255,255,0.04)'
                    let bgCol = 'rgba(255,255,255,0.008)'

                    if (isSelected) {
                      borderCol = '#6366f1'
                      bgCol = 'rgba(99,102,241,0.08)'
                    }

                    if (checked) {
                      if (i === activeQuestion.correct) {
                        borderCol = '#10b981'
                        bgCol = 'rgba(16,185,129,0.08)'
                      } else if (isSelected) {
                        borderCol = '#ef4444'
                        bgCol = 'rgba(239,68,68,0.08)'
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
                          borderRadius: 14,
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
                          minHeight: 48,
                        }}
                      >
                        <span>{opt}</span>
                        {checked && i === activeQuestion.correct && <Check size={18} color="#10b981" />}
                        {checked && isSelected && i !== activeQuestion.correct && <X size={18} color="#ef4444" />}
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
                        background: selectedOpt === null ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg,#10b981,#6366f1)',
                        color: selectedOpt === null ? 'var(--text-4)' : 'white',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        cursor: selectedOpt === null ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        minHeight: 44
                      }}
                    >
                      {t('landing.demo.check', 'Check Answer')}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      style={{
                        padding: '12px 28px',
                        borderRadius: 12,
                        border: 'none',
                        background: 'linear-gradient(135deg,#10b981,#6366f1)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        minHeight: 44
                      }}
                    >
                      {currentIdx === questions.length - 1 ? t('landing.demo.finish', 'Finish Test') : t('landing.demo.next', 'Next Question →')}
                    </button>
                  )}
                </div>

                {/* K2 AI Explanation */}
                {checked && (
                  <div style={{
                    marginTop: 24,
                    background: 'rgba(99,102,241,0.04)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderLeft: '4px solid #6366f1',
                    borderRadius: '4px 14px 14px 4px',
                    padding: '16px 20px',
                    animation: 'slideIn 0.3s ease forwards'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#818cf8', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: 6 }}>
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
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: 8 }}>{t('landing.demo.completed', 'Mini Mock Test Completed!')}</h3>
                <p style={{ color: 'var(--text-3)', fontSize: '0.95rem', marginBottom: 24, fontWeight: 500 }}>
                  {t('landing.demo.scored', { score: scores, total: questions.length, defaultValue: 'You scored {{score}} out of {{total}} correct options.' })}
                </p>

                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleReset}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'transparent',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      minHeight: 44
                    }}
                  >
                    🔄 {t('landing.demo.retake', 'Retake Demo Mocks')}
                  </button>
                  <Link
                    to="/auth?signup=1"
                    style={{
                      padding: '12px 28px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg,#10b981,#6366f1)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      minHeight: 44
                    }}
                  >
                    ⚡ {t('landing.demo.access', 'Access 5 Lakh+ Mocks & AI Tutor Now')}
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
  const { t } = useTranslation()
  return (
    <section id="addons" style={{ padding: 'clamp(50px,8vw,100px) clamp(16px,4vw,24px)', background: 'linear-gradient(180deg, #060912 0%, #030408 100%)', borderTop: '1px solid rgba(255,255,255,0.03)', position: 'relative' }}>
      <div className="radial-glow-indigo" style={{ top: '20%', left: '50%', transform: 'translateX(-50%)', opacity: 0.5 }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Spotlight 1: PeakPredict */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center', marginBottom: 80 }}>
          {/* Left: visuals */}
          <div style={{ flex: 1, minWidth: 300, position: 'relative' }}>
            <div className="radial-glow-emerald" style={{ inset: 0, opacity: 0.6 }} />
            <div style={{
              background: 'rgba(10,11,18,0.7)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              position: 'relative',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span style={{ fontSize: '0.68rem', background: 'rgba(99,102,241,0.12)', color: '#818cf8', padding: '4px 10px', borderRadius: 6, fontWeight: 800, border: '1px solid rgba(99,102,241,0.2)' }}>
                  K² PEAKPREDICT ACTIVE
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'white' }}>₹149 Unlock Addon</span>
              </div>
              
              {/* Syllabus weightage bar chart mock */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { topic: 'Constitutional Amendments', freq: '84%', color: '#6366f1', width: '84%' },
                  { topic: 'Fundamental Rights & Writs', freq: '79%', color: '#10b981', width: '79%' },
                  { topic: 'Federalism & Interstate laws', freq: '38%', color: 'var(--text-3)', width: '38%' },
                  { topic: 'Judiciary appointments', freq: '22%', color: 'var(--text-3)', width: '22%' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                      <span style={{ color: 'white', fontWeight: 700 }}>{item.topic}</span>
                      <span style={{ color: item.color, fontWeight: 800 }}>{item.freq} Weightage</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: item.width, height: '100%', background: item.color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: 12 }}>
                <AlertCircle size={16} color="#818cf8" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-2)', lineHeight: 1.45 }}>
                  <strong>Important Note:</strong> We strictly respect exam integrity and do not leak actual papers. PrepPredict leverages historical frequency statistics to isolate high-probability syllabus areas.
                </p>
              </div>
            </div>
          </div>

          {/* Right: text info */}
          <div style={{ flex: 1.2, minWidth: 300 }}>
            <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--r-full)', padding: '5px 14px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--purple)', marginBottom: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              📊 AI Syllabus Telemetry
            </div>
            <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 900, marginBottom: 14, color: 'white', lineHeight: 1.2 }}>
              {t('landing.addons.peak.title', 'K² PeakPredict Addon')}
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>
              Examine historical exam trends, isolate recurring subject topics, and practice with high-probability questions.
            </p>
            <ul style={{ paddingLeft: 18, color: 'var(--text-2)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 8, margin: '0 0 28px' }}>
              <li><strong>Probability Filtering:</strong> Generates papers emphasizing key core weightages.</li>
              <li><strong>Affordable Addon Pricing:</strong> Unlock for your exam track at just <strong>₹149</strong>.</li>
              <li><strong>Safe Guess Papers:</strong> Refines your revision schedule during the final weeks leading to exam dates.</li>
            </ul>

            <Link
              to="/auth?signup=1"
              className="bento-btn-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '12px 24px',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              Add to Practice Mocks →
            </Link>
          </div>
        </div>

        {/* Spotlight 2: Secured Solved Papers */}
        <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: 48, alignItems: 'center' }}>
          {/* Left: text info */}
          <div style={{ flex: 1.2, minWidth: 300 }}>
            <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-full)', padding: '5px 14px', fontSize: '0.75rem', fontWeight: 800, color: '#10b981', marginBottom: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              🔒 Secured online environment
            </div>
            <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 900, marginBottom: 14, color: 'white', lineHeight: 1.2 }}>
              {t('landing.addons.pyq.title', 'Strictly Online PYQs')}
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>
              To ensure mock exam conditions and safeguard premium study material, past papers must be completed directly inside our platform.
            </p>
            <ul style={{ paddingLeft: 18, color: 'var(--text-2)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 8, margin: '0 0 28px' }}>
              <li><strong>Downloads Disabled:</strong> Question papers cannot be downloaded as PDFs.</li>
              <li><strong>Online Runner:</strong> Full compliance with negative marking and actual section timers.</li>
              <li><strong>Detailed Solutions:</strong> Complete access to K² step-by-step AI answers inside your dashboard.</li>
            </ul>

            <Link
              to="/auth?signup=1"
              className="bento-btn-interactive"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '12px 24px',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              Start Solved PYQs Mocks →
            </Link>
          </div>

          {/* Right: visuals */}
          <div style={{ flex: 1, minWidth: 300, position: 'relative' }}>
            <div className="radial-glow-indigo" style={{ inset: 0, opacity: 0.6 }} />
            <div style={{
              background: 'rgba(10,11,18,0.7)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              position: 'relative',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>Mock Session Runner</span>
                <span style={{ fontSize: '0.68rem', color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                  ⬇️ PDF DOWNLOAD DISABLED
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px' }}>
                  <BookOpen size={16} color="#10b981" />
                  <span style={{ fontSize: '0.82rem', color: 'white', fontWeight: 700 }}>Secured Exam Runner Mode Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px' }}>
                  <ShieldAlert size={16} color="#f59e0b" />
                  <span style={{ fontSize: '0.82rem', color: 'white', fontWeight: 700 }}>Secure Browser Anti-Cheat Monitoring</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px' }}>
                  <Award size={16} color="#6366f1" />
                  <span style={{ fontSize: '0.82rem', color: 'white', fontWeight: 700 }}>Graded Certificate with All India Rank</span>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [chatLang, setChatLang] = useState('hi')
  const [billingCycle, setBillingCycle] = useState('monthly')

  const activeLangObj = ALL_LANGUAGES.find(l => l.code === i18n.language) || ALL_LANGUAGES[0]

  useEffect(() => {
    if (user && onboardingComplete) navigate('/app/dashboard')
    else if (user) navigate('/onboarding')
  }, [user, onboardingComplete, navigate])

  const changeLanguage = (code) => {
    i18n.changeLanguage(code)
    setLangMenuOpen(false)
  }

  // Bento features data for the redesign
  const bentoFeatures = [
    {
      icon: <MessageSquare size={24} color="#6366f1" />,
      title: "24/7 AI tutor in 22 regional Indian languages",
      desc: "Real-time AI explains any complex syllabus topic in 22 regional Indian languages instantly.",
      badge: "K² AI powered",
      color: "indigo",
      layoutClass: "bento-large-card"
    },
    {
      icon: <BarChart2 size={24} color="#10b981" />,
      title: "K² PeakPredict AI weightage analysis",
      desc: "Isolate recurring subject topics and practice high-probability syllabus areas.",
      badge: "₹149 Addon",
      color: "emerald",
      layoutClass: "bento-small-card"
    },
    {
      icon: <Shield size={24} color="#ef4444" />,
      title: "Secured PYQ Solver Engine",
      desc: "Protected online environments with negative marking & live section timers.",
      badge: "Anti-Cheat Mode",
      color: "red",
      layoutClass: "bento-small-card"
    },
    {
      icon: <Signal size={24} color="#f59e0b" />,
      title: "Zero-Lag Offline PWA support",
      desc: "Install on any basic device. Zero lags and active caching for slow networks.",
      badge: "Offline Active",
      color: "amber",
      layoutClass: "bento-small-card"
    },
    {
      icon: <Bell size={24} color="#00d4ff" />,
      title: "Vacancies & Admit push notifications",
      desc: "Instant push alerts matching your selected tracks the moment boards release updates.",
      badge: "Real-time Alerts",
      color: "cyan",
      layoutClass: "bento-large-card"
    },
    {
      icon: <Users size={24} color="#a855f7" />,
      title: "All India Rank Percentiles",
      desc: "Compare accuracy scores on national percentiles and pinpoint focus areas.",
      badge: "Mock analytics",
      color: "purple",
      layoutClass: "bento-small-card"
    }
  ]

  return (
    <div style={{ background: '#030408', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Scroll Progress Bar ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: 3, width: `${scrollProgress}%`, background: 'linear-gradient(90deg,#10b981,#6366f1,#00d4ff)', zIndex: 9999, transition: 'width 0.1s', boxShadow: '0 0 10px rgba(16,185,129,0.8)' }} />

      {/* ── Navbar ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(3,4,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#10b981,#6366f1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(16,185,129,0.4)', animation: 'logoPulse 3s ease-in-out infinite', flexShrink: 0 }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em', whiteSpace: 'nowrap', color: 'white' }}>
            Prep<span style={{ background: 'linear-gradient(90deg,#10b981,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bridge</span>
          </span>
        </div>

        {/* Desktop Nav Actions */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }} className="desktop-nav-group">
          
          {/* Elegant Language switcher dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangMenuOpen(prev => !prev)}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--r-full)',
                padding: '7px 14px',
                fontSize: '0.8rem',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                minHeight: 36,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              <span>{activeLangObj.flag} {activeLangObj.native}</span>
              <ChevronDown size={12} style={{ transform: langMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {langMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                background: '#07090e',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                width: 180,
                maxHeight: 280,
                overflowY: 'auto',
                boxShadow: '0 12px 30px rgba(0,0,0,0.7)',
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
                      background: i18n.language === l.code ? 'rgba(16,185,129,0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: 10,
                      color: i18n.language === l.code ? 'white' : 'var(--text-3)',
                      fontWeight: i18n.language === l.code ? 800 : 500,
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
                    {i18n.language === l.code && <Check size={12} color="#10b981" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/auth" className="nav-login-btn" style={{ color: 'var(--text-2)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', padding: '7px 18px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--r-full)', transition: 'all 0.2s', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', minHeight: 36 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-2)' }}>{t('nav.login', 'Login')}</Link>
          <Link to="/auth?signup=1" style={{ background: 'linear-gradient(135deg,#10b981,#6366f1)', color: 'white', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', padding: '8px 20px', borderRadius: 'var(--r-full)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 36 }}>
            {t('nav.start_free', 'Start Free')} →
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button className="mobile-menu-trigger" onClick={() => setMobileMenuOpen(prev => !prev)} style={{ display: 'none', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <Menu size={22} />
        </button>
      </nav>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, background: '#07090e', borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 199, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 700 }}>Language:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_LANGUAGES.slice(0, 5).map(l => (
                <button key={l.code} onClick={() => changeLanguage(l.code)} style={{ padding: '6px 12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, background: i18n.language === l.code ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.02)', color: 'white', fontSize: '0.78rem', fontWeight: 700 }}>
                  {l.native}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/auth" style={{ flex: 1, textAlign: 'center', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: 'white', fontSize: '0.88rem', fontWeight: 700 }}>{t('nav.login', 'Login')}</Link>
            <Link to="/auth?signup=1" style={{ flex: 1, textAlign: 'center', padding: '12px', background: 'linear-gradient(135deg,#10b981,#6366f1)', borderRadius: 12, color: 'white', fontSize: '0.88rem', fontWeight: 800 }}>{t('nav.start_free', 'Start Free')}</Link>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <div style={{ paddingTop: 60, position: 'relative' }}>
        <HeroVideo />
      </div>

      {/* ── Marquee ticker — DUAL DIRECTION ── */}
      <div style={{ background: 'rgba(255,255,255,0.005)', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '14px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 18, animation: 'marquee 22s linear infinite', whiteSpace: 'nowrap' }}>
          {[...EXAMS_MARQUEE, ...EXAMS_MARQUEE].map((e, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-2)', padding: '6px 14px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 'var(--r-full)', flexShrink: 0 }}>
              <CheckCircle size={12} color="#10b981" /> {e}
            </span>
          ))}
        </div>
      </div>

      {/* ── STORY SECTION ── */}
      <StorySection />

      {/* ── BENTO FEATURES GRID ── */}
      <section id="features" style={{ padding: 'clamp(50px,8vw,100px) clamp(16px,4vw,24px)', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div className="radial-glow-emerald" style={{ top: '-10%', right: '-15%', opacity: 0.5 }} />

        <RevealDiv style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.75rem', fontWeight: 800, color: '#10b981', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Platform Features</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 8, color: 'white' }}>Everything to <span style={{ background: 'linear-gradient(90deg,#10b981,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>crack any exam</span></h2>
        </RevealDiv>

        {/* Bento grid layout */}
        <div className="bento-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          
          {/* Card 1 (col-span-2): AI Tutor Chat Simulator */}
          <RevealDiv direction="scale" style={{ gridColumn: 'span 2' }}>
            <TiltCard style={{ padding: '30px', background: 'rgba(10, 11, 18, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MessageSquare size={18} color="#6366f1" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', margin: 0 }}>24/7 AI tutor in 22 regional Indian languages</h3>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 1 }}>Translates complex syllabus topics instantly</span>
                  </div>
                </div>
                
                {/* Language switcher tabs */}
                <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.02)', padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                  {[
                    { code: 'hi', label: 'Hindi' },
                    { code: 'te', label: 'Telugu' },
                    { code: 'ta', label: 'Tamil' },
                    { code: 'bn', label: 'Bengali' }
                  ].map(l => (
                    <button
                      key={l.code}
                      onClick={() => setChatLang(l.code)}
                      style={{
                        padding: '4px 10px',
                        background: chatLang === l.code ? '#6366f1' : 'transparent',
                        color: chatLang === l.code ? 'white' : 'var(--text-3)',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        minHeight: 28
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Simulator Area */}
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.008)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 180, justifyContent: 'center' }}>
                <div style={{ alignSelf: 'flex-end', background: 'rgba(255,255,255,0.03)', padding: '8px 14px', borderRadius: '12px 12px 0 12px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.95)', maxWidth: '85%' }}>
                  {chatLang === 'hi' ? 'Article 21 क्या है?' :
                   chatLang === 'te' ? 'ఆర్టికల్ 21 అంటే ఏమిటి?' :
                   chatLang === 'ta' ? 'விதி 21 என்றால் என்ன?' :
                   'আর্টিকেল ২১ কী?'}
                </div>
                
                <div style={{ alignSelf: 'flex-start', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', padding: '10px 16px', borderRadius: '12px 12px 12px 0', fontSize: '0.78rem', color: '#a5b4fc', maxWidth: '85%', lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 800, color: '#6366f1', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={12} /> K² AI Tutor
                  </div>
                  {chatLang === 'hi' ? 'भारतीय संविधान का अनुच्छेद 21 जीवन और व्यक्तिगत स्वतंत्रता के अधिकार की गारंटी देता है। यह किसी भी नागरिक को कानून द्वारा स्थापित प्रक्रिया के बिना जीवन से वंचित करने से रोकता है।' :
                   chatLang === 'te' ? 'భారత రాజ్యాంగంలోని ఆర్టికల్ 21 జీవించే హక్కు మరియు వ్యక్తిగత స్వేచ్ఛకు హామీ ఇస్తుంది. చట్టం ద్వారా నిర్దేశించబడిన విధానం ప్రకారం తప్ప ఏ వ్యక్తి స్వేచ్ఛను హరించలేరు.' :
                   chatLang === 'ta' ? 'இந்திய அரசியலமைப்பின் விதி 21 உயிர் வாழும் உரிமை மற்றும் தனிநபர் சுதந்திரத்திற்கு உத்தரவாதம் அளிக்கிறது. சட்டபூர்வமான நடைமுறை இல்லாமல் ஒருவரின் உயிரை பறிக்க முடியாது.' :
                   'ভারতীয় সংবিধানে ধারা ২১ জীবন ও ব্যক্তিগত স্বাধীনতার অধিকারের নিশ্চয়তা দেয়। আইনসম্মত পদ্ধতি ব্যতীত কোনো ব্যক্তির জীবন হরণ করা যাবে না।'}
                </div>
              </div>
            </TiltCard>
          </RevealDiv>

          {/* Card 2 (col-span-1): PeakPredict AI Weightage Analysis */}
          <RevealDiv direction="scale" style={{ gridColumn: 'span 1' }}>
            <TiltCard style={{ padding: '30px', background: 'rgba(10, 11, 18, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BarChart2 size={18} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', margin: 0 }}>AI Weightage</h3>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 1 }}>PeakPredict syllabus telemetry</span>
                </div>
              </div>
              
              {/* Telemetry vector/bars */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', background: 'rgba(255,255,255,0.005)', padding: 12, borderRadius: 16, border: '1px solid rgba(255,255,255,0.02)' }}>
                {[
                  { topic: 'Amendments', freq: '84%', color: '#10b981' },
                  { topic: 'Fundamental Rights', freq: '79%', color: '#6366f1' },
                  { topic: 'Directive Principles', freq: '42%', color: 'var(--text-3)' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: 'white', marginBottom: 4 }}>
                      <span>{item.topic}</span>
                      <span style={{ color: item.color }}>{item.freq}</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: item.freq, height: '100%', background: item.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </TiltCard>
          </RevealDiv>

          {/* Card 3 (col-span-1): Secured PYQ Solver Engine */}
          <RevealDiv direction="scale" style={{ gridColumn: 'span 1' }}>
            <TiltCard style={{ padding: '30px', background: 'rgba(10, 11, 18, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={18} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', margin: 0 }}>Secured PYQ Engine</h3>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 1 }}>Simulates official board laws</span>
                </div>
              </div>

              {/* Simulated solver telemetry widget */}
              <div style={{ flex: 1, background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 16, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 800 }}>UPSC CSE MOCK</span>
                  <span style={{ fontSize: '0.72rem', color: 'white', fontWeight: 800 }}>⏱️ 02:14:59</span>
                </div>
                <div style={{ width: '100%', height: 1, background: 'rgba(239,68,68,0.1)' }} />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', lineHeight: 1.3 }}>
                  Negative marking applies: <span style={{ color: '#ef4444', fontWeight: 700 }}>-0.33</span> per wrong choice.
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {['A', 'B', 'C', 'D'].map(o => (
                    <div key={o} style={{ flex: 1, aspectRatio: 1, background: o === 'C' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.02)', border: o === 'C' ? '1.5px solid #6366f1' : '1px solid rgba(255,255,255,0.04)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: o === 'C' ? 'white' : 'var(--text-3)' }}>
                      {o}
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </RevealDiv>

          {/* Card 4 (col-span-1): Zero-Lag Offline PWA support */}
          <RevealDiv direction="scale" style={{ gridColumn: 'span 1' }}>
            <TiltCard style={{ padding: '30px', background: 'rgba(10, 11, 18, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Signal size={18} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', margin: 0 }}>Offline Support</h3>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 1 }}>Robust PWA for slow networks</span>
                </div>
              </div>

              {/* Offline Sync Widget */}
              <div style={{ flex: 1, background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b', animation: 'storyBlink 1.5s infinite' }} />
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'white', fontWeight: 800 }}>Offline Mode Active</span>
                  <span style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 2 }}>42.5 MB pre-cached logs</span>
                </div>
              </div>
            </TiltCard>
          </RevealDiv>

          {/* Card 5 (col-span-2): Vacancies & Admit notifications */}
          <RevealDiv direction="scale" style={{ gridColumn: 'span 2' }}>
            <TiltCard style={{ padding: '30px', background: 'rgba(10, 11, 18, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bell size={18} color="#00d4ff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', margin: 0 }}>Vacancies &amp; Push Alerts</h3>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 1 }}>Match notifications with your chosen track</span>
                </div>
              </div>

              {/* Visual notification dashboard preview */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.005)', padding: 12, borderRadius: 16, border: '1px solid rgba(255,255,255,0.02)' }}>
                {[
                  { title: 'UPSC Civil Services 2026 update', desc: '1,056 vacancies released officially. Mapped to your catalog.', time: '2m ago' },
                  { title: 'SSC CGL Admit Cards out', desc: 'Download server links active. Mock simulator updated.', time: '1h ago' }
                ].map((n, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 12 }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'white', fontWeight: 800 }}>{n.title}</span>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-3)', marginTop: 2 }}>{n.desc}</span>
                    </div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-4)', fontWeight: 700, flexShrink: 0 }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </TiltCard>
          </RevealDiv>

          {/* Card 6 (col-span-1): All India Rank Percentiles */}
          <RevealDiv direction="scale" style={{ gridColumn: 'span 1' }}>
            <TiltCard style={{ padding: '30px', background: 'rgba(10, 11, 18, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={18} color="#a855f7" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', margin: 0 }}>All India Rankings</h3>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 1 }}>National mock test percentiles</span>
                </div>
              </div>

              {/* Circular SVG Gauge visualization */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <svg width="100" height="60" viewBox="0 0 100 60">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#purpleGrad)" strokeWidth="8" strokeDasharray="125" strokeDashoffset="12" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', bottom: 10, textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>99.8%</span>
                  <span style={{ display: 'block', fontSize: '0.6rem', color: '#a855f7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>Top 0.2% Nationally</span>
                </div>
              </div>
            </TiltCard>
          </RevealDiv>

        </div>
      </section>

      {/* ── EXAM CATEGORIES SHOWCASE ── */}
      <ExamCategoriesShowcase />

      {/* ── INTERACTIVE MOCK DEMO ── */}
      <InteractiveMockDemo />

      {/* ── ADDON SPOTLIGHT (PeakPredict & PYQ) ── */}
      <AddonSpotlight />

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,24px)', background: 'linear-gradient(180deg, #030408 0%, #060912 100%)', position: 'relative', overflow: 'hidden' }}>
        <div className="radial-glow-indigo" style={{ bottom: '-5%', right: '-5%', opacity: 0.5 }} />
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealDiv style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Success Stories</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white' }}>Real students. <span style={{ background: 'linear-gradient(90deg,#f59e0b,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real results.</span></h2>
          </RevealDiv>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <RevealDiv key={i} delay={i * 0.1}>
                <TiltCard style={{ padding: '28px', background: 'rgba(10, 11, 18, 0.6)', border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 24, height: '100%', position: 'relative', cursor: 'default' }}>
                  <div style={{ position: 'absolute', top: -1, left: -1, right: -1, height: 3, background: `linear-gradient(90deg,${t.color},transparent)`, borderRadius: '24px 24px 0 0' }} />
                  <div style={{ fontSize: '2.5rem', color: `${t.color}33`, fontFamily: 'serif', lineHeight: 1, marginBottom: 10 }}>"</div>
                  <p style={{ fontSize: '0.92rem', lineHeight: 1.75, color: 'var(--text-2)', marginBottom: 20 }}>{t.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${t.color},${t.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 850, fontSize: '1.1rem', color: 'white', flexShrink: 0 }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'white' }}>{t.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800 }}>{t.exam}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600 }}>📍 {t.state}</div>
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
      <section style={{ padding: 'clamp(50px,8vw,100px) clamp(16px,4vw,24px)', background: '#030408', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="radial-glow-indigo" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.4 }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <RevealDiv>
            <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#10b981', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simple Pricing</div>
            <h2 style={{ marginBottom: 8, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white' }}>{t('landing.pricing.title', 'One plan. All exams. Try free.')}</h2>
            <p style={{ marginBottom: 24, color: 'var(--text-3)', fontSize: '0.92rem', fontWeight: 600 }}>{t('landing.pricing.desc', '2-day free trial for all new students. No credit card required. Cancel anytime.')}</p>
            
            {/* Billing Switcher Toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', padding: '4px 6px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 40 }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '8px 18px',
                  background: billingCycle === 'monthly' ? '#10b981' : 'transparent',
                  color: billingCycle === 'monthly' ? 'white' : 'var(--text-3)',
                  border: 'none',
                  borderRadius: 999,
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  minHeight: 32
                }}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '8px 18px',
                  background: billingCycle === 'annual' ? '#10b981' : 'transparent',
                  color: billingCycle === 'annual' ? 'white' : 'var(--text-3)',
                  border: 'none',
                  borderRadius: 999,
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  minHeight: 32
                }}
              >
                Annual Billing <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.62rem', fontWeight: 900, padding: '2px 6px', borderRadius: 6 }}>SAVE 20%</span>
              </button>
            </div>
          </RevealDiv>

          <RevealDiv delay={0.08} direction="scale">
            <div style={{ display: 'inline-block', padding: 1.5, borderRadius: 28, background: 'linear-gradient(135deg,#10b981,#6366f1,#00d4ff,#f59e0b)', backgroundSize: '300% 300%', animation: 'borderSpin 4s linear infinite', boxShadow: '0 0 60px rgba(16,185,129,0.2)' }}>
              <div style={{ maxWidth: 500, background: '#07090e', borderRadius: 27, padding: '36px clamp(16px,6vw,40px)', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-full)', padding: '5px 16px', fontSize: '0.78rem', fontWeight: 900, color: '#10b981', marginBottom: 20 }}>
                  ✨ {t('landing.pricing.beta', 'Free During Beta Active')}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12, marginBottom: 28 }}>
                  {[
                    { label: 'Monthly', price: '₹249', sub: '/month', tag: null, discount: 'Free in Beta', border: 'rgba(16,185,129,0.25)', glow: 'rgba(16,185,129,0.03)' },
                    { label: '6 Months', price: '₹1,195', sub: '≈₹199/mo', tag: 'Popular', discount: 'Free in Beta', border: 'rgba(99,102,241,0.25)', glow: 'rgba(99,102,241,0.03)' },
                    { label: 'Annual', price: billingCycle === 'annual' ? '₹1,999' : '₹2,388', sub: billingCycle === 'annual' ? '≈₹167/mo' : '≈₹199/mo', tag: 'Best Value', discount: 'Free in Beta', border: 'rgba(245,158,11,0.25)', glow: 'rgba(245,158,11,0.04)' },
                  ].map((p, i) => (
                    <div key={i} style={{
                      background: p.glow, border: `1px solid ${p.border}`,
                      borderRadius: 16, padding: '14px 8px', position: 'relative',
                      boxShadow: `0 0 20px ${p.glow}`
                    }}>
                      {p.tag && (
                        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: i === 2 ? '#f59e0b' : '#6366f1', color: '#fff', fontSize: '0.58rem', fontWeight: 900, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                          {p.tag}
                        </div>
                      )}
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, marginTop: p.tag ? 4 : 0 }}>{p.label}</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{p.price}</div>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(148,163,184,0.4)', marginTop: 3, fontWeight: 600 }}>{p.sub}</div>
                      {p.discount && <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 800, marginTop: 4 }}>{p.discount}</div>}
                    </div>
                  ))}
                </div>

                {/* Features list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 32 }}>
                  {['Access all 200+ central & state mocks', '5 Lakh+ database mock question runs', '22 regional Indian languages available', 'Step-by-step K² AI detailed explanations', 'Secure online simulator matching exam laws'].map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.87rem', color: 'var(--text-2)' }}>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link to="/auth?signup=1" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: '16px 28px', background: 'linear-gradient(135deg,#10b981,#6366f1)', borderRadius: 16, fontWeight: 900, fontSize: '1rem', color: 'white', textDecoration: 'none', boxShadow: '0 0 30px rgba(16,185,129,0.3)', width: '100%', boxSizing: 'border-box', minHeight: 48 }}>
                  {t('landing.pricing.start_trial', 'Start Free Beta Trial')} <ArrowRight size={18} style={{ marginLeft: 8 }} />
                </Link>
                <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600 }}>No credit card required. Start solving instantly.</div>
              </div>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* ── APP DOWNLOAD ── */}
      <AppDownloadSection />

      {/* ── FOOTER ── */}
      <footer style={{ padding: '44px 24px', borderTop: '1px solid rgba(255,255,255,0.03)', textAlign: 'center', background: '#030408' }}>
        <RevealDiv>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#10b981,#6366f1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="white" />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>
              Prep<span style={{ background: 'linear-gradient(90deg,#10b981,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bridge</span>
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 8, fontWeight: 600 }}>One dashboard for all central &amp; state competitive exams. Made in India, for India.</p>
          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.03)', margin: '20px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.3)', letterSpacing: '0.04em' }}>Powered by</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '5px 12px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.02em' }}>K<sup style={{ fontSize: '0.55rem', verticalAlign: 'super' }}>2</sup></span>
              <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>ADEXOS GLOBAL TECHNOLOGIES</span>
            </span>
          </div>
        </RevealDiv>
      </footer>

      {/* ── ANIMATIONS AND CUSTOM GLOBAL RULES ── */}
      <style>{`
        @keyframes marquee         { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes logoPulse       { 0%,100%{box-shadow:0 0 12px rgba(16,185,129,0.4)} 50%{box-shadow:0 0 28px rgba(16,185,129,0.8),0 0 50px rgba(99,102,241,0.2)} }
        @keyframes blobPulse       { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.1)} }
        @keyframes borderSpin      { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes slideIn         { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        
        /* Bento Responsive Classes */
        .bento-container {
          grid-template-rows: auto;
        }
        
        .radial-glow-indigo {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }
        
        .radial-glow-emerald {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }

        @media (max-width: 1024px) {
          .bento-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .bento-large-card {
            grid-column: span 2 !important;
          }
        }

        @media (max-width: 768px) {
          .bento-container {
            grid-template-columns: 1fr !important;
          }
          .bento-large-card, .bento-small-card {
            grid-column: span 1 !important;
          }
          .desktop-nav-group {
            display: none !important;
          }
          .mobile-menu-trigger {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   STATIC DATA
   ───────────────────────────────────────────────────────────────────────────── */
const EXAMS_MARQUEE = [
  'IAS/IPS','SSC CGL','IBPS PO','SBI Clerk','RRB NTPC','CTET',
  'BPSC','UPPSC','TNPSC','MPSC','NDA','GATE','NEET','JEE',
  'CLAT','AILET','AP LAWCET','TS LAWCET','CBSE Class 12'
]

const TESTIMONIALS = [
  { name: 'Ramesh Kumar', state: 'Bihar', exam: 'IAS Rank 23 — UPSC 2024', text: 'PrepBridge made full-length UPSC syllabi accessible in native Hindi. K² explanations helped me resolve core doubts without expensive coaching fees.', avatar: 'R', color: '#6366f1' },
  { name: 'Priya Nair', state: 'Kerala', exam: 'SSC CGL AIR 4 — 2024', text: 'The PeakPredict syllabus highlights were outstanding. Highly accurate topic predictions allowed me to distribute my study cycles extremely efficiently.', avatar: 'P', color: '#10b981' },
  { name: 'Suresh Patel', state: 'Gujarat', exam: 'RRB NTPC AIR 11 — 2024', text: 'I completed my mocks in Gujarati. The native translation engine feels absolute. Live timed sections prepared me perfectly.', avatar: 'S', color: '#10b981' },
]
