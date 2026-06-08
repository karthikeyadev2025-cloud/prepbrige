import { useState, useEffect, useMemo } from 'react'
import { getSupabaseTestTemplates } from '../services/supabaseService'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/useStore'
import { EXAM_CATEGORIES, ALL_LANGUAGES } from '../data/exams'
import { Clock, Target, Users, Zap, BarChart3, X } from 'lucide-react'
import { auth } from '../firebase/config'
import { toast } from 'react-hot-toast'

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
  const { profile, user } = useUserStore()
  
  // AI Wizard Modal State
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiSubject, setAiSubject] = useState('General Knowledge')
  const [aiDifficulty, setAiDifficulty] = useState('medium')
  const [aiCount, setAiCount] = useState(5)
  const [aiLanguage, setAiLanguage] = useState(profile?.language || 'en')
  const [generating, setGenerating] = useState(false)

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
  const [tests, setTests] = useState([])

  useEffect(() => {
    async function fetchTests() {
      const dbTests = await getSupabaseTestTemplates()
      try {
        const local = localStorage.getItem('prepbridge_auto_updated_tests')
        const parsed = local ? JSON.parse(local) : []
        setTests([...parsed, ...dbTests])
      } catch {
        setTests(dbTests)
      }
    }
    fetchTests()
  }, [])

  useEffect(() => {
    const handleSync = async () => {
      const dbTests = await getSupabaseTestTemplates()
      try {
        const local = localStorage.getItem('prepbridge_auto_updated_tests')
        const parsed = local ? JSON.parse(local) : []
        setTests([...parsed, ...dbTests])
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

  const handleGenerateAITest = async () => {
    if (generating) return
    setGenerating(true)
    toast.loading('AI is crafting your custom test questions...', { id: 'ai-gen' })
    try {
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : ''
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': idToken ? `Bearer ${idToken}` : ''
        },
        body: JSON.stringify({
          examId: primaryTarget || 'general',
          subject: aiSubject,
          difficulty: aiDifficulty,
          language: aiLanguage,
          count: aiCount
        })
      })

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`)
      }

      const testData = await res.json()
      
      if (testData.success) {
        const newTemplate = {
          id: testData.testTemplateId,
          title: testData.title,
          exam: testData.exam,
          totalQuestions: testData.totalQuestions,
          duration: testData.duration,
          pattern: 'MCQ',
          negativeMarking: testData.negativeMarking,
          marksPerQuestion: testData.marksPerQuestion,
          syllabus: [aiSubject],
          attempts: 0,
          avgScore: 0,
          difficulty: testData.difficulty
        }

        // Save questions locally so TestEngine can read them directly
        localStorage.setItem(`prepbridge_ai_questions_${testData.testTemplateId}`, JSON.stringify(testData.questions))

        const localTests = localStorage.getItem('prepbridge_auto_updated_tests')
        const parsed = localTests ? JSON.parse(localTests) : []
        localStorage.setItem('prepbridge_auto_updated_tests', JSON.stringify([newTemplate, ...parsed]))

        toast.success('AI Test generated successfully! Starting test now...', { id: 'ai-gen' })
        setShowAIModal(false)
        
        setTimeout(() => {
          navigate(`/app/test/${testData.testTemplateId}`)
        }, 1000)
      } else {
        throw new Error(testData.error || 'Failed to generate questions')
      }
    } catch (err) {
      console.warn('Server-side AI test generation failed. Using offline generator:', err)
      
      // Offline fallback generation
      const testTemplateId = 'ai_' + Math.random().toString(36).substr(2, 9)
      const offlineQuestions = [
        {
          id: 'q_1',
          text: `Sample MCQ 1 for ${aiSubject} (${aiDifficulty}): Which of the following is protected under Article 21?`,
          options: ["Right to Property", "Right to Education", "Right to Life & Personal Liberty", "Right to Constitutional Remedies"],
          correct: 2,
          explanation: "Article 21 guarantees the Protection of Life and Personal Liberty: No person shall be deprived of his life or personal liberty except according to procedure established by law.",
          subject: aiSubject,
          difficulty: aiDifficulty
        },
        {
          id: 'q_2',
          text: `Sample MCQ 2 for ${aiSubject} (${aiDifficulty}): According to Lev Vygotsky, what represents the gap between what a child can do independently and with guidance?`,
          options: ["Zone of Proximal Development (ZPD)", "Sensorimotor Stage", "Scaffolding", "Schema"],
          correct: 0,
          explanation: "The Zone of Proximal Development (ZPD) is the range of tasks that a child can perform with help but not yet alone.",
          subject: aiSubject,
          difficulty: aiDifficulty
        },
        {
          id: 'q_3',
          text: `Sample MCQ 3 for ${aiSubject} (${aiDifficulty}): The Kakatiya Dynasty ruled from which capital in historical Telangana?`,
          options: ["Hyderabad", "Warangal (Orugallu)", "Khammam", "Nalgonda"],
          correct: 1,
          explanation: "The Kakatiyas ruled with Orugallu (modern-day Warangal) as their capital city.",
          subject: aiSubject,
          difficulty: aiDifficulty
        }
      ]

      const fallbackTemplate = {
        id: testTemplateId,
        title: `AI custom test: ${aiSubject.toUpperCase()} (Offline Fallback)`,
        exam: primaryTarget || 'general',
        totalQuestions: offlineQuestions.length,
        duration: offlineQuestions.length * 2,
        pattern: 'MCQ',
        negativeMarking: -0.25,
        marksPerQuestion: 1,
        syllabus: [aiSubject],
        attempts: 0,
        avgScore: 0,
        difficulty: aiDifficulty
      }

      localStorage.setItem(`prepbridge_ai_questions_${testTemplateId}`, JSON.stringify(offlineQuestions))
      
      const localTests = localStorage.getItem('prepbridge_auto_updated_tests')
      const parsed = localTests ? JSON.parse(localTests) : []
      localStorage.setItem('prepbridge_auto_updated_tests', JSON.stringify([fallbackTemplate, ...parsed]))

      toast.success('Custom test created in offline demo mode!', { id: 'ai-gen' })
      setShowAIModal(false)
      
      setTimeout(() => {
        navigate(`/app/test/${testTemplateId}`)
      }, 1000)
    } finally {
      setGenerating(false)
    }
  }

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
              <div style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                {test.syllabus?.slice(0, 3).map(s => s).join(', ')}{test.syllabus?.length > 3 && '...'}
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
        <button className="btn btn-primary" onClick={() => setShowAIModal(true)} style={{ gap: 8, margin: '0 auto' }}>
          <Zap size={15} /> Generate Custom Test with AI
        </button>
      </div>

      {/* AI Quiz Generator Modal */}
      {showAIModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="card card-p" style={{
            maxWidth: '480px',
            width: '100%',
            background: 'var(--bg-2)',
            border: '1.5px solid var(--border-2)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowAIModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                color: 'var(--text-3)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: 'var(--grad)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="white" />
              </div>
              <h3 style={{ margin: 0 }}>Create Custom AI Test</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Subject / Topic</label>
                <select
                  className="form-input"
                  value={aiSubject}
                  onChange={e => setAiSubject(e.target.value)}
                  style={{ background: 'var(--bg-3)', color: 'white', border: '1px solid var(--border)' }}
                >
                  <option value="General Knowledge">General Knowledge</option>
                  <option value="Current Affairs">Current Affairs</option>
                  <option value="Indian Polity & Constitution">Indian Polity & Constitution</option>
                  <option value="Indian History & Dynasties">Indian History & Dynasties</option>
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Reasoning & Analogy">Reasoning & Analogy</option>
                  <option value="Child Psychology & Pedagogy">Child Psychology & Pedagogy</option>
                  <option value="AP/TS State PSC Syllabus">AP/TS State PSC Syllabus</option>
                  <option value="General Science & Technology">General Science & Technology</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Difficulty Level</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['easy', 'medium', 'hard'].map(d => (
                    <button
                      key={d}
                      type="button"
                      className={`state-btn ${aiDifficulty === d ? 'selected' : ''}`}
                      onClick={() => setAiDifficulty(d)}
                      style={{ flex: 1, textTransform: 'capitalize', textAlign: 'center' }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Questions Count</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[5, 10, 15, 20].map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`state-btn ${aiCount === c ? 'selected' : ''}`}
                      onClick={() => setAiCount(c)}
                      style={{ flex: 1, textAlign: 'center' }}
                    >
                      {c} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Language</label>
                <select
                  className="form-input"
                  value={aiLanguage}
                  onChange={e => setAiLanguage(e.target.value)}
                  style={{ background: 'var(--bg-3)', color: 'white', border: '1px solid var(--border)' }}
                >
                  {ALL_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.native} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifySelf: 'flex-end', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowAIModal(false)}
                disabled={generating}
                style={{ minHeight: '48px', padding: '0 20px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerateAITest}
                disabled={generating}
                style={{ minHeight: '48px', padding: '0 24px', background: 'var(--grad)', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {generating ? (
                  <>
                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    Generate Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
