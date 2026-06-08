import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, TrendingUp, Landmark, ShieldAlert, Award, ArrowRight } from 'lucide-react'

const MILESTONES = [
  {
    phase: 'Phase 1: The Barrier',
    label: 'ECONOMIC BARRIER',
    title: 'A Raju Kumar Story: The Struggle',
    sub: 'Small village in Bihar. Household income ₹800/mo. Big IAS aspirations.',
    body: 'Traditional IAS coaching in Delhi costs upwards of ₹2,50,000. For Raju, this meant studying under a kerosene lamp with outdated textbooks, lacking syllabus guidance or access to real test series.',
    quote: '"Coaching fees were more than what my family earned in 20 years. I had the fire, but no path."',
    color: '#ef4444',
    metrics: [
      { label: 'Delhi Coaching Cost', val: '₹2,50,000', labelColor: '#ef4444' },
      { label: 'Raju\'s Budget', val: '₹800/mo', labelColor: '#94a3b8' },
      { label: 'Study Tools', val: 'Kerosene Lamp', labelColor: '#94a3b8' }
    ],
    visualization: 'coaching_barrier'
  },
  {
    phase: 'Phase 2: The Acceleration',
    label: 'SYLLABUS DEMOCRACY',
    title: 'PrepBridge AI Tutor & Hindi Medium',
    sub: 'Accessing 5 Lakh+ questions & native K² tutor at ₹249/mo.',
    body: 'Raju onboarded onto PrepBridge. With the AI tutor translating complex historical and legal syllabus articles into Hindi instantly, he practiced daily timed mocks and got detailed diagnostic feedback on slow networks.',
    quote: '"For the first time, a Hindi medium aspirant from a village had the exact same resources as a Delhi topper."',
    color: '#6366f1',
    metrics: [
      { label: 'Platform Price', val: '₹249/mo', labelColor: '#10b981' },
      { label: 'Mock Attempts', val: '1,420 Mocks', labelColor: '#6366f1' },
      { label: 'AI Doubt Resolution', val: 'Instant (Hindi)', labelColor: '#6366f1' }
    ],
    visualization: 'ai_acceleration'
  },
  {
    phase: 'Phase 3: The Result',
    label: 'NATIONAL PRESTIGE',
    title: 'UPSC Civil Services Rank 23',
    sub: 'Documented national success. From kerosene lamp to service.',
    body: 'Raju Kumar secured All India Rank 23 in the UPSC CSE 2024. Today he serves the nation as an IAS Officer, demonstrating that quality guidance is a right, not a luxury.',
    quote: '"PrepBridge democratized the exam. It was the bridge between a farmers son and the civil services."',
    color: '#10b981',
    metrics: [
      { label: 'Final UPSC Rank', val: 'AIR 23', labelColor: '#10b981' },
      { label: 'Percentile Score', val: '99.87%', labelColor: '#10b981' },
      { label: 'Current Role', val: 'IAS Officer', labelColor: '#10b981' }
    ],
    visualization: 'rank_result'
  }
]

