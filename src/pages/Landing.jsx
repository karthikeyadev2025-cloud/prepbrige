import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/useStore'
import { Zap, CheckCircle, ArrowRight, Play, X } from 'lucide-react'
import HeroVideo from '../components/HeroVideo'

const FEATURES = [
  { icon: '🏛️', title: 'All Central & State Exams', desc: 'UPSC, SSC, Banking, Railways, State PSC, Police, Teaching — 200+ exams covered with full syllabus, PYQs and mock tests.' },
  { icon: '🤖', title: 'Gemini AI Tutor', desc: 'Real Google Gemini AI answers your doubts instantly in your language — Hindi, Tamil, Telugu, Bengali and 19 more.' },
  { icon: '📱', title: 'Works on Any Phone', desc: 'Installable PWA. Works on 2G. Full offline access. No laptop needed — prepare from any ₹5,000 Android phone.' },
  { icon: '🌐', title: 'All 22 Indian Languages', desc: 'Every piece of content available in all 22 scheduled languages. No language barrier between you and your dream job.' },
  { icon: '📊', title: 'Real-Time Analytics', desc: 'AI detects your weak areas, predicts your All India Rank, and automatically adjusts your daily study plan.' },
  { icon: '🔔', title: 'Instant Exam Alerts', desc: 'Push notifications the moment a new vacancy, admit card, result or syllabus change drops — for every exam you follow.' },
]

const EXAMS = [
  'IAS/IPS','SSC CGL','IBPS PO','SBI Clerk','RRB NTPC','CTET',
  'BPSC','UPPSC','TNPSC','MPSC','NDA','GATE','NEET','JEE',
  'RBI Grade B','LIC AAO','AFCAT','Coast Guard','UP Police','KVS',
  'WBPSC','GPSC','HPSC','KPSC','OPSC','RPSC','MPPSC','MPSC'
]

const HOW_IT_WORKS = [
  { step: '01', icon: '📋', title: 'Register Once', desc: 'One simple signup — phone OTP or Google. Takes 30 seconds. No documents, no fees upfront.' },
  { step: '02', icon: '🎯', title: 'Pick Your Exams', desc: 'Select any exams you\'re targeting — UPSC, SSC, banking, state PSC or all of them. AI customizes everything.' },
  { step: '03', icon: '🤖', title: 'AI Builds Your Plan', desc: 'Gemini AI creates a personalized daily study plan based on your target exam, available time, and weak subjects.' },
  { step: '04', icon: '🚀', title: 'Prepare & Succeed', desc: 'Study with AI tutor, take unlimited mock tests, track your All India Rank, get exam alerts. Crack your exam.' },
]

const TESTIMONIALS = [
  { name: 'Ramesh Kumar', state: 'Bihar', exam: 'IAS Rank 23 — UPSC 2024', text: 'I\'m from a small village in Bihar. I couldn\'t afford coaching. PrepBridge AI explained everything in Hindi. Today I\'m an IAS officer.', avatar: 'R' },
  { name: 'Priya Nair', state: 'Kerala', exam: 'SSC CGL AIR 4 — 2024', text: 'The AI mock tests were exactly like the real exam. Current affairs auto-loaded every morning. Best ₹599 I ever spent.', avatar: 'P' },
  { name: 'Suresh Patel', state: 'Gujarat', exam: 'RRB NTPC AIR 11 — 2024', text: 'I studied in Gujarati. The app translated everything perfectly. Mock tests, PYQs, AI tutor — all in my language!', avatar: 'S' },
]

