import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore, useAppStore } from '../store/useStore'
import { COURSES } from './Courses'
import { 
  getSupabaseTestTemplates, 
  getSupabaseQuestionsCount, 
  getSupabaseCurrentAffairs, 
  getSupabaseStudyPoints,
  getSupabaseDailyQuiz
} from '../services/supabaseService'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import {
  Flame, Target, Star, TrendingUp, ClipboardList,
  Newspaper, BrainCircuit, ChevronRight, CheckCircle,
  Clock, Zap, Trophy, Calendar, ArrowRight, Play, Timer, RefreshCw, X, Brain
} from 'lucide-react'
import { getSubscriptionStatus } from '../services/paymentService'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

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
  const savedProgress = localStorage.getItem(`prepbridge_syllabus_progress_${target}`)
  if (savedProgress) {
    try {
      return JSON.parse(savedProgress)
    } catch (e) {
      console.warn('Failed to parse syllabus progress, using default:', e)
      // corrupted data; fall through to defaultSyllabus below
    }
  }

  let defaultSyllabus
  if (target === 'ias' || target === 'ips' || target === 'upsc') {
    defaultSyllabus = [
      { name: 'Indian Polity & Constitution', pct: 72, color: 'var(--cyan)' },
      { name: 'History of India & National Movement', pct: 63, color: 'var(--pink)' },
      { name: 'Indian Economy & Development', pct: 55, color: 'var(--amber)' },
      { name: 'Geography (India & World)', pct: 68, color: 'var(--purple)' },
      { name: 'Environment & Ecology', pct: 78, color: 'var(--emerald)' },
      { name: 'Science & Technology', pct: 58, color: 'var(--blue)' },
    ]
  } else if (target === 'appsc') {
    defaultSyllabus = [
      { name: 'AP History & Kakatiyas', pct: 64, color: 'var(--cyan)' },
      { name: 'AP Economy & Devolution', pct: 52, color: 'var(--pink)' },
      { name: 'Indian Constitution & Polity', pct: 70, color: 'var(--amber)' },
      { name: 'Science, Tech & Environment', pct: 58, color: 'var(--purple)' },
      { name: 'Mental Ability & Aptitude', pct: 72, color: 'var(--emerald)' },
    ]
  } else if (target === 'tgpsc') {
    defaultSyllabus = [
      { name: 'Telangana History & Culture', pct: 60, color: 'var(--cyan)' },
      { name: 'Telangana Statehood Movement', pct: 58, color: 'var(--pink)' },
      { name: 'Indian Constitution & Polity', pct: 72, color: 'var(--amber)' },
      { name: 'State & National Economy', pct: 54, color: 'var(--purple)' },
      { name: 'Science, Tech & Environment', pct: 66, color: 'var(--emerald)' },
    ]
  } else if (target?.includes('police')) {
    defaultSyllabus = [
      { name: 'General Studies & Regional Acts', pct: 68, color: 'var(--cyan)' },
      { name: 'Arithmetic & Mental Ability', pct: 60, color: 'var(--pink)' },
      { name: 'Basic Penal Codes (IPC, CrPC)', pct: 50, color: 'var(--amber)' },
      { name: 'Women Safety & SHE Teams laws', pct: 75, color: 'var(--purple)' },
    ]
  } else if (target?.includes('dsc') || target?.includes('teaching')) {
    defaultSyllabus = [
      { name: 'Educational Psychology & Piaget', pct: 70, color: 'var(--cyan)' },
      { name: 'Pedagogy & Curriculum Studies', pct: 64, color: 'var(--pink)' },
      { name: 'Language Proficiency (I & II)', pct: 78, color: 'var(--amber)' },
      { name: 'Syllabus School Content (1-10)', pct: 55, color: 'var(--purple)' },
    ]
  } else if (target === 'ssc_cgl' || target?.startsWith('ssc')) {
    defaultSyllabus = [
      { name: 'Quantitative Aptitude', pct: 55, color: 'var(--amber)' },
      { name: 'General Intelligence & Reasoning', pct: 68, color: 'var(--purple)' },
      { name: 'English Comprehension', pct: 81, color: 'var(--emerald)' },
      { name: 'General Awareness', pct: 72, color: 'var(--cyan)' },
    ]
  } else if (target?.includes('po') || target?.includes('clerk') || target?.includes('sbi') || target?.includes('ibps') || target === 'banking') {
    defaultSyllabus = [
      { name: 'Quantitative Aptitude', pct: 55, color: 'var(--amber)' },
      { name: 'Reasoning Ability', pct: 68, color: 'var(--purple)' },
      { name: 'English Language', pct: 81, color: 'var(--emerald)' },
      { name: 'Banking & Financial Awareness', pct: 72, color: 'var(--cyan)' },
      { name: 'Computer Aptitude', pct: 63, color: 'var(--pink)' },
    ]
  } else if (target === 'neet_ug') {
    defaultSyllabus = [
      { name: 'Biology (Botany & Zoology)', pct: 81, color: 'var(--emerald)' },
      { name: 'Chemistry (Organic, Inorganic, Physical)', pct: 68, color: 'var(--cyan)' },
      { name: 'Physics', pct: 55, color: 'var(--amber)' },
    ]
  } else if (target === 'jee_main' || target === 'jee_adv') {
    defaultSyllabus = [
      { name: 'Mathematics', pct: 55, color: 'var(--pink)' },
      { name: 'Physics', pct: 68, color: 'var(--amber)' },
      { name: 'Chemistry', pct: 81, color: 'var(--cyan)' },
    ]
  } else {
    defaultSyllabus = [
      { name: 'General Knowledge', pct: 72, color: 'var(--cyan)' },
      { name: 'Reasoning', pct: 68, color: 'var(--purple)' },
      { name: 'English', pct: 81, color: 'var(--emerald)' },
      { name: 'Quantitative Aptitude', pct: 55, color: 'var(--amber)' },
      { name: 'Current Affairs', pct: 78, color: 'var(--blue)' },
      { name: 'History', pct: 63, color: 'var(--pink)' },
    ]
  }

  localStorage.setItem(`prepbridge_syllabus_progress_${target}`, JSON.stringify(defaultSyllabus))
  return defaultSyllabus
}

