import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/useStore'
import { Zap, CheckCircle, ArrowRight } from 'lucide-react'
import HeroVideo from '../components/HeroVideo'
import StorySection from '../components/StorySection'

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '🏛️', title: 'All Central & State Exams', desc: 'UPSC, SSC, Banking, Railways, State PSC, Police, Teaching — 200+ exams covered with full syllabus, PYQs and mock tests.', color: '#7c3aed' },
  { icon: '🤖', title: 'AI Tutor', desc: 'Real-time AI answers your doubts instantly in your language — Hindi, Tamil, Telugu, Bengali and 19 more.', color: '#00d4ff' },
  { icon: '📱', title: 'Works on Any Phone', desc: 'Installable PWA. Works on 2G. Full offline access. No laptop needed — prepare from any ₹5,000 Android phone.', color: '#10b981' },
  { icon: '🌐', title: 'All 22 Indian Languages', desc: 'Every piece of content available in all 22 scheduled languages. No language barrier between you and your dream job.', color: '#f59e0b' },
  { icon: '📊', title: 'Real-Time Analytics', desc: 'AI detects your weak areas, predicts your All India Rank, and automatically adjusts your daily study plan.', color: '#0080ff' },
  { icon: '🔔', title: 'Instant Exam Alerts', desc: 'Push notifications the moment a new vacancy, admit card, result or syllabus change drops — for every exam you follow.', color: '#f43f5e' },
]

const EXAMS = [
  'IAS/IPS','SSC CGL','IBPS PO','SBI Clerk','RRB NTPC','CTET',
  'BPSC','UPPSC','TNPSC','MPSC','NDA','GATE','NEET','JEE',
  'RBI Grade B','LIC AAO','AFCAT','Coast Guard','UP Police','KVS',
  'WBPSC','GPSC','HPSC','KPSC','OPSC','RPSC','MPPSC','CDS',
]

const TESTIMONIALS = [
  { name: 'Ramesh Kumar', state: 'Bihar', exam: 'IAS Rank 23 — UPSC 2024', text: 'I\'m from a small village in Bihar. I couldn\'t afford coaching. PrepBridge AI explained everything in Hindi. Today I\'m an IAS officer.', avatar: 'R', color: '#7c3aed' },
  { name: 'Priya Nair', state: 'Kerala', exam: 'SSC CGL AIR 4 — 2024', text: 'The mock tests were exactly like the real exam. Current affairs auto-loaded every morning. Best ₹599 I ever spent.', avatar: 'P', color: '#00d4ff' },
  { name: 'Suresh Patel', state: 'Gujarat', exam: 'RRB NTPC AIR 11 — 2024', text: 'I studied in Gujarati. The app translated everything perfectly. Mock tests, PYQs, AI tutor — all in my language!', avatar: 'S', color: '#10b981' },
]


/* ─────────────────────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────────────────────── */
function useScrollReveal(threshold = 0.15) {
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

function useTypewriter(words, speed = 80, pause = 2000) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const word = words[wordIdx]
    const delay = deleting ? speed / 2 : speed
    const t = setTimeout(() => {
      if (!deleting) {
        setDisplay(word.slice(0, charIdx + 1))
        if (charIdx + 1 === word.length) setTimeout(() => setDeleting(true), pause)
        else setCharIdx(c => c + 1)
      } else {
        setDisplay(word.slice(0, charIdx - 1))
        if (charIdx === 0) { setDeleting(false); setWordIdx(i => (i + 1) % words.length) }
        else setCharIdx(c => c - 1)
      }
    }, delay)
    return () => clearTimeout(t)
  }, [charIdx, deleting, wordIdx, words, speed, pause])
  return display
}

function useMouseParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e) => setPos({ x: (e.clientX / window.innerWidth - 0.5) * 30, y: (e.clientY / window.innerHeight - 0.5) * 20 })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])
  return pos
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

/* ─────────────────────────────────────────────────────────────────────────────
   MINI-COMPONENTS
───────────────────────────────────────────────────────────────────────────── */
function RevealDiv({ children, style = {}, delay = 0, direction = 'up' }) {
  const [ref, visible] = useScrollReveal()
  const from = { up: 'translateY(40px)', left: 'translateX(-40px)', right: 'translateX(40px)', scale: 'scale(0.88)' }[direction] || 'translateY(40px)'
  return (
    <div ref={ref} style={{ transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`, opacity: visible ? 1 : 0, transform: visible ? 'none' : from, ...style }}>
      {children}
    </div>
  )
}

function TiltCard({ children, style = {} }) {
  const ref = useRef(null)
  const handleMove = (e) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 18
    const y = ((e.clientY - r.top) / r.height - 0.5) * -18
    el.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) translateY(-6px) scale(1.02)`
    el.style.boxShadow = `${-x}px ${y}px 30px rgba(124,58,237,0.25)`
  }
  const handleLeave = (e) => {
    const el = ref.current; if (!el) return
    el.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0px) scale(1)'
    el.style.boxShadow = 'none'
  }
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease', willChange: 'transform', ...style }}>
      {children}
    </div>
  )
}

