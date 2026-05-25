import React, { useState } from 'react'
import { BookOpen, Clock, Star, Users, ChevronRight, Play, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const COURSES = [
  {
    id: 'upsc_complete', title: 'UPSC CSE Complete Course', exam: 'UPSC', icon: '🏛️',
    color: '#7c3aed', lessons: 320, hours: 480, students: 45000, rating: 4.9,
    topics: ['History & Culture','Geography','Indian Polity','Economy','Environment','Science & Tech','Current Affairs'],
    free: false, instructor: 'PrepBridge Expert Team'
  },
  {
    id: 'ssc_cgl_complete', title: 'SSC CGL Tier 1+2 Complete', exam: 'SSC CGL', icon: '📋',
    color: '#0080ff', lessons: 220, hours: 280, students: 89000, rating: 4.8,
    topics: ['Quantitative Aptitude','English Language','Reasoning','General Awareness'],
    free: false, instructor: 'PrepBridge Expert Team'
  },
  {
    id: 'banking_po', title: 'Banking PO Crash Course', exam: 'IBPS PO / SBI PO', icon: '🏦',
    color: '#059669', lessons: 180, hours: 220, students: 67000, rating: 4.8,
    topics: ['Banking Awareness','English','Reasoning','Maths','Data Interpretation'],
    free: false, instructor: 'PrepBridge Expert Team'
  },
  {
    id: 'rrb_ntpc', title: 'RRB NTPC CBT 1+2 Course', exam: 'RRB NTPC', icon: '🚂',
    color: '#dc2626', lessons: 160, hours: 200, students: 120000, rating: 4.7,
    topics: ['Mathematics','General Intelligence','General Awareness','Technical Ability'],
    free: false, instructor: 'PrepBridge Expert Team'
  },
  {
    id: 'neet_physics', title: 'NEET Physics Foundation', exam: 'NEET UG', icon: '⚕️',
    color: '#dc2626', lessons: 120, hours: 160, students: 34000, rating: 4.9,
    topics: ['Mechanics','Thermodynamics','Optics','Electromagnetism','Modern Physics'],
    free: true, instructor: 'PrepBridge Expert Team'
  },
  {
    id: 'gk_crash', title: 'Static GK Master Class', exam: 'All Exams', icon: '🌍',
    color: '#d97706', lessons: 80, hours: 60, students: 200000, rating: 4.8,
    topics: ['India & World Geography','History','Polity Basics','Sports & Awards','Important Days'],
    free: true, instructor: 'PrepBridge Expert Team'
  },
  {
    id: 'current_affairs_monthly', title: 'Current Affairs Monthly Digest', exam: 'All Exams', icon: '📰',
    color: '#0891b2', lessons: 60, hours: 40, students: 312000, rating: 4.9,
    topics: ['National News','International Events','Economy','Sports','Science & Tech','Government Schemes'],
    free: false, instructor: 'PrepBridge News Team'
  },
  {
    id: 'reasoning_tricks', title: 'Reasoning Tricks & Shortcuts', exam: 'SSC/Banking/Railways', icon: '🧠',
    color: '#7c3aed', lessons: 90, hours: 70, students: 156000, rating: 4.8,
    topics: ['Puzzles','Syllogism','Blood Relations','Coding-Decoding','Analogy','Series'],
    free: true, instructor: 'PrepBridge Expert Team'
  },
]

export default function Courses() {
  const [filter, setFilter] = useState('all')
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const navigate = useNavigate()

  const filtered = COURSES.filter(c => {
    if (showFreeOnly && !c.free) return false
    if (filter === 'free' && !c.free) return false
    if (filter === 'all') return true
    return c.exam.toLowerCase().includes(filter.toLowerCase())
  })

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Courses & Notes 📖</h1>
          <p className="page-subtitle">Expert-curated video courses, notes, and study material for all exams</p>
        </div>
        <div className="stat-pill">🎓 {COURSES.reduce((a,c) => a+c.lessons,0)}+ Lessons</div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        {[['all','All Courses'],['upsc','UPSC'],['ssc','SSC'],['banking','Banking'],['rrb','Railways'],['neet','NEET']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`btn btn-sm ${filter===v ? 'btn-primary' : 'btn-outline'}`}>{l}</button>
        ))}
        <button onClick={() => setShowFreeOnly(s => !s)} className={`btn btn-sm ${showFreeOnly ? 'btn-primary' : 'btn-outline'}`} style={{ marginLeft: 'auto' }}>
          🆓 Free Only
        </button>
      </div>

      <div className="grid-3" style={{ gap: 18 }}>
        {filtered.map(course => (
          <div key={course.id} className="card card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Course banner */}
            <div style={{ background: `linear-gradient(135deg, ${course.color}33, ${course.color}11)`, borderBottom: `1px solid ${course.color}33`, padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '5rem', opacity: 0.12 }}>{course.icon}</div>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{course.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{course.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{course.exam}</div>
              {course.free && (
                <span style={{ position: 'absolute', top: 12, right: 12, background: 'var(--emerald)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 'var(--r-full)' }}>FREE</span>
              )}
            </div>
            <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Play size={11} /> {course.lessons} lessons
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {course.hours}h
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={11} /> {(course.students/1000).toFixed(0)}K
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Star size={11} fill="var(--amber)" /> {course.rating}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {course.topics.slice(0,4).map(t => (
                  <span key={t} style={{ fontSize: '0.66rem', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '2px 8px', color: 'var(--text-3)' }}>{t}</span>
                ))}
                {course.topics.length > 4 && <span style={{ fontSize: '0.66rem', color: 'var(--text-4)' }}>+{course.topics.length-4} more</span>}
              </div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 'auto', justifyContent: 'center', gap: 6 }}>
                {course.free ? <><Play size={13} /> Start Free</> : <><BookOpen size={13} /> Start Course</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