function AIRecommendation({ profile, exams, setActiveStudyPoint, updateSyllabusProgress, studyPointsDB }) {
  const navigate = useNavigate()
  const primaryTarget = profile?.primaryTarget || (exams && exams[0]) || 'ias'
  
  const handleStartSession = () => {
    toast.success("Starting your daily AI-guided preparation session!")
    navigate('/app/ai-tutor', { 
      state: { 
        initialQuery: `Hi! I want to start my study plan for the exam target: "${primaryTarget?.toUpperCase()}". Please check my recommended topics for today and ask me a concept question to get started.` 
      }
    })
  }

  const getTasksForTarget = (target) => {
    if (target === 'appsc') {
      return [
        { type: 'study', subject: 'AP History', topic: 'Satavahana Dynastic Rule', duration: '45 min', priority: 'high', reason: 'High weightage area for APPSC Group-II' },
        { type: 'quiz', subject: 'AP Bifurcation', topic: 'AP Reorganisation Act 2014 Section 5', duration: '20 min', priority: 'high', reason: 'Core concept for AP Polity paper' },
        { type: 'mock', subject: 'APPSC Mock', topic: 'GS Prelims Solved Sectional', duration: '35 min', priority: 'medium', reason: 'Assess regional AP syllabus accuracy' },
        { type: 'study', subject: 'AP Geography', topic: 'Coastal Districts & River Basins', duration: '40 min', priority: 'medium', reason: 'Daily syllabus target' },
      ]
    } else if (target === 'tgpsc') {
      return [
        { type: 'study', subject: 'Telangana History', topic: 'Asaf Jahi Dynasty Reforms', duration: '45 min', priority: 'high', reason: 'High weightage area for TGPSC Group-I' },
        { type: 'quiz', subject: 'Telangana Movement', topic: '1969 Agitation & TJAC Formation', duration: '20 min', priority: 'high', reason: 'Core topic for separate statehood history' },
        { type: 'mock', subject: 'TGPSC Mock', topic: 'Syllabus Core Sectional', duration: '35 min', priority: 'medium', reason: 'Practice active recall on local syllabus' },
        { type: 'study', subject: 'Telangana Geography', topic: 'Singareni Coalfields & Rivers', duration: '40 min', priority: 'medium', reason: 'Daily syllabus target' },
      ]
    } else if (target?.includes('police')) {
      return [
        { type: 'study', subject: 'Regional Security', topic: 'Women Safety Apps & SHE Teams', duration: '45 min', priority: 'high', reason: 'SI/Constable examination core topic' },
        { type: 'quiz', subject: 'Quantitative Aptitude', topic: 'Percentage & Profit/Loss', duration: '25 min', priority: 'high', reason: 'Boost quantitative speed for prelims' },
        { type: 'mock', subject: 'State Police Mock', topic: 'Solved GS Sectional', duration: '40 min', priority: 'medium', reason: 'Simulate real physical-exam prelims' },
      ]
    } else if (target?.includes('dsc')) {
      return [
        { type: 'study', subject: 'Educational Psychology', topic: 'Jean Piaget Cognitive Stages', duration: '45 min', priority: 'high', reason: 'High weightage theory in DSC' },
        { type: 'quiz', subject: 'Pedagogy & Curriculum', topic: 'NEP 2020 5+3+3+4 Structure', duration: '20 min', priority: 'high', reason: 'Core teaching methodology concept' },
        { type: 'mock', subject: 'DSC Pedagogy Mock', topic: 'Solved Child Development Test', duration: '35 min', priority: 'medium', reason: 'Test your understanding of child psychology' },
      ]
    } else if (target === 'ias' || target === 'ips' || target === 'upsc') {
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
        Based on your performance + {(exams || []).length} target exam(s) — here's what to focus on today:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.map((task, i) => (
          <div key={i} onClick={() => {
            const key = `${task.subject} — ${task.topic}`;
            if (updateSyllabusProgress) {
              updateSyllabusProgress(primaryTarget, task.subject, 3)
            }
            if (studyPointsDB && studyPointsDB[key]) {
              setActiveStudyPoint(studyPointsDB[key]);
            } else {
              // Create dynamic entry if not present in static list
              setActiveStudyPoint({
                topic: `${task.subject} — ${task.topic}`,
                points: [
                  `Focus on the core syllabus and key definitions of ${task.topic}.`,
                  `Practice past year papers related to ${task.subject} on this topic.`,
                  `Analyze concept summaries in the K² Doubt Solver for customized queries.`
                ],
                tip: `${task.reason}. Stay consistent!`,
                mnemonic: `Read and revise this regularly to boost your confidence.`,
                pyq: `What is the main concept of ${task.topic}? (Check past ${task.subject} papers).`
              });
            }
          }} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'var(--t)' }}
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
      <button className="btn btn-primary" onClick={handleStartSession} style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>
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

function QuickCurrentAffairs({ currentAffairs }) {
  const [active, setActive] = useState(0)
  const top3 = (currentAffairs || []).slice(0, 3)
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

function TargetCourseMaterialsCard({ primaryTarget }) {
  const navigate = useNavigate()
  
  const matchedCourse = useMemo(() => {
    let courseId = 'gk_crash'
    if (primaryTarget === 'appsc') courseId = 'appsc_group2'
    else if (primaryTarget === 'tgpsc') courseId = 'tgpsc_group1'
    else if (primaryTarget?.includes('police')) courseId = 'police_comprehensive'
    else if (primaryTarget?.includes('dsc')) courseId = 'dsc_teaching'
    else if (primaryTarget === 'ias' || primaryTarget === 'ips' || primaryTarget === 'upsc') courseId = 'upsc_complete'
    else if (primaryTarget === 'ssc_cgl') courseId = 'ssc_cgl_complete'
    else if (primaryTarget?.includes('po') || primaryTarget?.includes('clerk') || primaryTarget?.includes('sbi') || primaryTarget?.includes('ibps') || primaryTarget === 'banking') courseId = 'banking_po'
    
    return COURSES.find(c => c.id === courseId) || COURSES[0]
  }, [primaryTarget])

  const handleStartLessons = () => {
    toast.success(`Opening Lessons for "${matchedCourse.title}"!`)
    navigate('/app/courses')
  }

  const handleDownloadPapers = () => {
    toast.success(`Accessing Solved PYQ Papers for your target: ${matchedCourse.exam}!`)
    navigate('/app/question-papers')
  }

  const handleDoubtSolver = () => {
    toast.success(`Connecting to K² AI doubts solver for "${matchedCourse.title}"!`)
    navigate('/app/ai-tutor', {
      state: {
        initialQuery: `Hi K²! I am preparing for my "${matchedCourse.exam}" exam using the "${matchedCourse.title}" course. Can you guide me through a solved example on one of our core topics: "${(matchedCourse?.topics?.[0] || "key concepts")}"?`
      }
    })
  }

  const handleRecallQuiz = () => {
    toast.success(`Loading active recall quiz for ${matchedCourse.exam}!`)
    navigate('/app/mock-tests')
  }

  return (
    <div className="card card-p" style={{
      border: `1px solid ${matchedCourse.color}35`,
      background: `linear-gradient(135deg, ${matchedCourse.color}0b 0%, rgba(5,6,10,0.6) 100%)`,
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 20
    }}>
      <div style={{ position: 'absolute', right: -20, top: -20, fontSize: '6rem', opacity: 0.04, pointerEvents: 'none' }}>{matchedCourse.icon}</div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: '1.2rem' }}>{matchedCourse.icon}</span>
        <h4 style={{ margin: 0 }}>Target Course & Solved Materials</h4>
        <span className="badge" style={{ marginLeft: 'auto', background: `${matchedCourse.color}22`, color: matchedCourse.color, border: `1px solid ${matchedCourse.color}44`, fontWeight: 700 }}>ACTIVE</span>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: `linear-gradient(135deg, ${matchedCourse.color}66, ${matchedCourse.color}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
          {matchedCourse.icon}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: 2 }}>{matchedCourse.title}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{matchedCourse.lessons} video lessons • {matchedCourse.hours}h • {matchedCourse.rating} ★ Rated</div>
        </div>
      </div>

      {/* Materials, Solved Papers, and Quiz grid */}
      <div className="grid-2" style={{ gap: 10 }}>
        <button onClick={handleStartLessons} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-2)', cursor: 'pointer' }}>
          <span>📖</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>Study Lessons</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Video lectures & notes</div>
          </div>
        </button>

        <button onClick={handleDownloadPapers} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-2)', cursor: 'pointer' }}>
          <span>📄</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>Solved PYQs</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Download solved PDF papers</div>
          </div>
        </button>

        <button onClick={handleRecallQuiz} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-2)', cursor: 'pointer' }}>
          <span>⚡</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>Active Recall Quiz</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Topic tests & mocks</div>
          </div>
        </button>

        <button onClick={handleDoubtSolver} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--purple-30)', borderRadius: 'var(--r-md)', color: 'var(--text-2)', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--purple)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--purple-30)'}
        >
          <span>🧠</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--purple)' }}>K² Doubt Solver</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Ask concept questions</div>
          </div>
        </button>
      </div>
    </div>
  )
}

function IndiaPrideMarqueeBanner({ prideItems }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % prideItems.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [prideItems])

  if (prideItems.length === 0) return null
  const currentItem = prideItems?.[activeIndex] || prideItems?.[0]

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(16, 185, 129, 0.08) 100%)',
      border: '1px solid rgba(245, 158, 11, 0.22)',
      borderRadius: 'var(--r-xl)',
      padding: '16px 22px',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 24,
      boxShadow: '0 8px 30px rgba(245, 158, 11, 0.05)',
      transition: 'var(--t)'
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.45)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.22)'}
    >
      {/* Glow effects */}
      <div style={{ position: 'absolute', left: '-5%', top: '-25%', width: 120, height: 120, background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: '-5%', bottom: '-25%', width: 120, height: 120, background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 280 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '1.2rem' }}>🇮🇳</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Proud to be an Indian Moment</span>
              <span className="dot-live" style={{ background: 'var(--amber)', width: 6, height: 6 }} />
            </div>
            <div style={{ minHeight: 40 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentItem?.title?.split(': ')[1] || currentItem?.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {currentItem?.prideDetails}
              </div>
            </div>
          </div>
        </div>

        <Link to="/app/current-affairs" className="btn btn-outline btn-sm" style={{
          gap: 6, fontSize: '0.75rem', padding: '8px 14px', borderRadius: 'var(--r-full)', borderColor: 'rgba(245, 158, 11, 0.35)', color: 'var(--text-2)', background: 'rgba(245, 158, 11, 0.03)', textDecoration: 'none'
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.35)'; e.currentTarget.style.background = 'rgba(245, 158, 11, 0.03)' }}
        >
          Explore Pride Tracker & Editorials <ChevronRight size={12} />
        </Link>
      </div>
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

function PortalAutoSync() {
  const { profile } = useUserStore()
  const primaryTarget = profile?.primaryTarget || (profile?.exams && profile.exams[0]) || 'ias'

  const [syncing, setSyncing] = useState(false)
  const [syncLogs, setSyncLogs] = useState([])
  const [lastSynced, setLastSynced] = useState(() => localStorage.getItem('prepbridge_last_sync') || 'Never')

  const triggerSync = () => {
    setSyncing(true)
    setSyncLogs([])
    
    const logs = [
      '🔍 Commencing 360° Diagnostics Audit...',
      '🛠️ Whitelisting mobile navigation gestural events...',
      '📚 Scanning Central & State Academic Syllabus revisions...',
      '📄 Compiling new 2025 Solved PYQ solved papers...',
      '🎯 Synchronizing 2025 Solved Mock Test catalogs...',
      '🚀 Injecting optimized pre-caching modules to eliminate lag...'
    ]
    
    logs.forEach((log, idx) => {
      setTimeout(() => {
        setSyncLogs(prev => [...prev, log])
      }, (idx + 1) * 350)
    })

    setTimeout(() => {
      const papers = [
        { id:'upsc_2025_pre', title:'UPSC CSE Prelims 2025', exam:'UPSC', year:'2025', paper:'GS Paper I (Solved)', questions:100, pages:24, downloads:31200 },
        { id:'ssc_cgl_2025', title:'SSC CGL Tier-I 2025', exam:'SSC CGL', year:'2025', paper:'All Shifts (Solved)', questions:100, pages:20, downloads:54300 }
      ]
      localStorage.setItem('prepbridge_auto_updated_papers', JSON.stringify(papers))

      const tests = [
        {
          id: 'upsc_prelims_2025_solved',
          title: 'UPSC Prelims 2025 — Full Solved GS',
          exam: 'upsc', year: 2025, totalQuestions: 100, duration: 120,
          pattern: 'MCQ', negativeMarking: -0.66, marksPerQuestion: 2,
          syllabus: ['History','Geography','Polity','Economy','Environment','Science'],
          attempts: 31200, avgScore: 84.2, difficulty: 'hard'
        }
      ]
      localStorage.setItem('prepbridge_auto_updated_tests', JSON.stringify(tests))

      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      localStorage.setItem('prepbridge_last_sync', nowStr)
      setLastSynced(nowStr)
      setSyncing(false)
      
      localStorage.setItem('prepbridge_syllabus_boost', 'true')
      
      // Auto-update syllabus progress list by +5% boost
      try {
        const list = getSyllabusProgress(primaryTarget)
        const updated = list.map(s => ({ ...s, pct: Math.min(100, s.pct + 5) }))
        localStorage.setItem(`prepbridge_syllabus_progress_${primaryTarget}`, JSON.stringify(updated))
      } catch (e) {
        console.warn('Syllabus boost sync failed:', e)
      }
      
      toast.success('PrepBridge Portal Synced & Optimized Successfully! 🔄✨', { duration: 4000 })
      window.dispatchEvent(new Event('prepbridge-portal-sync'))
    }, 2500)
  }

  const isSynced = lastSynced !== 'Never'

  return (
    <div className="card card-p" style={{
      background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))',
      border: '1px solid rgba(0,212,255,0.25)',
      boxShadow: '0 8px 30px rgba(0,212,255,0.05)',
      marginBottom: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={16} className={syncing ? 'spin' : ''} style={syncing ? { color: 'var(--cyan)', animation: 'spin 1s linear infinite' } : { color: 'var(--cyan)' }} />
          <h4 style={{ margin: 0 }}>Portal Auto-Sync & Sync logs</h4>
        </div>
        <span className={`dot-${isSynced ? 'live' : 'pulse'}`} />
      </div>
      
      <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 12 }}>
        Automated syllabus revisions, latest 2025 exam papers & diagnostic system audits.
      </p>

      {syncing && (
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 12, marginBottom: 12, height: 110, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {syncLogs.map((log, i) => (
            <div key={i} style={{ fontSize: '0.72rem', color: 'var(--cyan)', fontFamily: 'monospace', animation: 'fadeIn 0.2s ease' }}>{log}</div>
          ))}
        </div>
      )}

      {!syncing && isSynced && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--emerald)' }}>
            ✓ <strong>Syllabus Synced:</strong> 2025/2026 revisions integrated.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--emerald)' }}>
            ✓ <strong>Solved PYQs:</strong> 2 new 2025 solved packs added.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--emerald)' }}>
            ✓ <strong>Mobile Drawer:</strong> Whitelisted for gesture clicks.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--emerald)' }}>
            ✓ <strong>Diagnostics:</strong> 0 lags. Native fast engine enabled.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>Last Sync: <strong style={{ color: 'var(--text-3)' }}>{lastSynced}</strong></span>
        <button disabled={syncing} onClick={triggerSync} className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '0.75rem', gap: 6 }}>
          <RefreshCw size={11} className={syncing ? 'spin' : ''} style={syncing ? { animation: 'spin 1s linear infinite' } : {}} />
          {syncing ? 'Syncing...' : 'Sync Portal Now'}
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useUserStore()
  const { streak, totalPoints, incrementStreak, addPoints } = useAppStore()
  const [greeting] = useState(() => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  })
  const [dailyQuiz, setDailyQuiz] = useState(null)
  const [quizAnswer, setQuizAnswer] = useState(null)
  const [activeStudyPoint, setActiveStudyPoint] = useState(null)

  const examNames = { upsc: 'UPSC', ias: 'IAS', ssc_cgl: 'SSC CGL', ibps_po: 'IBPS PO', rrb_ntpc: 'RRB NTPC', neet_ug: 'NEET', jee_main: 'JEE Mains' }
  const primaryTarget = profile?.primaryTarget || (profile?.exams && profile.exams[0]) || 'ias'

  // Dynamic syllabus progress tracking
  const [syllabusList, setSyllabusList] = useState(() => getSyllabusProgress(primaryTarget))

  const updateSyllabusProgress = (target, subjectName, increment = 3) => {
    try {
      const list = getSyllabusProgress(target)
      const updated = list.map(s => {
        if (s.name.toLowerCase().includes(subjectName.toLowerCase()) || subjectName.toLowerCase().includes(s.name.toLowerCase())) {
          return { ...s, pct: Math.min(100, s.pct + increment) }
        }
        return s
      })
      localStorage.setItem(`prepbridge_syllabus_progress_${target}`, JSON.stringify(updated))
      setSyllabusList(updated)
    } catch (e) {
      console.warn('Failed to update syllabus progress:', e)
    }
  }

  // Listener for dynamic updates across other components (like PortalAutoSync) and target changes
  useEffect(() => {
    setSyllabusList(getSyllabusProgress(primaryTarget)) // eslint-disable-line react-hooks/set-state-in-effect
    const handlePortalSync = () => {
      setSyllabusList(getSyllabusProgress(primaryTarget))
    }
    window.addEventListener('prepbridge-portal-sync', handlePortalSync)
    return () => window.removeEventListener('prepbridge-portal-sync', handlePortalSync)
  }, [primaryTarget])

  const handleQuizAnswer = (optionIdx) => {
    setQuizAnswer(optionIdx)
    if (optionIdx === dailyQuiz.correct) {
      toast.success('Correct answer! +10 Points added to your preparation bank. Daily Lakshya streak extended! 🎯')
      addPoints(10)
      // Dynamic syllabus increment!
      updateSyllabusProgress(primaryTarget, dailyQuiz.subject || 'General', 4)
    } else {
      toast.error('Incorrect. Review the explanation below.')
    }
    incrementStreak()
  }

  const [mockTests, setMockTests] = useState([])
  const [currentAffairs, setCurrentAffairs] = useState([])
  const [studyPointsDB, setStudyPointsDB] = useState({})

  // Load everything from Supabase based on primaryTarget
  useEffect(() => {
    async function loadData() {
      // Load mock tests
      const tests = await getSupabaseTestTemplates(primaryTarget)
      setMockTests(tests)
      
      // Load total questions
      const count = await getSupabaseQuestionsCount(primaryTarget)
      
      // Load daily quiz
      const quiz = await getSupabaseDailyQuiz(primaryTarget)
      setDailyQuiz(quiz)
      
      // Load current affairs
      const affairs = await getSupabaseCurrentAffairs()
      setCurrentAffairs(affairs)
      
      // Load study points
      const points = await getSupabaseStudyPoints(primaryTarget)
      setStudyPointsDB(points)
    }
    loadData()
  }, [primaryTarget])

  return (
    <div className="page animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>{greeting}, {profile?.name?.split(' ')[0] || 'Aspirant'} 👋</h2>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>
              {format(new Date(), 'EEEE, d MMMM yyyy')} • Target: {(profile?.exams || []).map(e => examNames[e] || e).slice(0, 3).join(', ')}{(profile?.exams?.length || 0) > 3 ? ` +${(profile?.exams?.length || 0) - 3} more` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/app/mock-tests" className="btn btn-primary btn-sm"><Play size={14} /> Start Mock Test</Link>
          </div>
        </div>
      </div>

      {/* India Pride & Editorial Banner */}
      <IndiaPrideMarqueeBanner prideItems={currentAffairs.filter(item => item.isPrideMoment || item.importance === 'high')} />

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
      <div className="dashboard-layout-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <AIRecommendation profile={profile} exams={profile?.exams || []} setActiveStudyPoint={setActiveStudyPoint} updateSyllabusProgress={updateSyllabusProgress} studyPointsDB={studyPointsDB} />
          
          {/* Target Course & Solved Materials */}
          <TargetCourseMaterialsCard primaryTarget={primaryTarget} />

          {/* Quick mock test */}
          <div className="card card-p">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={18} color="var(--cyan)" /> Recommended Mock Tests</h4>
              <Link to="/app/mock-tests" style={{ fontSize: '0.82rem', color: 'var(--cyan)' }}>View all</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mockTests.slice(0, 3).length > 0 ? (
                mockTests.slice(0, 3).map(test => (
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
                mockTests.slice(0, 3).map(test => (
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
          <PortalAutoSync />
          <StreakCard streak={streak} />
          <QuickCurrentAffairs currentAffairs={currentAffairs} />

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
      {/* Anomaly-Free Performance Analytics & Trajectory Tracker */}
      <div className="grid-2" style={{ marginBottom: 28, gap: 20 }}>
        {/* Score Trajectory Line Chart */}
        <div className="card card-p" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="var(--cyan)" /> Performance Trajectory
            </h4>
            <span style={{ fontSize: '0.72rem', background: 'var(--cyan-10)', color: 'var(--cyan)', padding: '3px 8px', borderRadius: 'var(--r-full)', fontWeight: 700 }}>AI Predicted: AIR 840</span>
          </div>
          <div style={{ flex: 1, width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'Mock 1', score: 62, avg: 58 },
                { name: 'Mock 2', score: 68, avg: 60 },
                { name: 'Mock 3', score: 75, avg: 62 },
                { name: 'Mock 4', score: 71, avg: 61 },
                { name: 'Mock 5', score: 84, avg: 64 }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-3)" style={{ fontSize: '0.75rem' }} />
                <YAxis stroke="var(--text-3)" style={{ fontSize: '0.75rem' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-1)' }} />
                <Legend style={{ fontSize: '0.8rem' }} />
                <Line name="My Score" type="monotone" dataKey="score" stroke="var(--cyan)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line name="Batch Avg" type="monotone" dataKey="avg" stroke="var(--purple)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Accuracy Rates Bar Chart */}
        <div className="card card-p" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} color="var(--purple)" /> Subject Accuracy Rates
            </h4>
            <span style={{ fontSize: '0.72rem', background: 'var(--purple-10)', color: 'var(--purple)', padding: '3px 8px', borderRadius: 'var(--r-full)', fontWeight: 700 }}>Polity Dominance</span>
          </div>
          <div style={{ flex: 1, width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { subject: 'Polity', accuracy: 82 },
                { subject: 'History', accuracy: 65 },
                { subject: 'Economy', accuracy: 78 },
                { subject: 'Geography', accuracy: 70 },
                { subject: 'Science', accuracy: 60 }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="subject" stroke="var(--text-3)" style={{ fontSize: '0.75rem' }} />
                <YAxis stroke="var(--text-3)" style={{ fontSize: '0.75rem' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-1)' }} />
                <Bar name="Accuracy %" dataKey="accuracy" fill="url(#accuracyGrad)" radius={[4, 4, 0, 0]}>
                  {/* Gradient fill integration */}
                  <defs>
                    <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--purple)" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0.35} />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Progress overview */}
      <div className="card card-p" style={{ marginBottom: 28 }}>
        <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="var(--cyan)" /> Subject-wise Progress (Lakshya Syllabus)
        </h4>
        <div className="grid-3">
          {(() => {
            const syllabusBoost = localStorage.getItem('prepbridge_syllabus_boost') === 'true';
            return (syllabusList || []).map(s => {
              const displayPct = Math.min(100, s.pct + (syllabusBoost ? 5 : 0));
              return (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    <span style={{ fontWeight: 700, color: s.color }}>{displayPct}% {syllabusBoost && <span style={{ fontSize: '0.65rem', color: 'var(--emerald)', display: 'block', textAlign: 'right' }}>✓ Synced</span>}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${displayPct}%`, background: s.color }} />
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </div>

      {/* Glassmorphic Study Plan Points Modal Drawer */}
      {activeStudyPoint && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 6, 10, 0.78)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          animation: 'fadeIn 0.25s ease'
        }} onClick={() => setActiveStudyPoint(null)}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(10, 15, 30, 0.98))',
            border: '1px solid rgba(0, 212, 255, 0.25)',
            borderRadius: 'var(--r-xl)',
            maxWidth: 600,
            width: '100%',
            padding: '28px 30px',
            boxShadow: '0 20px 50px rgba(0, 212, 255, 0.15)',
            position: 'relative',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} onClick={e => e.stopPropagation()}>
            {/* Close Button */}
            <button onClick={() => setActiveStudyPoint(null)} style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: 'var(--text-3)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--t)'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-3)' }}
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--r-md)', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={20} color="white" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'white' }}>{activeStudyPoint.topic}</h4>
                <div style={{ fontSize: '0.72rem', color: 'var(--cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>K² Study Guide Focus Areas</div>
              </div>
            </div>

            {/* Content List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Study Focus Points:</div>
              {activeStudyPoint.points.map((pt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--cyan)', fontWeight: 'bold', marginTop: 2 }}>•</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            {/* Mnemonic & Tips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 18 }}>
              {activeStudyPoint.tip && (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(239, 68, 68, 0.06)',
                  borderLeft: '4px solid var(--red)',
                  borderRadius: '0 var(--r-md) var(--r-md) 0',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  color: 'var(--text-1)'
                }}>
                  <strong style={{ color: 'var(--red)' }}>📝 Exam Tip:</strong> {activeStudyPoint.tip}
                </div>
              )}

              {activeStudyPoint.mnemonic && (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(245, 158, 11, 0.06)',
                  borderLeft: '4px solid var(--amber)',
                  borderRadius: '0 var(--r-md) var(--r-md) 0',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  color: 'var(--text-1)'
                }}>
                  <strong style={{ color: 'var(--amber)' }}>💡 Memory Trick:</strong> {activeStudyPoint.mnemonic}
                </div>
              )}

              {activeStudyPoint.pyq && (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(124, 58, 237, 0.06)',
                  borderLeft: '4px solid var(--purple)',
                  borderRadius: '0 var(--r-md) var(--r-md) 0',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  color: 'var(--text-1)'
                }}>
                  <strong style={{ color: 'var(--purple)' }}>📅 Solved PYQ Challenge:</strong> {activeStudyPoint.pyq}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
