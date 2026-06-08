import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, Target, TrendingUp, Calendar, Zap, Bookmark, Newspaper, ChevronRight, MessageSquare, Sparkles, Trophy, Award } from 'lucide-react'
import { format, formatDistanceToNow, parseISO, isAfter, differenceInDays } from 'date-fns'
import { useUserStore } from '../store/useStore'
import { usePlatformStore } from '../store/usePlatformStore'
import { fetchNews, fetchTimetables, fetchUserAttempts, type NewsArticle, type TimetableEntry, type ExamTimetable } from '../lib/supabase'

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value: string | number; color: string }) {
  return (
    <div className="prepinsta-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(15, 17, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}14`, display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0, justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1.1, color: 'white' }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 3, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  )
}

export default function HomeDashboard() {
  const navigate = useNavigate()
  const { user, profile } = useUserStore()
  const { selectedBoard, selectedExam, bookmarkedPaperIds } = usePlatformStore()

  const [recentNews, setRecentNews] = useState<NewsArticle[]>([])
  const [nextExam, setNextExam] = useState<(TimetableEntry & { timetableTitle: string }) | null>(null)
  const [attemptsThisWeek, setAttemptsThisWeek] = useState(0)
  const [avgScore, setAvgScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [aiPrompt, setAiPrompt] = useState('')

  const displayName = (profile as any)?.name || (profile as any)?.displayName || (user as any)?.displayName || 'Student'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    const uid = (user as any)?.uid
    Promise.all([
      fetchNews({ limit: 4 }),
      fetchTimetables(selectedBoard?.id),
      uid ? fetchUserAttempts(uid) : Promise.resolve([]),
    ]).then(([news, timetables, attempts]) => {
      setRecentNews(news)

      const now = new Date()
      const allEntries = timetables.flatMap((t: ExamTimetable & { entries: TimetableEntry[] }) =>
        (t.entries ?? []).map(e => ({ ...e, timetableTitle: t.title }))
      )
      const upcoming = allEntries
        .filter(e => isAfter(parseISO(e.exam_date), now))
        .sort((a, b) => parseISO(a.exam_date).getTime() - parseISO(b.exam_date).getTime())
      setNextExam(upcoming[0] ?? null)

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const weekAttempts = attempts.filter(a => new Date(a.completed_at) > weekAgo)
      setAttemptsThisWeek(weekAttempts.length)
      if (weekAttempts.length > 0) {
        const avg = weekAttempts.reduce((s, a) => s + (a.total_marks > 0 ? (a.score / a.total_marks) * 100 : 0), 0) / weekAttempts.length
        setAvgScore(Math.round(avg))
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [(user as any)?.uid, selectedBoard?.id])

  const quickActions = [
    { label: 'Papers Hub', icon: BookOpen, path: '/app/papers', color: '#00e676' },
    { label: 'Exam Timetable', icon: Calendar, path: '/app/timetable', color: '#7c4dff' },
    { label: 'News Feed', icon: Newspaper, path: '/app/news', color: '#ffd700' },
    { label: 'Saved Bookmarks', icon: Bookmark, path: '/app/papers', color: '#00b0ff' },
  ]

  const handleAiAsk = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiPrompt.trim()) return
    navigate('/app/ai-tutor', { state: { initialQuery: aiPrompt } })
  }

  return (
    <div className="page animate-fade-in" style={{ paddingBottom: 100, maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
      
      {/* Background glow highlights */}
      <div className="radial-glow-prime-green" style={{ top: '-10%', right: '-5%', opacity: 0.4 }} />
      <div className="radial-glow-prime-purple" style={{ bottom: '20%', left: '-10%', opacity: 0.3 }} />

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-3)', fontWeight: 600 }}>{greeting},</p>
          <h2 style={{ margin: '4px 0 8px', fontSize: '1.8rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
            {displayName.split(' ')[0]} 👋
          </h2>
          {(selectedBoard || selectedExam) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {selectedBoard && (
                <button onClick={() => navigate('/app/board-selector')} className="prime-badge" style={{ cursor: 'pointer' }}>
                  🏛️ {selectedBoard.short_name}
                </button>
              )}
              {selectedExam && (
                <button onClick={() => navigate('/app/board-selector')} className="prime-badge prime-badge-purple" style={{ cursor: 'pointer' }}>
                  🎯 {selectedExam.name}
                </button>
              )}
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate('/app/ai-tutor')}
          className="btn btn-prime-purple"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 30, fontSize: '0.85rem' }}
        >
          <Sparkles size={16} /> Ask K² AI Tutor
        </button>
      </div>

      {/* Grid container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="dashboard-grid">
        
        {/* Next Exam banner */}
        {nextExam && (
          <div 
            onClick={() => navigate('/app/timetable')}
            style={{ 
              background: 'linear-gradient(135deg, #0f111a 0%, #150f28 100%)', 
              border: '1px solid rgba(124, 77, 255, 0.25)', 
              borderRadius: 20, 
              padding: '24px', 
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}
            className="bento-btn-interactive"
          >
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 180, height: 180, background: 'radial-gradient(circle, rgba(124, 77, 255, 0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className="prime-badge prime-badge-yellow">⚠️ Upcoming Exam Session</span>
                </div>
                <h3 style={{ margin: '0 0 4px', color: 'white', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>{nextExam.subject_name}</h3>
                <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 500 }}>{(nextExam as any).timetableTitle}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>
                    📅 {format(parseISO(nextExam.exam_date), 'EEE, MMM d, yyyy')} {nextExam.exam_time ? `• ${nextExam.exam_time}` : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255, 215, 0, 0.06)', border: '1px solid rgba(255, 215, 0, 0.15)', borderRadius: 16, padding: '14px 20px', minWidth: 120 }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 950, color: '#ffd700', lineHeight: 1 }}>
                  {differenceInDays(parseISO(nextExam.exam_date), new Date())}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>Days Remaining</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <StatCard icon={Zap} label="Mock attempts this week" value={attemptsThisWeek} color="#00e676" />
          <StatCard icon={Target} label="Average precision rate" value={avgScore > 0 ? `${avgScore}%` : '—'} color="#7c4dff" />
          <StatCard icon={Bookmark} label="Syllabus bookmarks" value={bookmarkedPaperIds.length} color="#00b0ff" />
          <StatCard icon={TrendingUp} label="Daily learning streak" value={(profile as any)?.streak ?? 0} color="#ffd700" />
        </div>

        {/* Core Quick Access & AI Chat bento */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          
          {/* Quick Access */}
          <div className="prepinsta-card" style={{ padding: 24, background: 'rgba(15, 17, 26, 0.7)' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: '0.88rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Access</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {quickActions.map(action => (
                <button 
                  key={action.label} 
                  onClick={() => navigate(action.path)}
                  style={{ 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid rgba(255,255,255,0.03)', 
                    borderRadius: 16, 
                    padding: '16px 12px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 10, 
                    cursor: 'pointer', 
                    transition: 'var(--t)' 
                  }}
                  className="bento-btn-interactive"
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${action.color}0f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <action.icon size={18} color={action.color} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-2)' }}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Doubt Clear Panel */}
          <div className="prepinsta-card prepinsta-card-purple" style={{ padding: 24, background: 'rgba(15, 17, 26, 0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MessageSquare size={18} color="var(--prime-purple)" />
              <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Instant Doubt Solver</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.4, marginBottom: 16 }}>
              Type any question or syllabus topic to begin an active recall session with your AI tutor instantly.
            </p>
            <form onSubmit={handleAiAsk} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input 
                type="text" 
                placeholder="Ask about Article 21, AP History, SSC math tricks..." 
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                className="form-input"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', fontSize: '0.85rem' }}
              />
              <button 
                type="submit" 
                className="btn btn-prime-purple btn-sm"
                style={{ justifyContent: 'center', gap: 6, borderRadius: 12 }}
              >
                Launch AI Explanation <ChevronRight size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Board selector banner */}
        {!selectedBoard && (
          <button 
            onClick={() => navigate('/app/board-selector')}
            style={{ 
              width: '100%', 
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(124, 77, 255, 0.08), rgba(0, 230, 118, 0.04))', 
              border: '1px solid rgba(124, 77, 255, 0.2)', 
              borderRadius: 20, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            className="bento-btn-interactive"
          >
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '0.95rem', color: 'white' }}>Select Board & Exam Target</p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-3)' }}>Personalize your timeline progress logs, vacancy notification feeds, and mock syllabus catalog.</p>
            </div>
            <ChevronRight size={20} color="var(--prime-purple)" />
          </button>
        )}

        {/* Latest Notification / News Feed */}
        {recentNews.length > 0 && (
          <div className="prepinsta-card" style={{ padding: 24, background: 'rgba(15, 17, 26, 0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Latest Notification Alerts</h3>
              <button onClick={() => navigate('/app/news')} style={{ background: 'none', border: 'none', color: 'var(--prime-green)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800 }}>See all alerts</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentNews.map(a => (
                <div 
                  key={a.id} 
                  onClick={() => a.url && window.open(a.url, '_blank')}
                  style={{ 
                    background: 'rgba(255,255,255,0.005)', 
                    border: '1px solid rgba(255,255,255,0.02)', 
                    borderRadius: 14, 
                    padding: '14px 16px', 
                    cursor: a.url ? 'pointer' : 'default', 
                    display: 'flex', 
                    gap: 12, 
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  className="bento-btn-interactive"
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.35, color: 'white' }}>{a.title}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 500 }}>
                      {a.source} • {formatDistanceToNow(new Date(a.published_at), { addSuffix: true })}
                    </p>
                  </div>
                  <ChevronRight size={14} color="var(--text-4)" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