// ─── Cinematic "How It Works" video section ────────────────────────────────
function DemoPlayer() {
  const [playing, setPlaying] = useState(false)
  const [slide, setSlide] = useState(0)
  const slideRef = useRef(null)

  const SLIDES = [
    { label: 'Dashboard', icon: '📊', title: 'Your AI Study Dashboard', desc: 'Gemini AI builds your daily study plan based on target exam & weak areas', color: '#7c3aed', stats: ['🔥7 Day Streak','🎯 73.4% Accuracy','📋 24 Tests Done'] },
    { label: 'Mock Test', icon: '📝', title: 'Full-Length Mock Tests', desc: 'Real exam environment with timer, negative marking & All India Rank', color: '#0080ff', stats: ['⏱️ 120 min','❓ 100 Questions','🏆 AIR 423'] },
    { label: 'AI Tutor', icon: '🤖', title: 'Gemini AI Answers Doubts', desc: 'Ask anything in Hindi, Tamil, Telugu, Bengali — real AI, not chatbot', color: '#10b981', stats: ['🌐 22 Languages','⚡ Instant Answers','📖 Any Topic'] },
    { label: 'Current Affairs', icon: '📰', title: 'Daily Current Affairs', desc: 'Auto-loads every morning. Exam-ready news for UPSC, SSC, Banking & more', color: '#f59e0b', stats: ['🔴 Live Updates','📅 Daily Digest','🎯 Exam-Focused'] },
  ]

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 3000)
    return () => clearInterval(t)
  }, [playing])

  return (
    <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto 72px', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 0 60px rgba(124,58,237,0.2), 0 0 120px rgba(0,212,255,0.08)' }}>
      <div style={{ background: 'linear-gradient(135deg,#0d0a1a 0%,#080d14 100%)', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Animated grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(124,58,237,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.07) 1px,transparent 1px)', backgroundSize: '40px 40px', animation: 'gridMove 8s linear infinite' }} />
        {/* Glows */}
        <div style={{ position: 'absolute', top: '15%', left: '15%', width: 300, height: 300, background: `radial-gradient(circle,${playing ? SLIDES[slide].color : '#7c3aed'}44,transparent 70%)`, borderRadius: '50%', filter: 'blur(40px)', transition: 'background 0.8s' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 200, height: 200, background: 'radial-gradient(circle,rgba(0,212,255,0.2),transparent 70%)', borderRadius: '50%', filter: 'blur(30px)' }} />

        {/* Floating cards (always visible) */}
        <div style={{ position: 'absolute', top: '8%', left: '3%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', fontSize: '0.72rem', color: 'white', animation: 'floatCard 5s ease-in-out infinite', zIndex: 3 }}>🎯 AI Study Plan Ready</div>
        <div style={{ position: 'absolute', bottom: '14%', right: '3%', background: 'rgba(16,185,129,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '10px 14px', fontSize: '0.72rem', color: '#10b981', animation: 'floatCard 6s ease-in-out 1s infinite', zIndex: 3 }}>🎉 IAS Rank 23 — 2024</div>
        <div style={{ position: 'absolute', top: '58%', left: '2%', background: 'rgba(0,212,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 12, padding: '10px 14px', fontSize: '0.72rem', color: '#00d4ff', animation: 'floatCard 7s ease-in-out 2s infinite', zIndex: 3 }}>📊 Score 89.4% · Rank ↑12</div>

        {/* Center: Play state or Demo Slides */}
        {!playing ? (
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {/* Outer ring pulse */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -14, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.35)', animation: 'ringPulse 2s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', inset: -28, borderRadius: '50%', border: '1px solid rgba(124,58,237,0.15)', animation: 'ringPulse 2s ease-in-out 0.4s infinite' }} />
              <button
                onClick={() => setPlaying(true)}
                style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 50px rgba(124,58,237,0.7)', transition: 'transform 0.2s,box-shadow 0.2s', animation: 'playPulse 2.5s ease-in-out infinite' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 0 80px rgba(124,58,237,0.9)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(124,58,237,0.7)' }}
              >
                <Play size={30} color="white" fill="white" style={{ marginLeft: 5 }} />
              </button>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', letterSpacing: '0.05em' }}>▶ See PrepBridge in action</div>
          </div>
        ) : (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', padding: '20px 28px', transition: 'all 0.5s' }}>
            {/* Demo nav tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {SLIDES.map((s, i) => (
                <button key={i} onClick={() => setSlide(i)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${i === slide ? s.color : 'rgba(255,255,255,0.1)'}`, background: i === slide ? `${s.color}22` : 'rgba(255,255,255,0.04)', color: i === slide ? s.color : 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' }}>
                  {s.icon} {s.label}
                </button>
              ))}
              <button onClick={() => setPlaying(false)} style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', cursor: 'pointer' }}>✕ Close</button>
            </div>
            {/* Slide content */}
            <div style={{ flex: 1, display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>{SLIDES[slide].icon}</div>
                <h3 style={{ marginBottom: 8, color: SLIDES[slide].color, fontSize: '1.1rem' }}>{SLIDES[slide].title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 16 }}>{SLIDES[slide].desc}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {SLIDES[slide].stats.map(st => (
                    <span key={st} style={{ fontSize: '0.75rem', background: `${SLIDES[slide].color}18`, border: `1px solid ${SLIDES[slide].color}44`, color: SLIDES[slide].color, borderRadius: 8, padding: '5px 10px', fontWeight: 700 }}>{st}</span>
                  ))}
                </div>
              </div>
              {/* Mock screen */}
              <div style={{ width: 200, height: 130, background: 'rgba(255,255,255,0.04)', border: `1px solid ${SLIDES[slide].color}44`, borderRadius: 12, padding: 12, flexShrink: 0 }}>
                <div style={{ height: 8, background: `${SLIDES[slide].color}66`, borderRadius: 4, marginBottom: 8, width: '70%' }} />
                <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 5 }} />
                <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 4, marginBottom: 5, width: '80%' }} />
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  {[60,80,45,90,70].map((h,i) => <div key={i} style={{ flex:1, height: h/5, background: `${SLIDES[slide].color}${40+i*10}`, borderRadius: 3, alignSelf: 'flex-end' }} />)}
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((slide + 1) / SLIDES.length) * 100}%`, background: `linear-gradient(90deg,#7c3aed,${SLIDES[slide].color})`, borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ padding: '100px 24px', background: 'var(--bg-2)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '-5%', width: 400, height: 400, background: 'var(--purple)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.08 }} />
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            How It Works
          </div>
          <h2 style={{ marginBottom: 12 }}>From Registration to <span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Selection — In 4 Steps</span></h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-3)', maxWidth: 520, margin: '0 auto' }}>No confusion. No complicated setup. Start preparing within 2 minutes of signing up.</p>
        </div>

        {/* In-app animated demo player */}
        <DemoPlayer />

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24 }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} style={{ position: 'relative', padding: '28px 24px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, backdropFilter: 'blur(10px)', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 900, color: 'rgba(124,58,237,0.5)', letterSpacing: '0.1em', marginBottom: 12 }}>{step.step}</div>
              <div style={{ fontSize: '2rem', marginBottom: 14 }}>{step.icon}</div>
              <h4 style={{ marginBottom: 8, fontSize: '1rem' }}>{step.title}</h4>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-3)', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              {i < HOW_IT_WORKS.length - 1 && (
                <div style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(124,58,237,0.4)', fontSize: '1.2rem', fontWeight: 900, display: 'none' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes gridMove { from{backgroundPosition:0 0} to{backgroundPosition:40px 40px} }
        @keyframes playPulse { 0%,100%{box-shadow:0 0 40px rgba(124,58,237,0.6)} 50%{box-shadow:0 0 70px rgba(124,58,237,0.9),0 0 100px rgba(0,212,255,0.3)} }
        @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: 500, height: 500, background: 'var(--cyan)', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.06 }} />
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Success Stories
          </div>
          <h2>Real students. <span style={{ background: 'linear-gradient(90deg,#f59e0b,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real results.</span></h2>
          <p style={{ color: 'var(--text-3)', maxWidth: 500, margin: '12px auto 0', fontSize: '0.95rem' }}>These aspirants had no coaching. No expensive books. Just PrepBridge.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ padding: '28px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, transition: 'all 0.3s', position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: '2rem', color: 'rgba(245,158,11,0.3)', fontFamily: 'serif', lineHeight: 1, marginBottom: 12 }}>"</div>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.75, color: 'var(--text-2)', marginBottom: 20 }}>{t.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: 'white', flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>{t.exam}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>📍 {t.state}</div>
                </div>
              </div>
              <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, j) => <span key={j} style={{ color: '#f59e0b', fontSize: '0.75rem' }}>★</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function Landing() {
  const { user, onboardingComplete } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && onboardingComplete) navigate('/app/dashboard')
    else if (user) navigate('/onboarding')
  }, [user])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Navbar — floating glass */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,9,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(124,58,237,0.5)' }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Prep<span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bridge</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="#how-it-works" style={{ color: 'var(--text-3)', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', padding: '6px 14px' }}>How it works</a>
          <Link to="/auth" style={{ color: 'var(--text-2)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >Login</Link>
          <Link to="/auth?signup=1" style={{ background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', color: 'white', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', padding: '9px 20px', borderRadius: 'var(--r-full)', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(124,58,237,0.6)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.35)'}
          >Start Free →</Link>
        </div>
      </nav>

      {/* ★ HERO VIDEO SECTION */}
      <div style={{ paddingTop: 64 }}>
        <HeroVideo />
      </div>

      {/* Exam ticker */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '14px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 20, animation: 'marquee 25s linear infinite', whiteSpace: 'nowrap' }}>
          {[...EXAMS, ...EXAMS].map((e, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-3)', padding: '6px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--r-full)', flexShrink: 0 }}>
              <CheckCircle size={11} color="var(--cyan)" /> {e}
            </span>
          ))}
        </div>
      </div>

      {/* How it works + video */}
      <HowItWorksSection />

      {/* Features */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--purple)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Platform Features
          </div>
          <h2>Everything to <span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>crack any exam</span></h2>
        </div>
        <div className="grid-3" style={{ gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, transition: 'all 0.3s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.07)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'; e.currentTarget.style.transform = 'translateY(-5px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ marginBottom: 10, fontSize: '1rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-2)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse,rgba(124,58,237,0.12),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-full)', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simple Pricing</div>
          <h2 style={{ marginBottom: 8 }}>One plan. <span style={{ background: 'linear-gradient(90deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>All exams. Forever.</span></h2>
          <p style={{ marginBottom: 48, color: 'var(--text-3)' }}>No subject locks. No hidden fees. No exam limits.</p>
          <div style={{ maxWidth: 440, margin: '0 auto', background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(0,212,255,0.08))', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 28, padding: 44, boxShadow: '0 0 60px rgba(124,58,237,0.2)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-4)', marginBottom: 14 }}>All Access Plan</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-3)' }}>₹</span>
              <span style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>599</span>
              <span style={{ color: 'var(--text-3)' }}>/year</span>
            </div>
            <p style={{ marginBottom: 28, fontSize: '0.85rem', color: 'var(--text-3)' }}>That's just <strong style={{ color: '#10b981' }}>₹1.64/day</strong> — less than a chai ☕</p>
            {['All 200+ exams & question papers', '5 Lakh+ questions unlimited', 'Unlimited mock tests + All India Rank', 'AI Tutor in your language', 'Live current affairs every morning', 'Push notifications for every exam', 'All 22 Indian languages', 'Offline access on any Android phone'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, textAlign: 'left' }}>
                <CheckCircle size={15} color="#10b981" />
                <span style={{ fontSize: '0.87rem', color: 'var(--text-2)' }}>{f}</span>
              </div>
            ))}
            <Link to="/auth?signup=1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28, padding: '16px 28px', background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', borderRadius: 'var(--r-full)', fontWeight: 800, fontSize: '1rem', color: 'white', textDecoration: 'none', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
              Get All Access — ₹599/yr <ArrowRight size={18} />
            </Link>
            <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--text-4)' }}>7-day free trial · Cancel anytime · Scholarship for BPL families</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '44px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
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
            <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.12)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>ADEXOS GLOBAL TECHNOLOGIES</span>
          </span>
        </div>
      </footer>

      <style>{`
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.2);opacity:0.15} }
        @keyframes playPulse { 0%,100%{box-shadow:0 0 50px rgba(124,58,237,0.7)} 50%{box-shadow:0 0 90px rgba(124,58,237,1),0 0 130px rgba(0,212,255,0.4)} }
        @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes gridMove { from{backgroundPosition:0 0} to{backgroundPosition:40px 40px} }
      `}</style>
    </div>
  )
}
