import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore, useAppStore } from '../store/useStore'
import { CURRENT_AFFAIRS_DATA, DAILY_QUIZ_QUESTIONS } from '../data/currentAffairs'
import { MOCK_TESTS, QUESTION_BANK } from '../data/questions'
import { getAutoUpdatedCurrentAffairs } from '../services/currentAffairsService'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import {
  Flame, Target, Star, TrendingUp, BookOpen, ClipboardList,
  Newspaper, BrainCircuit, Bell, ChevronRight, CheckCircle,
  Clock, Zap, Trophy, Calendar, AlertCircle, ArrowRight, Play, Timer
} from 'lucide-react'
import { getSubscriptionStatus } from '../services/paymentService'

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

// ─── Countdown and Syllabus Helpers ──────────────────────────────────────────
const getDaysRemaining = (examDate, target) => {
  let targetDate = examDate ? new Date(examDate) : null
  if (!targetDate) {
    if (target === 'ias' || target === 'ips' || target === 'upsc') targetDate = new Date('2026-06-01')
    else if (target === 'ssc_cgl') targetDate = new Date('2026-09-01')
    else if (target?.includes('po') || target?.includes('clerk') || target === 'banking') targetDate = new Date('2026-10-01')
    else if (target === 'neet_ug') targetDate = new Date('2026-05-04')
    else if (target === 'jee_main') targetDate = new Date('2027-01-15')
    else targetDate = new Date('2026-12-31')
  }
  const diffTime = targetDate.getTime() - Date.now()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

const getSyllabusProgress = (target) => {
  if (target === 'ias' || target === 'ips' || target === 'upsc') {
    return [
      { name: 'Indian Polity & Constitution', pct: 72, color: 'var(--cyan)' },
      { name: 'History of India & National Movement', pct: 63, color: 'var(--pink)' },
      { name: 'Indian Economy & Development', pct: 55, color: 'var(--amber)' },
      { name: 'Geography (India & World)', pct: 68, color: 'var(--purple)' },
      { name: 'Environment & Ecology', pct: 78, color: 'var(--emerald)' },
      { name: 'Science & Technology', pct: 58, color: 'var(--blue)' },
    ]
  } else if (target === 'ssc_cgl' || target?.startsWith('ssc')) {
    return [
      { name: 'Quantitative Aptitude', pct: 55, color: 'var(--amber)' },
      { name: 'General Intelligence & Reasoning', pct: 68, color: 'var(--purple)' },
      { name: 'English Comprehension', pct: 81, color: 'var(--emerald)' },
      { name: 'General Awareness', pct: 72, color: 'var(--cyan)' },
    ]
  } else if (target?.includes('po') || target?.includes('clerk') || target?.includes('sbi') || target?.includes('ibps') || target === 'banking') {
    return [
      { name: 'Quantitative Aptitude', pct: 55, color: 'var(--amber)' },
      { name: 'Reasoning Ability', pct: 68, color: 'var(--purple)' },
      { name: 'English Language', pct: 81, color: 'var(--emerald)' },
      { name: 'Banking & Financial Awareness', pct: 72, color: 'var(--cyan)' },
      { name: 'Computer Aptitude', pct: 63, color: 'var(--pink)' },
    ]
  } else if (target === 'neet_ug') {
    return [
      { name: 'Biology (Botany & Zoology)', pct: 81, color: 'var(--emerald)' },
      { name: 'Chemistry (Organic, Inorganic, Physical)', pct: 68, color: 'var(--cyan)' },
      { name: 'Physics', pct: 55, color: 'var(--amber)' },
    ]
  } else if (target === 'jee_main' || target === 'jee_adv') {
    return [
      { name: 'Mathematics', pct: 55, color: 'var(--pink)' },
      { name: 'Physics', pct: 68, color: 'var(--amber)' },
      { name: 'Chemistry', pct: 81, color: 'var(--cyan)' },
    ]
  }
  return [
    { name: 'General Knowledge', pct: 72, color: 'var(--cyan)' },
    { name: 'Reasoning', pct: 68, color: 'var(--purple)' },
    { name: 'English', pct: 81, color: 'var(--emerald)' },
    { name: 'Quantitative Aptitude', pct: 55, color: 'var(--amber)' },
    { name: 'Current Affairs', pct: 78, color: 'var(--blue)' },
    { name: 'History', pct: 63, color: 'var(--pink)' },
  ]
}

function AIRecommendation({ profile, exams }) {
  const primaryTarget = profile?.primaryTarget || (exams && exams[0]) || 'ias'
  
  const getTasksForTarget = (target) => {
    if (target === 'ias' || target === 'ips' || target === 'upsc') {
      return [
        { type: 'study', subject: 'Indian Polity', topic: 'Fundamental Rights', duration: '45 min', priority: 'high', reason: 'High weightage area for UPSC Prelims' },
        { type: 'quiz', subject: 'Current Affairs', topic: 'PIB & Hindu Daily Digest', duration: '20 min', priority: 'high', reason: 'Daily Current Affairs is crucial for UPSC' },
        { type: 'mock', subject: 'UPSC GS', topic: 'Polity Full Test', duration: '30 min', priority: 'medium', reason: 'Practice exam-level MCQs to test recall' },
        { type: 'revise', subject: 'Modern History', topic: 'Freedom Struggle (1857-1947)', duration: '30 min', priority: 'medium', reason: 'Revision required (not studied in 4 days)' },
        { type: 'study', subject: 'Indian Economy', topic: 'National Income Accounting', duration: '40 min', priority: 'low', reason: 'New chapter in your standard study plan' },
      ]
    } else if (target === 'ssc_cgl' || target?.startsWith('ssc')) {
      return [
        { type: 'study', subject: 'Quantitative Aptitude', topic: 'Percentage & Profit/Loss', duration: '45 min', priority: 'high', reason: 'Commonly asked CGL Tier 1/2 topic' },
        { type: 'quiz', subject: 'General Awareness', topic: 'Static GK History', duration: '15 min', priority: 'high', reason: 'Revise static GK to improve scoring speed' },
        { type: 'mock', subject: 'Reasoning', topic: 'Analogy & Classification', duration: '30 min', priority: 'medium', reason: 'Improve speed & accuracy in reasoning block' },
        { type: 'revise', subject: 'English', topic: 'Active/Passive & Direct/Indirect', duration: '30 min', priority: 'medium', reason: 'High weightage grammar chapter revision' },
        { type: 'study', subject: 'Quantitative Aptitude', topic: 'Geometry & Triangles', duration: '50 min', priority: 'low', reason: 'Target advanced maths section progress' },
      ]
    } else if (target?.includes('po') || target?.includes('clerk') || target?.includes('sbi') || target?.includes('ibps') || target === 'banking') {
      return [
        { type: 'study', subject: 'Quantitative Aptitude', topic: 'Data Interpretation (DI)', duration: '45 min', priority: 'high', reason: 'DI holds 50%+ weight in Bank PO mains' },
        { type: 'quiz', subject: 'Banking Awareness', topic: 'Monetary Policy & Inflation', duration: '20 min', priority: 'high', reason: 'Core banking syllabus concept review' },
        { type: 'mock', subject: 'Reasoning Ability', topic: 'Syllogism & Puzzles', duration: '40 min', priority: 'medium', reason: 'Puzzle solving speed booster session' },
        { type: 'revise', subject: 'English Language', topic: 'Reading Comprehension', duration: '30 min', priority: 'medium', reason: 'Daily comprehension practice' },
        { type: 'study', subject: 'Computer Aptitude', topic: 'Network Security Basics', duration: '25 min', priority: 'low', reason: 'Scoring sectional syllabus portion' },
      ]
    } else if (target === 'neet_ug') {
      return [
        { type: 'study', subject: 'Biology', topic: 'Genetics & Evolution', duration: '50 min', priority: 'high', reason: 'Extremely high weightage chapter in NEET' },
        { type: 'quiz', subject: 'Chemistry', topic: 'Periodic Table Trends', duration: '20 min', priority: 'high', reason: 'Inorganic chemistry core fundamentals review' },
        { type: 'mock', subject: 'Physics', topic: 'Mechanics & Kinematics', duration: '45 min', priority: 'medium', reason: 'Concept check MCQ practice set' },
        { type: 'revise', subject: 'Biology', topic: 'Human Physiology', duration: '30 min', priority: 'medium', reason: 'Systematic recall of anatomical diagrams' },
      ]
    } else if (target === 'jee_main' || target === 'jee_adv') {
      return [
        { type: 'study', subject: 'Mathematics', topic: 'Calculus & Integration', duration: '60 min', priority: 'high', reason: 'Crucial for scoring top JEE rank' },
        { type: 'quiz', subject: 'Physics', topic: 'Electromagnetism', duration: '25 min', priority: 'high', reason: 'Formula review & conceptual MCQ set' },
        { type: 'mock', subject: 'Chemistry', topic: 'Organic Reaction Mechanisms', duration: '40 min', priority: 'medium', reason: 'JEE-level multi-step reactions challenge' },
        { type: 'revise', subject: 'Mathematics', topic: 'Coordinate Geometry', duration: '30 min', priority: 'medium', reason: 'Solve previous years coordinate questions' },
      ]
    }
    return [
      { type: 'study', subject: 'General Knowledge', topic: 'Indian Polity & Governance', duration: '45 min', priority: 'high', reason: 'Weak area detected from last mock test' },
      { type: 'quiz', subject: 'Current Affairs', topic: 'Daily News Highlights', duration: '20 min', priority: 'high', reason: 'Daily Current Affairs is crucial for exams' },
      { type: 'mock', subject: 'General Aptitude', topic: 'Logical Reasoning Set', duration: '30 min', priority: 'medium', reason: 'Practice puzzle sets to build test speed' },
      { type: 'revise', subject: 'History', topic: 'Ancient India & Harappan Civilization', duration: '30 min', priority: 'medium', reason: 'Syllabus chapter revision schedule' },
    ]
  }

  const tasks = getTasksForTarget(primaryTarget)
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
  const top3 = getAutoUpdatedCurrentAffairs().slice(0, 3)
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

function LakshyaVisionBanner({ profile, primaryTarget }) {
  const examNames = { 
    upsc: 'UPSC Civil Services', 
    ias: 'IAS (Civil Services)', 
    ips: 'IPS (Police Services)', 
    ssc_cgl: 'SSC CGL (Central Govt)', 
    ibps_po: 'IBPS PO (Bank Officer)', 
    rrb_ntpc: 'RRB NTPC (Railways)', 
    neet_ug: 'NEET UG (Medical)', 
    jee_main: 'JEE Mains (Engineering)' 
  }
  
  const targetLabel = examNames[primaryTarget] || primaryTarget?.toUpperCase() || 'Government Exam'
  const slogan = profile?.lakshyaSlogan || `I will dedicate myself to cracking ${targetLabel} and achieving my dream career.`
  const daysLeft = getDaysRemaining(profile?.examDate, primaryTarget)

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, rgba(124,58,237,0.14) 0%, rgba(0,212,255,0.07) 100%)',
      border: '1px solid rgba(124,58,237,0.25)',
      borderRadius: 'var(--r-xl)',
      padding: '24px 28px',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 24,
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    }}>
      {/* Glow shapes */}
      <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: 220, height: 220, background: 'radial-gradient(circle, rgba(0,212,255,0.18) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: '-5%', bottom: '-30%', width: 180, height: 180, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 'var(--r-full)', padding: '5px 12px', fontSize: '0.72rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            🎯 MERA LAKSHYA — {targetLabel}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.4, color: 'white' }}>
            Target Year: {profile?.targetYear || '2026'}
          </h3>
          <p style={{ fontSize: '0.92rem', fontStyle: 'italic', margin: 0, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>
            "{slogan}"
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(5, 6, 10, 0.4)', border: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', borderRadius: 20, backdropFilter: 'blur(8px)', flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--cyan)', lineHeight: 1, textShadow: '0 0 10px rgba(0,212,255,0.3)' }}>{daysLeft}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Days Remaining</div>
          </div>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Focused Mode</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, background: 'var(--emerald)', borderRadius: '50%', display: 'inline-block' }} /> Live Prep Active
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useUserStore()
  const { streak, totalPoints, incrementStreak, addPoints } = useAppStore()
  const [greeting, setGreeting] = useState('')
  const [dailyQuiz, setDailyQuiz] = useState(null)
  const [quizAnswer, setQuizAnswer] = useState(null)

  const handleQuizAnswer = (optionIdx) => {
    setQuizAnswer(optionIdx)
    if (optionIdx === dailyQuiz.correct) {
      toast.success('Correct answer! +10 Points added to your preparation bank. Daily Lakshya streak extended! 🎯')
      addPoints(10)
    } else {
      toast.error('Incorrect. Review the concept explanation below to strengthen your understanding!')
    }
    incrementStreak()
  }

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')

    const primaryTarget = profile?.primaryTarget || (profile?.exams && profile.exams[0]) || 'ias'
    let bank = []
    if (primaryTarget === 'ias' || primaryTarget === 'ips' || primaryTarget === 'upsc') {
      if (QUESTION_BANK.upsc) {
        Object.values(QUESTION_BANK.upsc).forEach(subjList => {
          bank = bank.concat(subjList)
        })
      }
    } else if (primaryTarget === 'ssc_cgl' || primaryTarget?.startsWith('ssc')) {
      if (QUESTION_BANK.ssc_cgl) {
        Object.values(QUESTION_BANK.ssc_cgl).forEach(subjList => {
          bank = bank.concat(subjList)
        })
      }
    } else if (primaryTarget?.includes('po') || primaryTarget?.includes('clerk') || primaryTarget?.includes('sbi') || primaryTarget?.includes('ibps') || primaryTarget === 'banking') {
      if (QUESTION_BANK.ibps_po) {
        Object.values(QUESTION_BANK.ibps_po).forEach(subjList => {
          bank = bank.concat(subjList)
        })
      }
    }

    if (bank.length > 0) {
      const dayIdx = new Date().getDate() % bank.length
      setDailyQuiz(bank[dayIdx])
    } else {
      setDailyQuiz(DAILY_QUIZ_QUESTIONS[new Date().getDate() % DAILY_QUIZ_QUESTIONS.length])
    }
  }, [profile])

  const examNames = { upsc: 'UPSC', ias: 'IAS', ssc_cgl: 'SSC CGL', ibps_po: 'IBPS PO', rrb_ntpc: 'RRB NTPC', neet_ug: 'NEET', jee_main: 'JEE Mains' }
  const primaryTarget = profile?.primaryTarget || (profile?.exams && profile.exams[0]) || 'ias'

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

      {/* Mera Lakshya Vision Banner */}
      <LakshyaVisionBanner profile={profile} primaryTarget={primaryTarget} />

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon={<Flame size={20} color="var(--amber)" />} label="Day Streak" value={`${streak || 3} 🔥`} bg="var(--amber-10)" color="var(--amber)" />
        <StatCard icon={<Trophy size={20} color="var(--purple)" />} label="Total Points" value={(totalPoints || 2840).toLocaleString()} trend={12} bg="var(--purple-10)" />
        <StatCard icon={<ClipboardList size={20} color="var(--cyan)" />} label="Tests Taken" value="24" trend={8} bg="var(--cyan-10)" />
        <StatCard icon={<Target size={20} color="var(--emerald)" />} label="Accuracy" value="73.4%" trend={5} bg="var(--emerald-10)" />
      </div>

      {/* Smart Trial / Upgrade Banner */}
      {(() => {
        const sub = getSubscriptionStatus(profile?.subscription)
        if (sub.isPaid) return null // Premium user — no banner needed

        if (sub.isTrial && sub.isActive) {
          // Trial is running — show countdown with urgency coloring
          const urgent = sub.hoursLeft < 12
          const warning = sub.hoursLeft < 24
          const accentColor = urgent ? 'var(--red)' : warning ? 'var(--amber)' : 'var(--emerald)'
          const bgColor = urgent
            ? 'linear-gradient(135deg, rgba(239,68,68,0.14), rgba(239,68,68,0.06))'
            : warning
            ? 'linear-gradient(135deg, rgba(245,158,11,0.14), rgba(245,158,11,0.06))'
            : 'linear-gradient(135deg, rgba(16,185,129,0.14), rgba(0,212,255,0.08))'
          const borderColor = urgent ? 'rgba(239,68,68,0.35)' : warning ? 'rgba(245,158,11,0.35)' : 'rgba(16,185,129,0.35)'

          return (
            <div className="card card-p animate-fade-in" style={{
              marginBottom: 28,
              background: bgColor,
              border: `1px solid ${borderColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 16, padding: '18px 24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 260 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `rgba(${urgent ? '239,68,68' : warning ? '245,158,11' : '16,185,129'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Timer size={20} color={accentColor} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white', marginBottom: 2 }}>
                    {urgent ? '⚠️ Trial expires in ' : '🌟 Free Trial Active — '}
                    <span style={{ color: accentColor }}>
                      {sub.hoursLeft < 1 ? 'less than 1 hour' : sub.hoursLeft < 24 ? `${sub.hoursLeft}h left` : `${sub.daysLeft} day${sub.daysLeft !== 1 ? 's' : ''} left`}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
                    You have full premium access during your 2-day trial. Upgrade now to keep it going!
                  </div>
                </div>
              </div>
              <Link to="/app/profile" className="btn" style={{
                gap: 8, fontWeight: 700, flexShrink: 0,
                background: accentColor, color: 'white',
                boxShadow: `0 0 20px ${accentColor}55`
              }}>
                <Zap size={14} /> Upgrade — from ₹249/mo
              </Link>
            </div>
          )
        }

        // Trial expired or free plan — standard upgrade CTA
        return (
          <div className="card card-p animate-fade-in" style={{
            marginBottom: 28,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(0,212,255,0.12))',
            border: '1px solid rgba(124,58,237,0.3)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16, padding: '20px 24px'
          }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Star size={20} color="var(--amber)" style={{ fill: 'var(--amber)', flexShrink: 0 }} />
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>
                  {sub.isTrial && sub.isExpired ? '🔒 Your Free Trial has Ended' : 'Unlock All-Access Premium Prep 📎'}
                </h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>
                {sub.isTrial && sub.isExpired
                  ? 'Your 2-day free trial is over. Subscribe now to keep all premium features from just ₹249/month.'
                  : 'Starting at just ₹249/mo · Save 20% with our 6-month plan · Unlimited AI doubt solving, mock tests & more.'}
              </p>
            </div>
            <Link to="/app/profile" className="btn btn-primary" style={{ gap: 8, boxShadow: 'var(--glow-purple)', fontWeight: 700 }}>
              <Zap size={14} /> {sub.isTrial && sub.isExpired ? 'Subscribe Now' : 'Upgrade Now (from ₹249/mo)'}
            </Link>
          </div>
        )
      })()}

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
              {MOCK_TESTS.filter(t => {
                if (primaryTarget === 'ias' || primaryTarget === 'ips' || primaryTarget === 'upsc') {
                  return t.exam === 'upsc'
                }
                return t.exam === primaryTarget
              }).slice(0, 3).length > 0 ? (
                MOCK_TESTS.filter(t => {
                  if (primaryTarget === 'ias' || primaryTarget === 'ips' || primaryTarget === 'upsc') {
                    return t.exam === 'upsc'
                  }
                  return t.exam === primaryTarget
                }).slice(0, 3).map(test => (
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
                ))
              ) : (
                MOCK_TESTS.slice(0, 3).map(test => (
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
                ))
              )}
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
                  <button key={i} onClick={() => handleQuizAnswer(i)} className="option-btn"
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
          <TrendingUp size={18} color="var(--cyan)" /> Subject-wise Progress (Lakshya Syllabus)
        </h4>
        <div className="grid-3">
          {getSyllabusProgress(primaryTarget).map(s => (
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
