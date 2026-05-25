import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore, useAppStore } from '../store/useStore'
import { CURRENT_AFFAIRS_DATA, DAILY_QUIZ_QUESTIONS } from '../data/currentAffairs'
import { MOCK_TESTS } from '../data/questions'
import { format } from 'date-fns'
import {
  Flame, Target, Star, TrendingUp, BookOpen, ClipboardList,
  Newspaper, BrainCircuit, Bell, ChevronRight, CheckCircle,
  Clock, Zap, Trophy, Calendar, AlertCircle, ArrowRight, Play
} from 'lucide-react'

function StatCard({ icon, label, value, trend, color, bg }) {
  return (
    <div className="card card-p stat-card">
      <div className="stat-card-header">
        <div className="stat-icon" style={{ background: bg || 'var(--cyan-10)' }}>{icon}</div>
        {trend && <span className={`stat-trend ${trend > 0 ? 'trend-up' : 'trend-down'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>}
      </div>
      <div className="stat-value" style={{ color: color || 'var(--text-1)' }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function AIRecommendation({ profile, exams }) {
  const tasks = [
    { type: 'study', subject: 'Polity', topic: 'Fundamental Rights', duration: '45 min', priority: 'high', reason: 'Weak area detected from last mock test' },
    { type: 'quiz', subject: 'Current Affairs', topic: 'May 2026 Digest', duration: '20 min', priority: 'high', reason: 'Daily CA is crucial for all your exams' },
    { type: 'mock', subject: 'SSC CGL', topic: 'Reasoning Full Set', duration: '30 min', priority: 'medium', reason: 'Improve reasoning speed before exam' },
    { type: 'revise', subject: 'History', topic: 'Freedom Struggle', duration: '30 min', priority: 'medium', reason: 'Revision due (last studied 5 days ago)' },
    { type: 'study', subject: 'Maths', topic: 'Percentage & Profit/Loss', duration: '40 min', priority: 'low', reason: 'New chapter in your study plan' },
  ]
  const priorityColor = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--emerald)' }
  const typeIcon = { study: '📖', quiz: '⚡', mock: '📝', revise: '🔄' }

  return (
    <div className="card card-p" style={{ border: '1px solid var(--purple-20)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <BrainCircuit size={20} color="var(--purple)" />
        <h4 style={{ margin: 0 }}>AI Daily Study Plan</h4>
        <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>Personalized</span>
      </div>
      <p style={{ fontSize: '0.82rem', marginBottom: 16, color: 'var(--text-3)' }}>
        Based on your performance + {exams.length} target exam(s) — here's what to focus on today:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.map((task, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'var(--t)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: '1.2rem', marginTop: 2 }}>{typeIcon[task.type]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{task.subject} — {task.topic}</span>
                <span style={{ fontSize: '0.65rem', background: priorityColor[task.priority] + '22', color: priorityColor[task.priority], border: `1px solid ${priorityColor[task.priority]}44`, borderRadius: 'var(--r-full)', padding: '2px 7px', fontWeight: 700, textTransform: 'uppercase' }}>{task.priority}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{task.reason}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} />{task.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>
        <Zap size={16} /> Start Today's Session
      </button>
    </div>
  )
}

function StreakCard({ streak }) {
  const days = ['M','T','W','T','F','S','S']
  const today = new Date().getDay()
  return (
    <div className="card card-p" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.05))', border: '1px solid rgba(245,158,11,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Flame size={20} color="var(--amber)" />
        <h4 style={{ margin: 0 }}>Study Streak</h4>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--amber)', lineHeight: 1 }}>{streak || 3}</div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700 }}>day streak 🔥</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Keep it going!</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {days.map((d, i) => (
          <div key={d} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ width: '100%', aspectRatio: 1, borderRadius: 6, background: i <= (today === 0 ? 6 : today - 1) ? 'var(--amber)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              {i <= (today === 0 ? 6 : today - 1) && <CheckCircle size={12} color="#08090f" />}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-4)' }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickCurrentAffairs() {
  const [active, setActive] = useState(0)
  const top3 = CURRENT_AFFAIRS_DATA.slice(0, 3)
  return (
    <div className="card card-p">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Newspaper size={18} color="var(--cyan)" />
          <h4 style={{ margin: 0 }}>Today's Current Affairs</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="dot-live" />
          <span style={{ fontSize: '0.72rem', color: 'var(--emerald)' }}>LIVE</span>
        </div>
      </div>
      {top3.map((item, i) => (
        <div key={item.id} onClick={() => setActive(i)} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span className={`badge badge-${item.importance === 'high' ? 'red' : item.importance === 'medium' ? 'amber' : 'emerald'}`} style={{ flexShrink: 0, marginTop: 2 }}>{item.importance.toUpperCase()}</span>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>{item.title}</div>
              {active === i && <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.55 }}>{item.summary}</div>}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 4 }}>{item.category} • {item.source}</div>
            </div>
          </div>
        </div>
      ))}
      <Link to="/app/current-affairs" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
        View All Current Affairs <ChevronRight size={14} />
      </Link>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useUserStore()
  const { streak, totalPoints } = useAppStore()
  const [greeting, setGreeting] = useState('')
  const [dailyQuiz, setDailyQuiz] = useState(null)
  const [quizAnswer, setQuizAnswer] = useState(null)

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
    setDailyQuiz(DAILY_QUIZ_QUESTIONS[Math.floor(Math.random() * DAILY_QUIZ_QUESTIONS.length)])
  }, [])

  const examNames = { upsc: 'UPSC', ias: 'IAS', ssc_cgl: 'SSC CGL', ibps_po: 'IBPS PO', rrb_ntpc: 'RRB NTPC', neet_ug: 'NEET', jee_main: 'JEE Mains' }

  return (
    <div className="page animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>{greeting}, {profile?.name?.split(' ')[0] || 'Aspirant'} 👋</h2>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>
              {format(new Date(), 'EEEE, d MMMM yyyy')} • Target: {(profile?.exams || []).map(e => examNames[e] || e).slice(0, 3).join(', ')}{(profile?.exams || []).length > 3 ? ` +${profile.exams.length - 3} more` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/app/mock-tests" className="btn btn-primary btn-sm"><Play size={14} /> Start Mock Test</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon={<Flame size={20} color="var(--amber)" />} label="Day Streak" value={`${streak || 3} 🔥`} bg="var(--amber-10)" color="var(--amber)" />
        <StatCard icon={<Trophy size={20} color="var(--purple)" />} label="Total Points" value={(totalPoints || 2840).toLocaleString()} trend={12} bg="var(--purple-10)" />
        <StatCard icon={<ClipboardList size={20} color="var(--cyan)" />} label="Tests Taken" value="24" trend={8} bg="var(--cyan-10)" />
        <StatCard icon={<Target size={20} color="var(--emerald)" />} label="Accuracy" value="73.4%" trend={5} bg="var(--emerald-10)" />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <AIRecommendation profile={profile} exams={profile?.exams || []} />

          {/* Quick mock test */}
          <div className="card card-p">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={18} color="var(--cyan)" /> Recommended Mock Tests</h4>
              <Link to="/app/mock-tests" style={{ fontSize: '0.82rem', color: 'var(--cyan)' }}>View all</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOCK_TESTS.slice(0, 3).map(test => (
                <Link key={test.id} to={`/app/test/${test.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', textDecoration: 'none', transition: 'var(--t)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.background = 'var(--cyan-10)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ClipboardList size={20} color="white" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 2 }}>{test.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{test.totalQuestions}Q • {test.duration}min • {test.attempts.toLocaleString()} attempts</div>
                  </div>
                  <span className={`badge ${test.difficulty === 'hard' ? 'badge-red' : test.difficulty === 'medium' ? 'badge-amber' : 'badge-emerald'}`}>{test.difficulty}</span>
                  <ArrowRight size={16} color="var(--text-3)" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <StreakCard streak={streak} />
          <QuickCurrentAffairs />

          {/* Daily quiz */}
          {dailyQuiz && (
            <div className="card card-p" style={{ border: '1px solid var(--amber-10)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: '1.1rem' }}>⚡</span>
                <h4 style={{ margin: 0 }}>Daily Quiz</h4>
                <span className="badge badge-amber" style={{ marginLeft: 'auto' }}>+10 pts</span>
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-1)', marginBottom: 14, lineHeight: 1.55 }}>{dailyQuiz.text}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dailyQuiz.options.map((opt, i) => (
                  <button key={i} onClick={() => setQuizAnswer(i)} className="option-btn"
                    style={{ fontSize: '0.85rem', background: quizAnswer === i ? (i === dailyQuiz.correct ? 'var(--emerald-10)' : 'var(--red-10)') : quizAnswer !== null && i === dailyQuiz.correct ? 'var(--emerald-10)' : undefined, borderColor: quizAnswer === i ? (i === dailyQuiz.correct ? 'var(--emerald)' : 'var(--red)') : quizAnswer !== null && i === dailyQuiz.correct ? 'var(--emerald)' : undefined }}
                    disabled={quizAnswer !== null}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                ))}
              </div>
              {quizAnswer !== null && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--r-sm)', fontSize: '0.82rem', color: 'var(--text-2)' }}>
                  <strong style={{ color: 'var(--emerald)' }}>Explanation:</strong> {dailyQuiz.explanation}
                </div>
              )}
            </div>
          )}

          {/* Upcoming exams */}
          <div className="card card-p">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Calendar size={18} color="var(--purple)" />
              <h4 style={{ margin: 0 }}>Upcoming Exams</h4>
            </div>
            {[{ name: 'RBI Grade B', date: '2026-05-31', days: 5 }, { name: 'JEE Advanced', date: '2026-05-18', days: 20 }, { name: 'TNPSC Group 2', date: '2026-05-24', days: 32 }].map(e => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{e.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{e.date}</div>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: e.days < 10 ? 'var(--red)' : e.days < 30 ? 'var(--amber)' : 'var(--emerald)' }}>{e.days}d left</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress overview */}
      <div className="card card-p" style={{ marginBottom: 28 }}>
        <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="var(--cyan)" /> Subject-wise Progress
        </h4>
        <div className="grid-3">
          {[
            { name: 'General Knowledge', pct: 72, color: 'var(--cyan)' },
            { name: 'Reasoning', pct: 68, color: 'var(--purple)' },
            { name: 'English', pct: 81, color: 'var(--emerald)' },
            { name: 'Quantitative Aptitude', pct: 55, color: 'var(--amber)' },
            { name: 'Current Affairs', pct: 78, color: 'var(--blue)' },
            { name: 'History', pct: 63, color: 'var(--pink)' },
          ].map(s => (
            <div key={s.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 500 }}>{s.name}</span>
                <span style={{ fontWeight: 700, color: s.color }}>{s.pct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
