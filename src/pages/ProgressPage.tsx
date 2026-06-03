import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Trophy, Clock, TrendingUp, BookOpen, Calendar, Zap, Award } from 'lucide-react'
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts'
import { fetchUserAttempts, fetchPaperById, type QuizAttempt } from '../lib/supabase'
import { useUserStore } from '../store/useStore'

interface AttemptWithTitle extends QuizAttempt {
  paperTitle: string
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={17} color={color} />
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// GitHub-style streak calendar
function StreakCalendar({ attempts }: { attempts: QuizAttempt[] }) {
  const today = new Date()
  const days = eachDayOfInterval({ start: subDays(today, 89), end: today })

  const attemptDates = new Set(
    attempts.map(a => format(new Date(a.completed_at), 'yyyy-MM-dd'))
  )

  const weeks: Date[][] = []
  let week: Date[] = []
  days.forEach((day, i) => {
    week.push(day)
    if (week.length === 7 || i === days.length - 1) {
      weeks.push(week)
      week = []
    }
  })

  return (
    <div>
      <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Activity (Last 90 Days)</h3>
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 4 }}>
        {weeks.map((wk, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {wk.map(day => {
              const key = format(day, 'yyyy-MM-dd')
              const hasActivity = attemptDates.has(key)
              return (
                <div key={key} title={`${key}${hasActivity ? ' — studied' : ''}`}
                  style={{ width: 11, height: 11, borderRadius: 2, background: hasActivity ? '#1E40AF' : 'var(--bg-4)', flexShrink: 0 }} />
              )
            })}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <div style={{ width: 11, height: 11, borderRadius: 2, background: 'var(--bg-4)' }} />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>No activity</span>
        <div style={{ width: 11, height: 11, borderRadius: 2, background: '#1E40AF', marginLeft: 8 }} />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>Attempted</span>
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const { user } = useUserStore()
  const navigate = useNavigate()
  const [attempts, setAttempts] = useState<AttemptWithTitle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uid = (user as any)?.uid
    if (!uid) { setLoading(false); return }
    fetchUserAttempts(uid, 100).then(async data => {
      // Enrich with paper titles
      const enriched = await Promise.all(data.map(async a => {
        const paper = await fetchPaperById(a.paper_id).catch(() => null)
        return { ...a, paperTitle: paper?.title ?? 'Unknown Paper' }
      }))
      setAttempts(enriched)
    }).finally(() => setLoading(false))
  }, [(user as any)?.uid])

  if (loading) {
    return (
      <div className="page animate-fade-in" style={{ paddingBottom: 80 }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '1.5rem', fontWeight: 700 }}>My Progress</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
          {Array(4).fill(0).map((_, i) => <div key={i} style={{ height: 90, background: 'var(--bg-3)', borderRadius: 'var(--r-md)', animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      </div>
    )
  }

  const totalAttempts = attempts.length
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((s, a) => s + (a.total_marks > 0 ? (a.score / a.total_marks) * 100 : 0), 0) / totalAttempts)
    : 0
  const bestScore = totalAttempts > 0
    ? Math.round(Math.max(...attempts.map(a => a.total_marks > 0 ? (a.score / a.total_marks) * 100 : 0)))
    : 0
  const totalTime = Math.round(attempts.reduce((s, a) => s + (a.time_taken_seconds ?? 0), 0) / 60)

  // Trend data — last 7 attempts
  const trendData = attempts.slice(0, 7).reverse().map((a, i) => ({
    name: `T${i + 1}`,
    score: a.total_marks > 0 ? Math.round((a.score / a.total_marks) * 100) : 0,
  }))

  // Weekly distribution
  const now = new Date()
  const weekData = [0, 1, 2, 3, 4, 5, 6].map(d => {
    const day = subDays(now, 6 - d)
    const label = format(day, 'EEE')
    const count = attempts.filter(a => format(new Date(a.completed_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length
    return { name: label, count }
  })

  // Subject radar data (from attempts grouped by paper title keywords)
  const subjectMap: Record<string, { sum: number; count: number }> = {}
  attempts.forEach(a => {
    const sub = a.paperTitle.split(' ').slice(0, 2).join(' ')
    if (!subjectMap[sub]) subjectMap[sub] = { sum: 0, count: 0 }
    subjectMap[sub].sum += a.total_marks > 0 ? (a.score / a.total_marks) * 100 : 0
    subjectMap[sub].count++
  })
  const radarData = Object.entries(subjectMap).slice(0, 6).map(([subject, { sum, count }]) => ({
    subject: subject.slice(0, 10),
    score: Math.round(sum / count),
    fullMark: 100,
  }))

  return (
    <div className="page animate-fade-in" style={{ paddingBottom: 80 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700 }}>My Progress</h2>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-3)' }}>Your learning journey at a glance</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
        <StatCard icon={Target} label="Total Attempts" value={totalAttempts} color="#1E40AF" />
        <StatCard icon={TrendingUp} label="Avg Score" value={avgScore > 0 ? `${avgScore}%` : '—'} color="#10B981" />
        <StatCard icon={Trophy} label="Best Score" value={bestScore > 0 ? `${bestScore}%` : '—'} color="#F59E0B" />
        <StatCard icon={Clock} label="Time Studied" value={`${totalTime}m`} color="#0891B2" />
      </div>

      {totalAttempts === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-3)' }}>
          <Target size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontWeight: 600, marginBottom: 8 }}>No attempts yet</p>
          <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>Take a mock test or quiz to start tracking your progress.</p>
          <button onClick={() => navigate('/app/papers')}
            style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #1E40AF, #0891B2)', border: 'none', borderRadius: 'var(--r-md)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            Browse Papers
          </button>
        </div>
      ) : (
        <>
          {/* Score Trend */}
          {trendData.length > 1 && (
            <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16, marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Score Trend</h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1E40AF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} formatter={(v: number) => [`${v}%`, 'Score']} />
                  <Area type="monotone" dataKey="score" stroke="#1E40AF" fill="url(#scoreGrad)" strokeWidth={2} dot={{ fill: '#1E40AF', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weekly Activity */}
          <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>This Week</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={weekData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} formatter={(v: number) => [v, 'Tests']} />
                <Bar dataKey="count" fill="#1E40AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Radar */}
          {radarData.length >= 3 && (
            <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16, marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subject Performance</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                  <Radar dataKey="score" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.2} strokeWidth={2} dot />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} formatter={(v: number) => [`${v}%`, 'Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Streak Calendar */}
          <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16, marginBottom: 16 }}>
            <StreakCalendar attempts={attempts} />
          </div>

          {/* Attempt History */}
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recent Attempts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {attempts.slice(0, 20).map(a => {
                const pct = a.total_marks > 0 ? Math.round((a.score / a.total_marks) * 100) : 0
                const color = pct >= 70 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
                return (
                  <div key={a.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color }}>{pct}%</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 3px', fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.paperTitle}</p>
                      <div style={{ display: 'flex', gap: 10, fontSize: '0.72rem', color: 'var(--text-3)' }}>
                        <span>{a.score}/{a.total_marks} marks</span>
                        <span>{a.correct_answers}C · {a.wrong_answers}W · {a.skipped_answers}S</span>
                        {a.time_taken_seconds && <span>{Math.round(a.time_taken_seconds / 60)}m</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', textAlign: 'right', flexShrink: 0 }}>
                      {format(new Date(a.completed_at), 'MMM d')}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
