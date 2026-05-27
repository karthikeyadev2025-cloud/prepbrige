import { useState, useEffect, useRef, useCallback } from 'react'

const STORY = [
  {
    id: 1,
    img: '/story1.png',
    chapter: 'Chapter 1',
    headline: 'The Struggle Was Real',
    sub: 'Raju, from a small village in Bihar. ₹800/month income. Big IAS dream.',
    body: 'No coaching money. No internet. Just old textbooks and a kerosene lamp. Every night he studied till 2 AM — not knowing where to start, what to study, how to prepare.',
    quote: '"Mujhe pata hi nahi tha exam ka syllabus kahan se padhu…"',
    emotion: '😔',
    bg: 'linear-gradient(135deg,#1a0a00,#0f0800)',
    accent: '#f59e0b',
    particles: ['📚','🕯️','📝','✏️','🌙'],
  },
  {
    id: 2,
    img: '/story2.png',
    chapter: 'Chapter 2',
    headline: 'One Phone. One App. Everything Changed.',
    sub: 'His cousin showed him PrepBridge. 2-day free trial. Then only ₹249/month.',
    body: 'AI tutor in Hindi. Full UPSC syllabus. Mock tests. Previous year papers. Live current affairs every morning. Daily study plan built just for him — all on a ₹6,000 phone.',
    quote: '"Pehli baar laga ki main bhi crack kar sakta hoon."',
    emotion: '🤩',
    bg: 'linear-gradient(135deg,#0d0a1a,#080d14)',
    accent: '#7c3aed',
    particles: ['⚡','🤖','📱','✨','🌟'],
  },
  {
    id: 3,
    img: '/story3.png',
    chapter: 'Chapter 3',
    headline: 'IAS. AIR 23. Village to Nation.',
    sub: 'One year later. UPSC 2024 result.',
    body: 'Raju Kumar. IAS Officer. All India Rank 23. His mother cried. His village celebrated. From a kerosene lamp to serving the nation — PrepBridge was the bridge between his dream and reality.',
    quote: '"PrepBridge ne meri zindagi badal di."',
    emotion: '🎉',
    bg: 'linear-gradient(135deg,#030f0a,#040d07)',
    accent: '#10b981',
    particles: ['🏆','🎊','⭐','🌟','🎉'],
  },
]

// ── Preload all images the moment JS loads — before component even mounts ──
STORY.forEach(s => { const i = new window.Image(); i.src = s.img })

