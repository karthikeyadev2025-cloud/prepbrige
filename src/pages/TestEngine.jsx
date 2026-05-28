import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useStore'
import { getSupabaseTestTemplates, getSupabaseExamQuestions } from '../services/supabaseService'
import { saveTestResult } from '../services/resultService'
import { toast } from 'react-hot-toast'
import { Clock, Flag, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

// Dynamic test loading handled inside component
export default function TestEngine() {
  const { testId } = useParams()
  const navigate = useNavigate()

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

  useEffect(() => {
    async function loadTest() {
      setLoading(true)
      const allTests = await getSupabaseTestTemplates()
      const t = allTests.find(t => t.id === testId) || allTests[0]
      if (t) {
        setTest(t)
        setTimeLeft(t.duration * 60)
        const qList = await getSupabaseExamQuestions(t.exam, Math.min(t.totalQuestions, 20))
        setQuestions(qList)
      }
      setLoading(false)
    }
    loadTest()
  }, [testId])

  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const { addTestResult, addPoints } = useAppStore()

  // ⚠️ CRITICAL: handleSubmit MUST be defined before the useEffect that references it
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
    const rank = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff * 5000) + 100
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
    // Save result to Supabase/localStorage
    await saveTestResult(res)
    addTestResult(res)
    addPoints(Math.floor(correct * 5))
    setShowResult(true)
    toast.success('Test submitted! 🎉')
  }, [submitted, answers, test, questions, testId, addTestResult, addPoints])

  // Timer — handleSubmit is now defined above, safe to reference
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
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner"></div>
        <p style={{ marginLeft: 16 }}>Loading Test Engine...</p>
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

  // Results screen
  if (showResult && result) {
    return (
      <div className="page animate-fade-in">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>
              {result.pct >= 60 ? '🎉' : result.pct >= 40 ? '💪' : '📚'}
            </div>
            <h2 style={{ marginBottom: 4 }}>Test Complete!</h2>
            <p>{test.title}</p>
          </div>

          <div className="grid-4" style={{ marginBottom: 28 }}>
            <div className="card card-p" style={{ textAlign: 'center', background: 'linear-gradient(135deg,rgba(0,212,255,0.1),rgba(124,58,237,0.1))' }}>
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
            <div className="progress-bar" style={{ height: 12 }}>
              <div className="progress-fill" style={{
                width: `${result.pct}%`,
                background: result.pct >= 60 ? 'var(--grad-emerald)' : result.pct >= 40 ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'var(--red)'
              }} />
            </div>
          </div>

          <div className="card card-p" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 16 }}>Question-wise Review</h4>
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
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => navigate('/app/mock-tests')}>Back to Tests</button>
            <button className="btn btn-primary" onClick={handleRetake}>Retake Test</button>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[current]
  const timerColor = timeLeft < 300 ? 'danger' : timeLeft < 600 ? 'warning' : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Test header */}
      <div className="test-header">
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>{test.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{Object.keys(answers).length}/{questions.length} answered</div>
        </div>
        <div className={`test-timer ${timerColor}`}>
          <Clock size={18} style={{ display: 'inline', marginRight: 6 }} />
          {formatTime(timeLeft)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={handleFlag}>
            <Flag size={14} fill={flagged.has(q.id) ? 'var(--amber)' : 'none'} color={flagged.has(q.id) ? 'var(--amber)' : 'currentColor'} />
            {flagged.has(q.id) ? 'Unflag' : 'Flag'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowExitConfirm(true)}>Submit</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Question panel */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <div className="question-panel" style={{ maxWidth: 700 }}>
            <div className="question-number">
              Question {current + 1} of {questions.length}
              {q.subject && ` • ${q.subject}`}
              {q.difficulty && ` • ${q.difficulty}`}
            </div>
            <div className="question-text">{q.text}</div>
            <div className="options-list">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className={`option-btn ${answers[q.id] === i ? 'selected' : ''}`}
                  onClick={() => handleAnswer(i)}
                >
                  <span className="option-letter" style={answers[q.id] === i ? { background: 'var(--purple)', borderColor: 'var(--purple)', color: 'white' } : {}}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button className="btn btn-outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>
                <ChevronLeft size={16} /> Previous
              </button>
              <button className="btn btn-primary" onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation panel */}
        <div style={{ width: 280, borderLeft: '1px solid var(--border)', padding: 20, overflowY: 'auto', background: 'var(--bg-2)' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-3)' }}>QUESTION PALETTE</div>
            <div className="question-nav">
              {questions.map((q2, i) => (
                <button
                  key={q2.id}
                  className={`q-nav-btn ${i === current ? 'current' : answers[q2.id] !== undefined ? 'answered' : flagged.has(q2.id) ? 'skipped' : ''}`}
                  onClick={() => setCurrent(i)}
                >{i + 1}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem', color: 'var(--text-3)' }}>
            {[
              ['var(--purple)', 'Answered'],
              ['var(--cyan)', 'Current'],
              ['var(--amber)', 'Flagged'],
              ['rgba(255,255,255,0.06)', 'Not visited']
            ].map(([clr, lbl]) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: clr, border: '1.5px solid ' + clr }} />
                {lbl}
              </div>
            ))}
          </div>
          <div className="divider" />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
            <div>Answered: <strong style={{ color: 'var(--text-1)' }}>{Object.keys(answers).length}</strong></div>
            <div>Flagged: <strong style={{ color: 'var(--amber)' }}>{flagged.size}</strong></div>
            <div>Remaining: <strong style={{ color: 'var(--red)' }}>{questions.length - Object.keys(answers).length}</strong></div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }} onClick={() => setShowExitConfirm(true)}>
            Submit Test
          </button>
        </div>
      </div>

      {/* Confirm submit modal */}
      {showExitConfirm && (
        <div className="modal-overlay" onClick={() => setShowExitConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
              <AlertTriangle size={24} color="var(--amber)" />
              <div>
                <h3 style={{ marginBottom: 4 }}>Submit Test?</h3>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>
                  {questions.length - Object.keys(answers).length} question(s) unanswered. Are you sure you want to submit?
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowExitConfirm(false)}>Continue Test</button>
              <button className="btn btn-primary" onClick={() => { setShowExitConfirm(false); handleSubmit() }}>Yes, Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
