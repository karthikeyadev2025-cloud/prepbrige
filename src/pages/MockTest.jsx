import { useState, useEffect, useMemo } from 'react'
import { MOCK_TESTS } from '../data/questions'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/useStore'
import { EXAM_CATEGORIES } from '../data/exams'
import { Clock, Target, Users, Zap, BarChart3 } from 'lucide-react'

const DIFFICULTY_COLOR = { easy: 'var(--emerald)', medium: 'var(--amber)', hard: 'var(--red)' }

// Map exam IDs to display labels
function getExamLabel(examId) {
  for (const cat of EXAM_CATEGORIES) {
    const found = cat.exams.find(e => e.id === examId)
    if (found) return found.name
  }
  return examId?.toUpperCase() || 'Exam'
}

export default function MockTest() {
  const navigate = useNavigate()
  const { profile } = useUserStore()

  // Build dynamic filter tabs from user's selected exams
  const userExams = useMemo(() => profile?.exams || [], [profile])
  const primaryTarget = profile?.primaryTarget || null

  // Build filter tabs: "All" first, then user's selected exams, with proper labels
  const filterTabs = useMemo(() => {
    const tabs = [{ value: 'all', label: 'All Exams' }]
    userExams.forEach(examId => {
      tabs.push({ value: examId, label: getExamLabel(examId) })
    })
    // If user has no exams selected, add standard defaults
    if (userExams.length === 0) {
      tabs.push(
        { value: 'upsc', label: 'UPSC' },
        { value: 'ssc_cgl', label: 'SSC CGL' },
        { value: 'ibps_po', label: 'Banking' },
        { value: 'rrb_ntpc', label: 'Railways' },
        { value: 'neet_ug', label: 'NEET' },
      )
    }
    return tabs
  }, [userExams])

  // Default filter = primaryTarget if it exists, else 'all'
  const defaultFilter = useMemo(() => {
    if (primaryTarget && userExams.includes(primaryTarget)) return primaryTarget
    if (userExams.length > 0) return userExams[0]
    return 'all'
  }, [primaryTarget, userExams])

  const [filter, setFilter] = useState(defaultFilter)

  // Sync all tests (admin-added + static)
  const [tests, setTests] = useState(() => {
    try {
      const local = localStorage.getItem('prepbridge_auto_updated_tests')
      const parsed = local ? JSON.parse(local) : []
      return [...parsed, ...MOCK_TESTS]
    } catch { return [...MOCK_TESTS] }
  })

  useEffect(() => {
    const handleSync = () => {
      try {
        const local = localStorage.getItem('prepbridge_auto_updated_tests')
        const parsed = local ? JSON.parse(local) : []
        setTests([...parsed, ...MOCK_TESTS])
      } catch { /* ignore */ }
    }
    window.addEventListener('prepbridge-portal-sync', handleSync)
    return () => window.removeEventListener('prepbridge-portal-sync', handleSync)
  }, [])

  // Filter tests: support both exact match and prefix match on exam field
  const filtered = useMemo(() => {
    if (filter === 'all') return tests
    return tests.filter(t =>
      t.exam === filter ||
      t.exam?.startsWith(filter) ||
      filter?.startsWith(t.exam)
    )
  }, [tests, filter])

  // Tests relevant to user's selected exams (for "For You" section)
  const forYouTests = useMemo(() => {
    if (userExams.length === 0) return []
    return tests.filter(t => userExams.includes(t.exam) || userExams.some(e => t.exam?.startsWith(e) || e?.startsWith(t.exam)))
  }, [tests, userExams])

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mock Tests 🎯</h1>
          <p className="page-subtitle">Full-length tests with All India ranking, negative marking &amp; analysis</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="stat-pill">⚡ {tests.length} Mock Tests</div>
          <div className="stat-pill">🏆 All India Rank</div>
        </div>
      </div>

      {/* Personalization Banner */}
      {userExams.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(0,212,255,0.07))',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 'var(--r-lg)',
          padding: '14px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--purple)', marginBottom: 2 }}>
              🎯 Personalized for your exam{userExams.length > 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
              Showing tests for: {userExams.map(id => getExamLabel(id)).join(', ')}
              {primaryTarget && ` • Primary target: ${getExamLabel(primaryTarget)}`}
            </div>
          </div>
          {filter !== 'all' && (
            <button className="btn btn-outline btn-sm" onClick={() => setFilter('all')}>Show All Tests</button>
          )}
        </div>
      )}

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

      {/* Dynamic Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {filterTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`btn btn-sm ${filter === tab.value ? 'btn-primary' : 'btn-outline'}`}
          >
            {tab.value === primaryTarget && filter !== tab.value && '⭐ '}
            {tab.label}
          </button>
        ))}
      </div>

      {/* No results for this filter */}
      {filtered.length === 0 && (
        <div className="card card-p" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
          <h3 style={{ marginBottom: 8 }}>No tests found for this exam yet</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-3)', marginBottom: 16 }}>
            We're adding new tests regularly. Check back soon or try "All Exams".
          </p>
          <button className="btn btn-primary" onClick={() => setFilter('all')}>
            View All Tests
          </button>
        </div>
      )}

      {/* Test Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(test => (
          <div key={test.id} className="card card-hover" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{test.title}</div>
                <span style={{
                  fontSize: '0.68rem', padding: '2px 8px', borderRadius: 'var(--r-full)',
                  background: `${DIFFICULTY_COLOR[test.difficulty]}22`,
                  color: DIFFICULTY_COLOR[test.difficulty],
                  fontWeight: 700, textTransform: 'capitalize'
                }}>
                  {test.difficulty}
                </span>
                {test.exam === primaryTarget && (
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 'var(--r-full)', background: 'rgba(124,58,237,0.15)', color: 'var(--purple)', fontWeight: 700, border: '1px solid rgba(124,58,237,0.3)' }}>
                    ⭐ Primary
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> {test.duration} mins
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Target size={12} /> {test.totalQuestions} Qs
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={12} /> {test.attempts?.toLocaleString()} attempts
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BarChart3 size={12} /> Avg: {test.avgScore}
                </span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(test.syllabus || []).map(s => (
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
        <p style={{ marginBottom: 16, fontSize: '0.88rem' }}>
          Let AI create a personalized mock test based on your weak areas
          {primaryTarget && ` for ${getExamLabel(primaryTarget)}`}
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/app/ai-tutor')} style={{ gap: 8 }}>
          <Zap size={15} /> Generate Custom Test with AI
        </button>
      </div>
    </div>
  )
}