export default function StorySection() {
  const [active, setActive]     = useState(0)
  const [prev, setPrev]         = useState(null)       // for crossfade
  const [transitioning, setTransitioning] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const [visible, setVisible]   = useState(false)
  const sectionRef = useRef(null)
  const timerRef   = useRef(null)
  const activeRef  = useRef(0)                         // always up-to-date in timer

  // ── Intersection observer for scroll-reveal ──
  useEffect(() => {
    const el = sectionRef.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // ── Smooth slide transition ──
  const goTo = useCallback((nextIdx) => {
    if (transitioning || nextIdx === activeRef.current) return
    setPrev(activeRef.current)
    setTransitioning(true)
    activeRef.current = nextIdx
    // Short delay so "prev" fades out then new slides in
    setTimeout(() => {
      setActive(nextIdx)
      setTimeout(() => { setPrev(null); setTransitioning(false) }, 500)
    }, 60)
  }, [transitioning])

  // ── Auto-play ──
  useEffect(() => {
    if (!autoPlay || !visible) return
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const next = (activeRef.current + 1) % STORY.length
      goTo(next)
    }, 5000)
    return () => clearInterval(timerRef.current)
  }, [autoPlay, visible, goTo])

  const story = STORY[active]

  const particles = story.particles.map((e, i) => ({
    emoji: e, delay: i * 1.1, duration: 3.5 + i * 0.7, x: 8 + i * 18,
  }))

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '100px 24px', position: 'relative', overflow: 'hidden',
        background: story.bg,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(50px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease, background 0.7s ease',
      }}
    >
      {/* Bg glow */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(ellipse at 30% 50%, ${story.accent}16 0%, transparent 60%)`, transition: 'all 0.7s ease', pointerEvents: 'none' }} />

      {/* Floating emoji particles — keyed to active so they re-trigger on change */}
      {particles.map((p, i) => (
        <div key={`${active}-${i}`} style={{ position: 'absolute', left: `${p.x}%`, bottom: '-10%', fontSize: '1.4rem', animation: `particleRise ${p.duration}s ease-in ${p.delay}s infinite`, opacity: 0, pointerEvents: 'none', zIndex: 1 }}>
          {p.emoji}
        </div>
      ))}

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `${story.accent}18`, border: `1px solid ${story.accent}44`, borderRadius: 999, padding: '8px 22px', marginBottom: 16, transition: 'all 0.5s ease' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: story.accent, boxShadow: `0 0 8px ${story.accent}`, display: 'inline-block', animation: 'liveDot 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: story.accent, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.5s' }}>An Inspiring True Story</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.6rem,3.5vw,2.4rem)' }}>
            From <span style={{ background: 'linear-gradient(90deg,#f59e0b,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Struggle</span> to{' '}
            <span style={{ background: 'linear-gradient(90deg,#7c3aed,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IAS Officer</span>
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.7)', marginTop: 8, fontSize: '0.95rem' }}>A 2-day free trial that changed a family's destiny — then just ₹249/month</p>
        </div>

        {/* Story card */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
          border: `1px solid ${story.accent}33`, borderRadius: 28, overflow: 'hidden',
          boxShadow: `0 0 60px ${story.accent}22, 0 0 100px rgba(0,0,0,0.6)`,
          transition: 'border-color 0.6s, box-shadow 0.6s',
          minHeight: 480, background: 'rgba(255,255,255,0.02)',
        }}>

          {/* ── LEFT: All 3 images always in DOM, CSS crossfade ── */}
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 400, background: '#080909' }}>

            {STORY.map((s, i) => (
              <img
                key={s.id}
                src={s.img}
                alt={s.headline}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  opacity: i === active ? 1 : 0,
                  transform: i === active ? 'scale(1)' : (i === prev ? 'scale(1.04)' : 'scale(1.02)'),
                  transition: 'opacity 0.55s ease, transform 0.55s ease',
                  zIndex: i === active ? 2 : i === prev ? 1 : 0,
                  willChange: 'opacity, transform',
                }}
              />
            ))}

            {/* Overlays */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 55%, rgba(8,9,15,0.97))', zIndex: 3 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,9,15,0.75) 0%, transparent 45%)', zIndex: 3 }} />

            {/* Chapter badge */}
            <div key={`badge-${active}`} style={{ position: 'absolute', top: 20, left: 20, zIndex: 4, background: story.accent, borderRadius: 10, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 900, color: '#000', letterSpacing: '0.06em', animation: 'badgePop 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
              {story.chapter}
            </div>

            {/* Emotion emoji */}
            <div key={`emoji-${active}`} style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 4, fontSize: '3rem', animation: 'emojiPop 0.4s cubic-bezier(0.34,1.56,0.64,1), floatEmoji 3s ease-in-out infinite 0.4s' }}>
              {story.emotion}
            </div>
          </div>

          {/* ── RIGHT: Text content ── */}
          <div
            key={`text-${active}`}
            style={{
              padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
              animation: 'textSlideIn 0.45s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: story.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              ● {story.chapter.toUpperCase()}
            </div>
            <h3 style={{ fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 900, marginBottom: 8, lineHeight: 1.2, color: 'white', margin: '0 0 8px' }}>
              {story.headline}
            </h3>
            <div style={{ fontSize: '0.88rem', color: story.accent, fontWeight: 700, marginBottom: 16 }}>
              {story.sub}
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.75, color: 'rgba(203,213,225,0.85)', marginBottom: 24 }}>
              {story.body}
            </p>
            <div style={{ background: `${story.accent}10`, border: `1px solid ${story.accent}30`, borderLeft: `3px solid ${story.accent}`, borderRadius: '0 12px 12px 0', padding: '14px 18px' }}>
              <p style={{ margin: 0, fontSize: '0.88rem', fontStyle: 'italic', color: 'rgba(203,213,225,0.9)', lineHeight: 1.6 }}>{story.quote}</p>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32 }}>
              <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                {STORY.map((s, i) => (
                  <button key={i} onClick={() => { setAutoPlay(false); goTo(i) }}
                    style={{ width: i === active ? 32 : 10, height: 10, borderRadius: 5, border: 'none', cursor: 'pointer', transition: 'all 0.35s ease', background: i === active ? s.accent : 'rgba(255,255,255,0.15)', padding: 0 }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setAutoPlay(false); goTo((active - 1 + STORY.length) % STORY.length) }}
                  style={{ width: 38, height: 38, borderRadius: '50%', border: `1px solid ${story.accent}44`, background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${story.accent}22`}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >←</button>
                <button onClick={() => { setAutoPlay(false); goTo((active + 1) % STORY.length) }}
                  style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: story.accent, cursor: 'pointer', color: '#000', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: `0 0 16px ${story.accent}66` }}
                >→</button>
              </div>
            </div>

            {/* Auto-play + progress */}
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setAutoPlay(a => !a)} style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.5)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0, fontFamily: 'inherit' }}>
                <span style={{ width: 24, height: 12, borderRadius: 6, background: autoPlay ? story.accent : 'rgba(255,255,255,0.1)', display: 'inline-block', position: 'relative', transition: 'background 0.3s' }}>
                  <span style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: 'white', top: 2, left: autoPlay ? 14 : 2, transition: 'left 0.3s' }} />
                </span>
                Auto-play {autoPlay ? 'ON' : 'OFF'}
              </button>
              {autoPlay && (
                <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, overflow: 'hidden' }}>
                  <div key={`progress-${active}`} style={{ height: '100%', background: story.accent, animation: 'progressFill 5s linear forwards', borderRadius: 1 }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 52 }}>
          <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.9rem', marginBottom: 20 }}>
            Raju's story is not unique. <strong style={{ color: 'white' }}>2,45,832 students</strong> are writing their own success story on PrepBridge right now.
          </p>
          <a href="/auth?signup=1"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', borderRadius: 999, fontWeight: 800, fontSize: '1.05rem', color: 'white', textDecoration: 'none', boxShadow: '0 0 40px rgba(124,58,237,0.5)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 0 70px rgba(124,58,237,0.8)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.5)' }}
          >
            ⚡ Write Your Own Story — Start Free
          </a>
        </div>
      </div>

      <style>{`
        @keyframes liveDot      { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes badgePop     { from{opacity:0;transform:scale(0.5) translateY(-8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes emojiPop     { from{opacity:0;transform:scale(0) rotate(-25deg)} to{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes floatEmoji   { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-14px) rotate(4deg)} }
        @keyframes particleRise { 0%{opacity:0;transform:translateY(0) rotate(0deg)} 15%{opacity:0.9} 100%{opacity:0;transform:translateY(-75vh) rotate(360deg)} }
        @keyframes progressFill { from{width:0%} to{width:100%} }
        @keyframes textSlideIn  { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </section>
  )
}