function MagneticBtn({ children, to, style = {}, href }) {
  const ref = useRef(null)
  const handleMove = (e) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * 0.35
    const y = (e.clientY - r.top - r.height / 2) * 0.35
    el.style.transform = `translate(${x}px, ${y}px) scale(1.05)`
  }
  const handleLeave = () => { if (ref.current) ref.current.style.transform = 'translate(0,0) scale(1)' }
  const baseStyle = { transition: 'transform 0.25s ease, box-shadow 0.25s ease', display: 'inline-flex', alignItems: 'center', gap: 10, ...style }
  if (to) return <Link ref={ref} to={to} onMouseMove={handleMove} onMouseLeave={handleLeave} style={baseStyle}>{children}</Link>
  return <a ref={ref} href={href} onMouseMove={handleMove} onMouseLeave={handleLeave} style={baseStyle}>{children}</a>
}

function AnimCounter({ target, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0)
  const [ref, visible] = useScrollReveal(0.3)
  const started = useRef(false)
  useEffect(() => {
    if (!visible || started.current) return
    started.current = true
    const dur = 1800, start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setVal(Math.round(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [visible, target])
  return <span ref={ref}>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>
}


/* ─────────────────────────────────────────────────────────────────────────────
   MAIN LANDING
───────────────────────────────────────────────────────────────────────────── */
export default function Landing() {
  const { user, onboardingComplete } = useUserStore()
  const navigate = useNavigate()
  const scrollProgress = useScrollProgress()
  const mouse = useMouseParallax()
  const typed = useTypewriter(['IAS / IPS.', 'SSC CGL.', 'IBPS PO.', 'RRB NTPC.', 'NEET UG.', 'State PSC.'], 75, 1800)

  useEffect(() => {
    if (user && onboardingComplete) navigate('/app/dashboard')
    else if (user) navigate('/onboarding')
  }, [user])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Scroll Progress Bar ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: 3, width: `${scrollProgress}%`, background: 'linear-gradient(90deg,#7c3aed,#00d4ff,#10b981)', zIndex: 9999, transition: 'width 0.1s', boxShadow: '0 0 10px rgba(124,58,237,0.8)' }} />

      {/* ── Navbar ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,9,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(124,58,237,0.5)', animation: 'logoPulse 3s ease-in-out infinite' }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Prep<span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bridge</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="#how-it-works" style={{ color: 'var(--text-3)', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', padding: '6px 14px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>How it works</a>
          <Link to="/auth" style={{ color: 'var(--text-2)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}>Login</Link>
          <MagneticBtn to="/auth?signup=1" style={{ background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', color: 'white', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', padding: '9px 20px', borderRadius: 'var(--r-full)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            Start Free →
          </MagneticBtn>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ paddingTop: 64, position: 'relative' }}>
        {/* Parallax orbs driven by mouse */}
        <div style={{ position: 'absolute', top: '8%', left: '12%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(124,58,237,0.22),transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', transform: `translate(${mouse.x * 0.4}px, ${mouse.y * 0.4}px)`, transition: 'transform 0.1s', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '8%', width: 380, height: 380, background: 'radial-gradient(circle,rgba(0,212,255,0.18),transparent 70%)', borderRadius: '50%', filter: 'blur(70px)', transform: `translate(${mouse.x * -0.3}px, ${mouse.y * -0.3}px)`, transition: 'transform 0.1s', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: 280, height: 280, background: 'radial-gradient(circle,rgba(16,185,129,0.12),transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', transform: `translate(${mouse.x * 0.2}px, ${mouse.y * 0.2}px)`, transition: 'transform 0.1s', pointerEvents: 'none', zIndex: 0 }} />
        <HeroVideo />
      </div>

      {/* ── Marquee ticker — DUAL DIRECTION ── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '12px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 18, animation: 'marquee 22s linear infinite', whiteSpace: 'nowrap', marginBottom: 8 }}>
          {[...EXAMS, ...EXAMS].map((e, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-3)', padding: '5px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--r-full)', flexShrink: 0 }}>
              <CheckCircle size={11} color="var(--cyan)" /> {e}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 18, animation: 'marqueeReverse 28s linear infinite', whiteSpace: 'nowrap' }}>
          {[...EXAMS.slice(14), ...EXAMS.slice(0, 14), ...EXAMS.slice(14), ...EXAMS.slice(0, 14)].map((e, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', fontWeight: 600, color: 'rgba(148,163,184,0.4)', padding: '5px 14px', flexShrink: 0 }}>
              ◆ {e}
            </span>
          ))}
        </div>
      </div>

      {/* ── STORY SECTION — placed right after marquee ── */}
      <StorySection />



      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <RevealDiv style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--purple)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Features</div>
          <h2>Everything to <span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>crack any exam</span></h2>
        </RevealDiv>
        <div className="grid-3" style={{ gap: 20 }}>
          {FEATURES.map((f, i) => (
            <RevealDiv key={i} delay={i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
              <TiltCard style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, height: '100%', cursor: 'default', position: 'relative', overflow: 'hidden' }}>
                {/* Hover glow spot */}
                <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: `radial-gradient(circle,${f.color}22,transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ fontSize: '2.2rem', marginBottom: 16, display: 'inline-block', animation: `floatCard ${5 + i * 0.7}s ease-in-out ${i * 0.3}s infinite` }}>{f.icon}</div>
                <div style={{ width: 36, height: 3, borderRadius: 2, background: f.color, marginBottom: 14, animation: 'growBar 0.6s ease forwards' }} />
                <h3 style={{ marginBottom: 10, fontSize: '1rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </TiltCard>
            </RevealDiv>
          ))}
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{ padding: '60px 24px', background: 'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(0,212,255,0.05))', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32, textAlign: 'center' }}>
          {[
            { val: 500000, suffix: '+', label: 'Questions', color: '#00d4ff', prefix: '' },
            { val: 200, suffix: '+', label: 'Exams Covered', color: '#7c3aed', prefix: '' },
            { val: 245832, suffix: '+', label: 'Students Enrolled', color: '#10b981', prefix: '' },
            { val: 599, suffix: '/yr', label: 'All Access Plan', color: '#f59e0b', prefix: '₹' },
          ].map((s, i) => (
            <RevealDiv key={i} delay={i * 0.1} direction="scale">
              <div style={{ padding: '20px 0' }}>
                <div style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 8 }}>
                  <AnimCounter target={s.val} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            </RevealDiv>
          ))}
        </div>
      </section>


      {/* ── TYPEWRITER BANNER ── */}
      <section style={{ padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 50% 50%,rgba(124,58,237,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <RevealDiv>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Preparing for</div>
          <div style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', minHeight: '1.3em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ color: 'var(--text-1)' }}>We help you crack</span>
            <span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', minWidth: 280, textAlign: 'left' }}>
              {typed}<span style={{ animation: 'blink 1s step-end infinite', color: '#7c3aed', WebkitTextFillColor: '#7c3aed' }}>|</span>
            </span>
          </div>
        </RevealDiv>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: 500, height: 500, background: 'var(--cyan)', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.05 }} />
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <RevealDiv style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Success Stories</div>
            <h2>Real students. <span style={{ background: 'linear-gradient(90deg,#f59e0b,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real results.</span></h2>
          </RevealDiv>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <RevealDiv key={i} delay={i * 0.15}>
                <TiltCard style={{ padding: '28px', background: 'rgba(255,255,255,0.025)', border: `1px solid ${t.color}22`, borderRadius: 20, height: '100%', position: 'relative', cursor: 'default' }}>
                  <div style={{ position: 'absolute', top: -1, left: -1, right: -1, height: 3, background: `linear-gradient(90deg,${t.color},transparent)`, borderRadius: '20px 20px 0 0' }} />
                  <div style={{ fontSize: '2.5rem', color: `${t.color}44`, fontFamily: 'serif', lineHeight: 1, marginBottom: 10 }}>"</div>
                  <p style={{ fontSize: '0.92rem', lineHeight: 1.75, color: 'var(--text-2)', marginBottom: 20 }}>{t.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${t.color},${t.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: 'white', flexShrink: 0, animation: 'logoPulse 3s ease-in-out infinite' }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{t.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>{t.exam}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>📍 {t.state}</div>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 2 }}>
                    {[...Array(5)].map((_, j) => <span key={j} style={{ color: '#f59e0b', fontSize: '0.75rem', animation: `starPop 0.4s ease ${j * 0.08}s both` }}>★</span>)}
                  </div>
                </TiltCard>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: '100px 24px', background: 'var(--bg)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse,rgba(124,58,237,0.1),transparent 70%)', pointerEvents: 'none', animation: 'blobPulse 8s ease-in-out infinite' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <RevealDiv>
            <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simple Pricing</div>
            <h2 style={{ marginBottom: 8 }}>One plan. <span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>All exams. Forever.</span></h2>
            <p style={{ marginBottom: 48, color: 'var(--text-3)' }}>No subject locks. No hidden fees. No exam limits.</p>
          </RevealDiv>
          <RevealDiv delay={0.2} direction="scale">
            {/* Animated border pricing card */}
            <div style={{ display: 'inline-block', padding: 2, borderRadius: 30, background: 'linear-gradient(135deg,#7c3aed,#00d4ff,#10b981,#7c3aed)', backgroundSize: '300% 300%', animation: 'borderSpin 4s linear infinite', boxShadow: '0 0 80px rgba(124,58,237,0.3)' }}>
              <div style={{ maxWidth: 440, background: '#0d0a1a', borderRadius: 28, padding: 44, textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-4)', marginBottom: 14 }}>All Access Plan</div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-3)' }}>₹</span>
                  <span style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>599</span>
                  <span style={{ color: 'var(--text-3)' }}>/year</span>
                </div>
                <p style={{ marginBottom: 28, fontSize: '0.85rem', color: 'var(--text-3)' }}>That's just <strong style={{ color: '#10b981' }}>₹1.64/day</strong> — less than a chai ☕</p>
                {['All 200+ exams & question papers', '5 Lakh+ questions unlimited', 'Unlimited mock tests + All India Rank', 'AI Tutor in your language', 'Live current affairs every morning', 'Push notifications for every exam', 'All 22 Indian languages', 'Offline access on any Android phone'].map((f, i) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, textAlign: 'left', animation: `slideInRight 0.4s ease ${i * 0.06}s both` }}>
                    <CheckCircle size={15} color="#10b981" />
                    <span style={{ fontSize: '0.87rem', color: 'var(--text-2)' }}>{f}</span>
                  </div>
                ))}
                <MagneticBtn to="/auth?signup=1" style={{ display: 'flex', justifyContent: 'center', marginTop: 28, padding: '16px 28px', background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', borderRadius: 'var(--r-full)', fontWeight: 800, fontSize: '1rem', color: 'white', textDecoration: 'none', boxShadow: '0 0 30px rgba(124,58,237,0.5)', width: '100%' }}>
                  Get All Access — ₹599/yr <ArrowRight size={18} />
                </MagneticBtn>
                <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--text-4)' }}>7-day free trial · Cancel anytime · Scholarship for BPL families</div>
              </div>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '44px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <RevealDiv>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="white" />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              Prep<span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bridge</span>
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-4)', marginBottom: 8 }}>One platform for every Indian exam aspirant. 200+ exams. 22 languages. ₹599/year.</p>
          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.4)', letterSpacing: '0.04em' }}>Powered by</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 12px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.02em' }}>K<sup style={{ fontSize: '0.55rem', verticalAlign: 'super' }}>2</sup></span>
              <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.12)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>ADEXOS GLOBAL TECHNOLOGIES</span>
            </span>
          </div>
        </RevealDiv>
      </footer>

      {/* ── ALL KEYFRAMES ── */}
      <style>{`
        @keyframes marquee         { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes marqueeReverse  { from{transform:translateX(-50%)} to{transform:translateX(0)} }
        @keyframes ringPulse       { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.28);opacity:0.08} }
        @keyframes playGlow        { 0%,100%{box-shadow:0 0 50px rgba(124,58,237,0.8)} 50%{box-shadow:0 0 100px rgba(124,58,237,1),0 0 150px rgba(0,212,255,0.5)} }
        @keyframes floatCard       { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes gridMove        { 0%{background-position:0 0} 100%{background-position:44px 44px} }
        @keyframes blink           { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes logoPulse       { 0%,100%{box-shadow:0 0 12px rgba(124,58,237,0.5)} 50%{box-shadow:0 0 28px rgba(124,58,237,0.9),0 0 50px rgba(0,212,255,0.3)} }
        @keyframes blobPulse       { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.15)} }
        @keyframes slideIn         { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInRight    { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes growBar         { from{width:0} to{width:36px} }
        @keyframes starPop         { from{opacity:0;transform:scale(0) rotate(-30deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
        @keyframes borderSpin      { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      `}</style>
    </div>
  )
}
