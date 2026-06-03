import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, Target, TrendingUp, Calendar, Zap, Bookmark, Newspaper, ChevronRight } from 'lucide-react'
import { format, formatDistanceToNow, parseISO, isAfter, differenceInDays } from 'date-fns'
import { useUserStore } from '../store/useStore'
import { usePlatformStore } from '../store/usePlatformStore'
import { fetchNews, fetchTimetables, fetchUserAttempts, type NewsArticle, type TimetableEntry, type ExamTimetable } from '../lib/supabase'

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>{label}</div>
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
    { label: 'Papers', icon: BookOpen, path: '/app/papers', color: '#1E40AF' },
    { label: 'Timetable', icon: Calendar, path: '/app/timetable', color: '#059669' },
    { label: 'News', icon: Newspaper, path: '/app/news', color: '#D97706' },
    { label: 'Bookmarks', icon: Bookmark, path: '/app/papers', color: '#0891B2' },
  ]

  return (
    <div className="page animate-fade-in" style={{ paddingBottom: 80 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-3)' }}>{greeting},</p>
        <h2 style={{ margin: '2px 0 6px', fontSize: '1.6rem', fontWeight: 800 }}>{displayName.split(' ')[0]}</h2>
        {(selectedBoard || selectedExam) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {selectedBoard && (
              <button onClick={() => navigate('/app/board-selector')}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(30,64,175,0.25)', borderRadius: 20, color: '#60A5FA', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                {selectedBoard.short_name}
              </button>
            )}
            {selectedExam && (
              <button onClick={() => navigate('/app/board-selector')}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.25)', borderRadius: 20, color: '#34D399', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                {selectedExam.name}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Next Exam Countdown */}
      {nextExam && (
        <div onClick={() => navigate('/app/timetable')}
          style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #0891B2 100%)', borderRadius: 'var(--r-lg)', padding: '16px 18px', marginBottom: 20, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Calendar size={13} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase' }}>Next Exam</span>
          </div>
          <h3 style={{ margin: '0 0 2px', color: 'white', fontWeight: 700, fontSize: '1.05rem' }}>{nextExam.subject_name}</h3>
          <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>{(nextExam as any).timetableTitle}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>
              {format(parseISO(nextExam.exam_date), 'EEE, MMM d')} {nextExam.exam_time ? `• ${nextExam.exam_time}` : ''}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FEF08A' }}>
              {differenceInDays(parseISO(nextExam.exam_date), new Date())}d left
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
        <StatCard icon={Zap} label="Tests this week" value={attemptsThisWeek} color="#F59E0B" />
        <StatCard icon={Target} label="Avg score" value={avgScore > 0 ? `${avgScore}%` : '—'} color="#10B981" />
        <StatCard icon={Bookmark} label="Bookmarks" value={bookmarkedPaperIds.length} color="#1E40AF" />
        <StatCard icon={TrendingUp} label="Streak days" value={(profile as any)?.streak ?? 0} color="#0891B2" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quick Access</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {quickActions.map(action => (
            <button key={action.label} onClick={() => navigate(action.path)}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'var(--t)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = action.color }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${action.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <action.icon size={18} color={action.color} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-2)' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Board Selector CTA if not selected */}
      {!selectedBoard && (
        <button onClick={() => navigate('/app/board-selector')}
          style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, rgba(30,64,175,0.12), rgba(8,145,178,0.08))', border: '1px solid rgba(30,64,175,0.25)', borderRadius: 'var(--r-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.92rem' }}>Select Your Board & Exam</p>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-3)' }}>Get personalized content for your exam</p>
          </div>
          <ChevronRight size={18} color="var(--text-3)" />
        </button>
      )}

      {/* Recent News */}
      {recentNews.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Latest News</h3>
            <button onClick={() => navigate('/app/news')} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>See all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentNews.map(a => (
              <div key={a.id} onClick={() => a.url && window.open(a.url, '_blank')}
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 14px', cursor: a.url ? 'pointer' : 'default', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.35 }}>{a.title}</p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-3)' }}>
                    {a.source} • {formatDistanceToNow(new Date(a.published_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
