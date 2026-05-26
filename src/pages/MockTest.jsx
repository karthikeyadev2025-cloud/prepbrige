import React, { useState } from 'react'
import { MOCK_TESTS } from '../data/questions'
import { EXAM_CATEGORIES } from '../data/exams'
import { useNavigate } from 'react-router-dom'
import { Clock, Target, Users, Zap, BarChart3, Trophy, ChevronRight } from 'lucide-react'

const DIFFICULTY_COLOR = { easy: 'var(--emerald)', medium: 'var(--amber)', hard: 'var(--red)' }

export default function MockTest() {
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  const [tests, setTests] = useState(() => {
    const local = localStorage.getItem('prepbridge_auto_updated_tests')
    const parsed = local ? JSON.parse(local) : []
    return [...parsed, ...MOCK_TESTS]
  })

  React.useEffect(() => {
    const handleSync = () => {
      const local = localStorage.getItem('prepbridge_auto_updated_tests')
      const parsed = local ? JSON.parse(local) : []
      setTests([...parsed, ...MOCK_TESTS])
    }
    window.addEventListener('prepbridge-portal-sync', handleSync)
    return () => window.removeEventListener('prepbridge-portal-sync', handleSync)
  }, [])

  const filtered = filter === 'all' ? tests : tests.filter(t => t.exam.startsWith(filter) || t.exam === filter)

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mock Tests 🎯</h1>
          <p className="page-subtitle">Full-length tests with All India ranking, negative marking & analysis</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="stat-pill">⚡ {tests.length} Mock Tests</div>
          <div className="stat-pill">🏆 All India Rank</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Tests Available', value: '500+', icon: '📋', color: 'var(--purple)' },
          { label: 'Total Attempts', value: '12L+', icon: '👥', color: 'var(--cyan)' },
          { label: 'Avg Accuracy', value: '64%', icon: '🎯', color: 'var(--emerald)' },
          { label: 'Questions Bank', value: '5L+', icon: '❓', color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} className="card card-p" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {[['all','All Exams'], ['upsc','UPSC'], ['ssc','SSC'], ['ibps','Banking'], ['rrb','Railways'], ['neet','NEET']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`btn btn-sm ${filter===v ? 'btn-primary' : 'btn-outline'}`}>{l}</button>
        ))}
      </div>

      {/* Test Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(test => (
          <div key={test.id} className="card card-hover" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{test.title}</div>
                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 'var(--r-full)', background: `${DIFFICULTY_COLOR[test.difficulty]}22`, color: DIFFICULTY_COLOR[test.difficulty], fontWeight: 700, textTransform: 'capitalize' }}>
                  {test.difficulty}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> {test.duration} mins
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Target size={12} /> {test.totalQuestions} Qs
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={12} /> {test.attempts.toLocaleString()} attempts
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BarChart3 size={12} /> Avg: {test.avgScore}
                </span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {test.syllabus.map(s => (
                  <span key={s} style={{ fontSize: '0.68rem', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '2px 8px', color: 'var(--text-3)' }}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <div style={{ textAlign: 'center', padding: '8px 16px', background: 'var(--bg-3)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>Marking</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>+{test.marksPerQuestion} / {test.negativeMarking}</div>
              </div>
              <button onClick={() => navigate(`/app/test/${test.id}`)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={15} /> Start Test
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Generate with AI */}
      <div className="card card-p" style={{ marginTop: 24, background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(0,212,255,0.08))', border: '1px solid rgba(124,58,237,0.3)', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🤖</div>
        <h3 style={{ marginBottom: 6 }}>AI-Generated Custom Test</h3>
        <p style={{ marginBottom: 16, fontSize: '0.88rem' }}>Let AI create a personalized mock test based on your weak areas</p>
        <button className="btn btn-primary" onClick={() => navigate('/app/ai-tutor')} style={{ gap: 8 }}>
          <Zap size={15} /> Generate Custom Test with AI
        </button>
      </div>
    </div>
  )
}
