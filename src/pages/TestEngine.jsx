import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore, useUserStore } from '../store/useStore'
import { getSupabaseTestTemplates, getSupabaseExamQuestions } from '../services/supabaseService'
import { saveTestResult } from '../services/resultService'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { Clock, Flag, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, XCircle, ShieldCheck } from 'lucide-react'
import DOMPurify from 'dompurify'

export default function TestEngine() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { profile } = useUserStore()

  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // AI Explanation State
  const [aiExplanations, setAiExplanations] = useState({})
  const [loadingExplanation, setLoadingExplanation] = useState({})

  const handleExplainWithAI = async (qId, questionText, userAnswerText, correctAnswerText) => {
    if (loadingExplanation[qId]) return
    setLoadingExplanation(prev => ({ ...prev, [qId]: true }))
    try {
      const { explainWrongAnswer } = await import('../services/gemini')
      const explanationText = await explainWrongAnswer(questionText, userAnswerText, correctAnswerText, profile?.selectedLanguage || 'en')
      setAiExplanations(prev => ({ ...prev, [qId]: explanationText }))
    } catch (err) {
      toast.error('AI is currently busy. Please try again.')
    } finally {
      setLoadingExplanation(prev => ({ ...prev, [qId]: false }))
    }
  }

  const formatAIText = (text) => {
    if (!text) return ''
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />')
      .replace(/•/g, '&bull;')
  }

  // Track responsive screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function loadTest() {
      setLoading(true)
      let t = null
      let qList = []

      // 1. Try custom local tests first
      try {
        const localTests = localStorage.getItem('prepbridge_auto_updated_tests')
        const parsed = localTests ? JSON.parse(localTests) : []
        t = parsed.find(item => item.id === testId)
        if (t) {
          const localQs = localStorage.getItem(`prepbridge_ai_questions_${testId}`)
          if (localQs) {
            qList = JSON.parse(localQs)
          }
        }
      } catch (e) {
        console.warn('Failed to load local custom test template:', e)
      }

      // 2. Fallback to Supabase test templates
      if (!t) {
        const allTests = await getSupabaseTestTemplates()
        t = allTests.find(t => t.id === testId) || allTests[0]
        if (t) {
          qList = await getSupabaseExamQuestions(t.exam, Math.min(t.totalQuestions, 20))
        }
      }

      if (t) {
        setTest(t)
        setTimeLeft(t.duration * 60)
        setQuestions(qList || [])
      } else {
        toast.error('Test template not found')
        navigate('/app/mock-tests')
      }
      setLoading(false)
    }
    loadTest()
  }, [testId, navigate])

  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const { addTestResult, addPoints } = useAppStore()

  const handleSubmit = useCallback(async () => {
    if (submitted) return
    setSubmitted(true)
    let correct = 0, wrong = 0, skipped = 0
    questions.forEach(q => {
      const ans = answers[q.id]
      if (ans === undefined) skipped++
      else if (ans === q.correct) correct++
      else wrong++
    })
    const marksPerQ = test?.marksPerQuestion ?? 2
    const negMarks = test?.negativeMarking ?? -0.66
    const score = correct * marksPerQ + wrong * negMarks
    const maxScore = questions.length * marksPerQ
    const pct = Math.max(0, (score / maxScore) * 100).toFixed(1)

    // Derive rank from real attempt data: count attempts with higher score for same test template
    let rank = null
    try {
      const numericScore = Math.max(0, parseFloat(score))
      const [{ count: higherCount }, { count: totalCount }] = await Promise.all([
        supabase.from('test_attempts').select('*', { count: 'exact', head: true })
          .eq('test_template_id', testId).gt('score', numericScore).then(r => ({ count: r.count ?? 0 })),
        supabase.from('test_attempts').select('*', { count: 'exact', head: true })
          .eq('test_template_id', testId).then(r => ({ count: r.count ?? 0 }))
      ])
      rank = (higherCount ?? 0) + 1
      if ((totalCount ?? 0) < 10) rank = null
    } catch (_) {
      rank = null
    }

    const res = {
      testId,
      title: test?.title || 'Mock Test',
      correct, wrong, skipped,
      score: Math.max(0, score).toFixed(1),
      maxScore,
      pct,
      rank,
      date: new Date().toISOString()
    }
    
    await saveTestResult(res)
    addTestResult(res)
    addPoints(Math.floor(correct * 5))
    setResult(res)
    setShowResult(true)
    toast.success('Test submitted! 🎉')
  }, [submitted, answers, test, questions, testId, addTestResult, addPoints])

  // Secure timer logic
  useEffect(() => {
    if (submitted) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [submitted, handleSubmit])

  if (loading || !test || questions.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 16 }}>Loading secured test module...</p>
      </div>
    )
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const handleAnswer = (optIdx) => {
    if (submitted) return
    setAnswers(a => ({ ...a, [questions[current].id]: optIdx }))
  }

  const handleFlag = () => {
    const qid = questions[current].id
    setFlagged(f => {
      const n = new Set(f)
      n.has(qid) ? n.delete(qid) : n.add(qid)
      return n
    })
  }

  const handleRetake = () => {
    setShowResult(false)
    setSubmitted(false)
    setAnswers({})
    setFlagged(new Set())
    setCurrent(0)
    setTimeLeft(test.duration * 60)
    setResult(null)
    setShowExitConfirm(false)
  }

  // Evaluated results display
  if (showResult && result) {
    return (
      <div style={{ padding: '40px 24px', background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-1)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>
              {result.pct >= 60 ? '🎉' : result.pct >= 40 ? '💪' : '📚'}
            </div>
            <h2 style={{ marginBottom: 4, fontSize: '1.75rem', fontWeight: 800 }}>Test Complete!</h2>
            <p style={{ color: 'var(--text-3)' }}>{test.title}</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 28
          }}>
            <div className="card card-p" style={{ textAlign: 'center', background: 'linear-gradient(135deg,rgba(0,212,255,0.06),rgba(124,58,237,0.06))' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{result.score}/{result.maxScore}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Score</div>
            </div>
            <div className="card card-p" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--emerald)' }}>{result.correct}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Correct</div>
            </div>
            <div className="card card-p" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--red)' }}>{result.wrong}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Wrong</div>
            </div>
            <div className="card card-p" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--amber)' }}>#{result.rank}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>All India Rank</div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Overall Score: {result.pct}%</span>
              <span style={{ color: result.pct >= 60 ? 'var(--emerald)' : 'var(--amber)' }}>
                {result.pct >= 60 ? 'Good' : result.pct >= 40 ? 'Average' : 'Needs Work'}
              </span>
            </div>
            <div style={{ height: 12, background: 'var(--bg-3)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${result.pct}%`,
                background: result.pct >= 60 ? 'var(--grad-emerald)' : result.pct >= 40 ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'var(--red)',
                borderRadius: 999
              }} />
            </div>
          </div>

          <div className="card card-p" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 700 }}>Question-wise Review</h4>
            {questions.map((q, i) => {
              const userAns = answers[q.id]
              const isCorrect = userAns === q.correct
              const isSkipped = userAns === undefined
              return (
                <div key={q.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: isSkipped ? 'rgba(255,255,255,0.06)' : isCorrect ? 'var(--emerald-10)' : 'var(--red-10)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {isSkipped
                        ? <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>{i + 1}</span>
                        : isCorrect
                          ? <CheckCircle size={14} color="var(--emerald)" />
                          : <XCircle size={14} color="var(--red)" />
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-1)', marginBottom: 6 }}>{q.text}</div>
                      {!isSkipped && <div style={{ fontSize: '0.8rem', color: isCorrect ? 'var(--emerald)' : 'var(--red)' }}>Your answer: {q.options[userAns]}</div>}
                      {!isCorrect && <div style={{ fontSize: '0.8rem', color: 'var(--emerald)' }}>Correct: {q.options[q.correct]}</div>}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 4 }}>💡 {q.explanation}</div>
                      
                      {!isCorrect && (
                        <div style={{ marginTop: 8 }}>
                          {aiExplanations[q.id] ? (
                            <div style={{
                              background: 'var(--bg-3)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r-md)',
                              padding: '12px 16px',
                              marginTop: 8,
                              fontSize: '0.8rem',
                              color: 'var(--text-2)',
                              lineHeight: 1.55,
                              animation: 'fadeUp 0.2s ease'
                            }}>
                              <div style={{ fontWeight: 700, color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <span>🧠</span> K² AI Explanation:
                              </div>
                              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatAIText(aiExplanations[q.id])) }} />
                            </div>
                          ) : (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleExplainWithAI(q.id, q.text, q.options[userAns] || 'Skipped', q.options[q.correct])}
                              disabled={loadingExplanation[q.id]}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: '32px', fontSize: '0.72rem', padding: '4px 10px' }}
                            >
                              {loadingExplanation[q.id] ? (
                                <>
                                  <div className="spinner-loader" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                                  K² is thinking...
                                </>
                              ) : (
                                <>
                                  <span>🧠</span> Explain with K² AI
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-outline" style={{ minHeight: '48px', padding: '10px 24px' }} onClick={() => navigate('/app/mock-tests')}>Back to Tests</button>
            <button className="btn btn-primary" style={{ minHeight: '48px', padding: '10px 24px' }} onClick={handleRetake}>Retake Test</button>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[current]
  const timerColor = timeLeft < 300 ? 'danger' : timeLeft < 600 ? 'warning' : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--prime-dark)' }}>
      {/* Pinned Top Timer Banner */}
      <div style={{
        background: 'rgba(10, 11, 16, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1rem', fontWeight: 900, color: 'white' }}>{test.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <ShieldCheck size={12} color="#00e676" />
            <span>Secured Session • <span style={{ color: 'white', fontWeight: 700 }}>{Object.keys(answers).length}/{questions.length}</span> answered</span>
          </div>
        </div>
        <div className={`test-timer ${timerColor}`} style={{
          fontSize: '1.3rem',
          fontWeight: 900,
          color: timerColor === 'danger' ? 'var(--red)' : timerColor === 'warning' ? 'var(--amber)' : '#00e676',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleFlag}
            style={{ minHeight: '48px', minWidth: '48px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Flag size={14} fill={flagged.has(q.id) ? 'var(--amber)' : 'none'} color={flagged.has(q.id) ? 'var(--amber)' : 'currentColor'} />
            {!isMobile && (flagged.has(q.id) ? 'Unflag' : 'Flag')}
          </button>
          <button
            className="btn btn-prime-green btn-sm"
            onClick={() => setShowExitConfirm(true)}
            style={{ minHeight: '48px', padding: '0 24px', borderRadius: 12 }}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Responsive Workspace Grid */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        flex: 1,
        paddingBottom: isMobile ? '76px' : '0px'
      }}>
        {/* Left / Main Question Canvas */}
        <div style={{
          flex: 1,
          padding: '32px 24px',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{ maxWidth: '720px', width: '100%' }}>
            <div style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--cyan)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 12
            }}>
              Question {current + 1} of {questions.length}
              {q.subject && ` • ${q.subject}`}
              {q.difficulty && ` • ${q.difficulty}`}
            </div>
            
            {/* Rich Markdown/LaTeX Question Display */}
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 500,
              color: 'var(--text-1)',
              lineHeight: 1.65,
              marginBottom: 28,
              background: 'rgba(255,255,255,0.01)',
              borderLeft: '3px solid var(--purple)',
              paddingLeft: 16
            }}>
              {q.text}
            </div>

            {/* Tap Target Option Selectors (Minimum 48px height) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 20px',
                    borderRadius: 14,
                    background: answers[q.id] === i ? 'var(--prime-purple-15)' : 'rgba(255,255,255,0.02)',
                    border: answers[q.id] === i ? '1.5px solid var(--prime-purple)' : '1.5px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    color: 'var(--text-1)',
                    minHeight: '48px', // Strict touch boundary metric
                    width: '100%',
                    boxShadow: answers[q.id] === i ? '0 0 15px rgba(124, 77, 255, 0.15)' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (answers[q.id] !== i) {
                      e.currentTarget.style.borderColor = 'var(--prime-green)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (answers[q.id] !== i) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    }
                  }}
                >
                  <span style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '1.5px solid',
                    borderColor: answers[q.id] === i ? 'var(--prime-purple)' : 'rgba(255,255,255,0.15)',
                    background: answers[q.id] === i ? 'var(--prime-purple)' : 'transparent',
                    color: answers[q.id] === i ? 'white' : 'var(--text-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ flex: 1, color: answers[q.id] === i ? 'white' : 'var(--text-2)' }}>{opt}</span>
                </button>
              ))}
            </div>

            {/* Desktop Navigation Row (Hidden on Mobile) */}
            {!isMobile && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrent(c => Math.max(0, c - 1))}
                  disabled={current === 0}
                  style={{ minHeight: '48px', padding: '0 24px' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (current < questions.length - 1) {
                      setCurrent(c => c + 1)
                    } else {
                      setShowExitConfirm(true)
                    }
                  }}
                  style={{ minHeight: '48px', padding: '0 24px', background: 'var(--grad)' }}
                >
                  Save & Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Canvas / Persistent Status Palette (Stacked on Mobile) */}
        <div style={{
          width: isMobile ? '100%' : '320px',
          borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)',
          borderTop: isMobile ? '1px solid rgba(255,255,255,0.05)' : 'none',
          padding: 24,
          overflowY: 'auto',
          background: 'rgba(10, 11, 16, 0.98)'
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Question Palette</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 10
            }}>
              {questions.map((q2, i) => {
                const isCurrent = i === current
                const isAnswered = answers[q2.id] !== undefined
                const isFlagged = flagged.has(q2.id)
                
                const targetColor = isCurrent ? 'var(--prime-purple)' : isFlagged ? 'var(--amber)' : isAnswered ? 'var(--prime-green)' : 'rgba(255,255,255,0.1)';
                const targetBg = isCurrent ? 'var(--prime-purple-15)' : isFlagged ? 'rgba(245,158,11,0.06)' : isAnswered ? 'var(--prime-green-15)' : 'transparent';
                
                return (
                  <button
                    key={q2.id}
                    onClick={() => setCurrent(i)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 10,
                      border: '1.5px solid',
                      borderColor: targetColor,
                      background: targetBg,
                      color: isCurrent ? 'white' : isFlagged ? 'var(--amber)' : isAnswered ? 'var(--prime-green)' : 'var(--text-3)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      transition: 'all 0.2s',
                      minHeight: '44px',
                      minWidth: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isCurrent ? '0 0 10px rgba(124, 77, 255, 0.15)' : isAnswered ? '0 0 10px rgba(0, 230, 118, 0.1)' : 'none'
                    }}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 20 }}>
            {[
              ['var(--prime-green)', 'Answered'],
              ['var(--prime-purple)', 'Current'],
              ['var(--amber)', 'Flagged'],
              ['rgba(255,255,255,0.06)', 'Not Visited']
            ].map(([clr, lbl]) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: clr, border: '1.5px solid ' + clr }} />
                <span style={{ fontWeight: 600 }}>{lbl}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '16px 0' }} />
          
          <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Answered:</span>
              <strong style={{ color: 'var(--prime-green)' }}>{Object.keys(answers).length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Flagged:</span>
              <strong style={{ color: 'var(--amber)' }}>{flagged.size}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Remaining:</span>
              <strong style={{ color: 'var(--red)' }}>{questions.length - Object.keys(answers).length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile persistent Bottom Thumb Utility Strip */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(13, 16, 32, 0.96)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 10,
          zIndex: 100,
          minHeight: '72px'
        }}>
          <button
            className="btn btn-outline"
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            style={{ minHeight: '48px', flex: 1, justifyContent: 'center' }}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          
          <button
            className="btn btn-ghost"
            onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
            style={{ minHeight: '48px', flex: 1, justifyContent: 'center', color: 'var(--text-3)' }}
          >
            Skip
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              if (current < questions.length - 1) {
                setCurrent(c => c + 1)
              } else {
                setShowExitConfirm(true)
              }
            }}
            style={{ minHeight: '48px', flex: 1.5, justifyContent: 'center', background: 'var(--grad)' }}
          >
            Save & Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Custom submission validation alert overlay */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div className="card card-p" style={{
            maxWidth: '440px',
            width: '90%',
            background: 'var(--bg-2)',
            border: '1.5px solid var(--border-2)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
              <AlertTriangle size={24} color="var(--amber)" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ marginBottom: 6, fontSize: '1.1rem', color: 'white' }}>Submit Mock Exam?</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                  You have completed <strong>{Object.keys(answers).length}</strong> out of {questions.length} items. Are you sure you want to finish and grade your attempt?
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" style={{ minHeight: '48px', padding: '0 20px' }} onClick={() => setShowExitConfirm(false)}>Resume Test</button>
              <button className="btn btn-primary" style={{ minHeight: '48px', padding: '0 20px', background: 'var(--grad)' }} onClick={() => { setShowExitConfirm(false); handleSubmit() }}>Yes, Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