export default function StorySection() {
  const { t } = useTranslation()
  const [active, setActive] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const timerRef = useRef(null)

  const goTo = useCallback((idx) => {
    setActive(idx)
  }, [])

  useEffect(() => {
    if (!autoPlay) return
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % MILESTONES.length)
    }, 6000)
    return () => clearInterval(timerRef.current)
  }, [autoPlay])

  const current = MILESTONES[active]

  return (
    <section style={{
      padding: '100px 24px',
      background: 'linear-gradient(180deg, #030408 0%, #07080f 100%)',
      borderTop: '1px solid rgba(255,255,255,0.03)',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Mesh */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 50% 55%, ${current.color}08 0%, transparent 60%)`,
        transition: 'all 0.8s ease',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: 99,
            padding: '6px 16px',
            marginBottom: 16
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              animation: 'storyBlink 2s infinite'
            }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('landing.story.badge', 'Verified Success Case Study')}
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
            Democratizing <span style={{ background: 'linear-gradient(90deg,#10b981,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Exam Preparation</span>
          </h2>
          <p style={{ color: 'var(--text-2)', marginTop: 8, fontSize: '0.92rem', maxWidth: 600, margin: '8px auto 0' }}>
            A farmers son, a ₹6,000 phone, and an AI tutor. Raju Kumar\'s documented path to the civil services.
          </p>
        </div>

        {/* Interactive Case Study Dashboard Wrapper */}
        <div style={{
          background: 'rgba(7, 9, 14, 0.6)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 28,
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          backdropFilter: 'blur(20px)',
          minHeight: 520
        }} className="case-study-grid">

          {/* Left Milestone Navigation Drawer */}
          <div style={{
            borderRight: '1px solid rgba(255,255,255,0.04)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: 'rgba(255,255,255,0.005)'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              Study Timeline Nodes
            </span>
            {MILESTONES.map((m, idx) => {
              const isActive = active === idx
              return (
                <button
                  key={idx}
                  onClick={() => { setAutoPlay(false); goTo(idx) }}
                  style={{
                    textAlign: 'left',
                    padding: '16px 18px',
                    borderRadius: 16,
                    border: '1px solid',
                    borderColor: isActive ? `${m.color}33` : 'transparent',
                    background: isActive ? `${m.color}0a` : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                  onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.01)' }}
                  onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: isActive ? m.color : 'var(--text-3)',
                    letterSpacing: '0.04em'
                  }}>
                    {m.phase.toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: isActive ? 'white' : 'var(--text-2)'
                  }}>
                    {m.label}
                  </span>
                </button>
              )
            })}

            <div style={{ marginTop: 'auto', paddingTop: 20 }}>
              <button
                onClick={() => setAutoPlay(p => !p)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-3)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 0
                }}
              >
                <span style={{
                  width: 24,
                  height: 12,
                  borderRadius: 6,
                  background: autoPlay ? current.color : 'rgba(255,255,255,0.1)',
                  position: 'relative',
                  display: 'inline-block',
                  transition: 'background 0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    top: 2,
                    left: autoPlay ? 14 : 2,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'left 0.3s'
                  }} />
                </span>
                Simulation Auto-Play {autoPlay ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Right Metrics & Visualization Panel */}
          <div style={{
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 32
          }}>
            
            {/* Upper Content */}
            <div style={{ animation: 'caseStudySlide 0.4s ease forwards' }} key={active}>
              <div style={{
                display: 'inline-block',
                background: `${current.color}14`,
                border: `1px solid ${current.color}33`,
                color: current.color,
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                marginBottom: 12
              }}>
                {current.label}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                {current.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', fontWeight: 600, margin: '0 0 16px' }}>
                {current.sub}
              </p>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 24px' }}>
                {current.body}
              </p>

              {/* Verified Quote Block */}
              <div style={{
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.03)',
                borderLeft: `3px solid ${current.color}`,
                borderRadius: '0 14px 14px 0',
                padding: '16px 20px',
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.95)',
                fontSize: '0.88rem',
                lineHeight: 1.6
              }}>
                {current.quote}
              </div>
            </div>

            {/* Lower Metrics Grid & Telemetry */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {current.metrics.map((m, mIdx) => (
                <div
                  key={mIdx}
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: 16,
                    padding: '14px 16px'
                  }}
                >
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                    {m.label}
                  </span>
                  <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 900, color: m.labelColor }}>
                    {m.val}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Trust Statement */}
        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: '0 0 16px', fontWeight: 600 }}>
            PrepBridge levels the playing field. Leveling access to exam content is the future.
          </p>
          <a
            href="/auth?signup=1"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--r-full)',
              padding: '12px 28px',
              fontSize: '0.88rem',
              fontWeight: 800,
              color: '#10b981',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Start Preparing Free <ArrowRight size={15} />
          </a>
        </div>

      </div>

      <style>{`
        @keyframes storyBlink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes caseStudySlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 768px) {
          .case-study-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
