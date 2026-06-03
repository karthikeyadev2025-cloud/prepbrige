import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Flag, Clock, CheckCircle, XCircle, SkipForward, Trophy, RotateCcw } from 'lucide-react'
import { fetchPaperById, fetchPaperQuestions, saveQuizAttempt, upsertUserProgress, type QuestionPaper, type PaperQuestion } from '../lib/supabase'
import { useUserStore } from '../store/useStore'

type Phase = 'loading' | 'quiz' | 'results'

interface AnswerState {
  [questionId: string]: 'A' | 'B' | 'C' | 'D'
}

interface FlagState {
  [questionId: string]: boolean
}

function GradeBadge({ pct }: { pct: number }) {
  const grade = pct >= 85 ? { label: 'Excellent', color: '#10B981', bg: 'rgba(16,185,129,0.12)' }
    : pct >= 70 ? { label: 'Good', color: '#1E40AF', bg: 'rgba(30,64,175,0.12)' }
    : pct >= 50 ? { label: 'Average', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' }
    : { label: 'Needs Work', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' }
  return (
    <span style={{ padding: '4px 12px', borderRadius: 20, background: grade.bg, color: grade.color, fontWeight: 700, fontSize: '0.85rem' }}>
      {grade.label}
    </span>
  )
}

export default function QuizEngine() {
  const { paperId } = useParams<{ paperId: string }>()
  const navigate = useNavigate()
  const { user } = useUserStore()

  const [phase, setPhase] = useState<Phase>('loading')
  const [paper, setPaper] = useState<QuestionPaper | null>(null)
  const [questions, setQuestions] = useState<PaperQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<AnswerState>({})
  const [flagged, setFlagged] = useState<FlagState>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [saving, setSaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!paperId) return
    Promise.all([fetchPaperById(paperId), fetchPaperQuestions(paperId)]).then(([p, qs]) => {
      setPaper(p)
      setQuestions(qs)
      setTimeLeft((p?.duration_minutes ?? 60) * 60)
      setPhase('quiz')
    })
  }, [paperId])

  useEffect(() => {
    if (phase !== 'quiz') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const handleSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    let sc = 0, cor = 0, wr = 0
    questions.forEach(q => {
      const ans = answers[q.id]
      if (!ans) return
      if (ans === q.correct_option) { sc += q.marks; cor++ }
      else { sc -= q.negative_marks; wr++ }
    })
    const finalScore = Math.max(0, sc)
    setScore(finalScore)
    setCorrect(cor)
    setWrong(wr)
    setPhase('results')

    const uid = (user as any)?.uid
    if (!uid || !paper) return
    setSaving(true)
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000)
    Promise.all([
      saveQuizAttempt({
        user_id: uid,
        paper_id: paper.id,
        score: finalScore,
        total_marks: paper.total_marks,
        correct_answers: cor,
        wrong_answers: wr,
        skipped_answers: questions.length - cor - wr,
        time_taken_seconds: timeTaken,
        answers,
        completed_at: new Date().toISOString(),
      }),
      paper.subject_id ? upsertUserProgress(uid, paper.subject_id, finalScore, paper.total_marks) : Promise.resolve(),
    ]).finally(() => setSaving(false))
  }, [questions, answers, user, paper])

  const selectAnswer = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!questions[currentIdx]) return
    setAnswers(prev => ({ ...prev, [questions[currentIdx].id]: option }))
  }

  const toggleFlag = () => {
    if (!questions[currentIdx]) return
    setFlagged(prev => ({ ...prev, [questions[currentIdx].id]: !prev[questions[currentIdx].id] }))
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (phase === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: '#1E40AF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          Loading paper...
        </div>
      </div>
    )
  }

  if (phase === 'results') {
    const total = paper?.total_marks ?? questions.reduce((s, q) => s + q.marks, 0)
    const pct = total > 0 ? Math.round((score / total) * 100) : 0
    const skipped = questions.length - correct - wrong

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(30,64,175,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Trophy size={32} color="#1E40AF" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Test Complete!</h2>
          <GradeBadge pct={pct} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Score', value: `${score}/${total}`, color: '#1E40AF' },
            { label: 'Percentage', value: `${pct}%`, color: pct >= 50 ? '#10B981' : '#EF4444' },
            { label: 'Correct', value: correct, color: '#10B981' },
            { label: 'Wrong', value: wrong, color: '#EF4444' },
            { label: 'Skipped', value: skipped, color: '#F59E0B' },
            { label: 'Questions', value: questions.length, color: '#0891B2' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Question review */}
        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Review</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {questions.map((q, i) => {
            const userAns = answers[q.id]
            const isCorrect = userAns === q.correct_option
            const isSkipped = !userAns
            return (
              <div key={q.id} style={{ background: 'var(--bg-3)', border: `1px solid ${isSkipped ? 'var(--border)' : isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    {isSkipped ? <SkipForward size={16} color="var(--text-3)" />
                      : isCorrect ? <CheckCircle size={16} color="#10B981" />
                      : <XCircle size={16} color="#EF4444" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.4 }}>Q{i + 1}. {q.question_text}</p>
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const text = q[`option_${opt.toLowerCase()}` as keyof PaperQuestion] as string
                      const isCorrectOpt = opt === q.correct_option
                      const isUserOpt = opt === userAns
                      return (
                        <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', marginBottom: 4, borderRadius: 8, background: isCorrectOpt ? 'rgba(16,185,129,0.1)' : isUserOpt && !isCorrectOpt ? 'rgba(239,68,68,0.08)' : 'transparent', fontSize: '0.8rem', color: isCorrectOpt ? '#10B981' : isUserOpt ? '#EF4444' : 'var(--text-3)' }}>
                          <span style={{ fontWeight: 700, flexShrink: 0 }}>{opt}.</span> {text}
                        </div>
                      )
                    })}
                    {q.explanation && <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--text-3)', fontStyle: 'italic', lineHeight: 1.4 }}>{q.explanation}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => { setPhase('quiz'); setAnswers({}); setFlagged({}); setCurrentIdx(0); setTimeLeft((paper?.duration_minutes ?? 60) * 60); startTimeRef.current = Date.now() }}
            style={{ flex: 1, padding: '14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
            <RotateCcw size={16} /> Retake
          </button>
          <button onClick={() => navigate('/app/papers')}
            style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #1E40AF, #0891B2)', border: 'none', borderRadius: 'var(--r-md)', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
            Back to Papers
          </button>
        </div>
      </div>
    )
  }

  // Quiz phase
  const q = questions[currentIdx]
  if (!q) return null
  const answered = answers[q.id]
  const isFlagged = flagged[q.id]
  const timeWarning = timeLeft < 300
  const answeredCount = Object.keys(answers).length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 4 }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{paper?.title}</p>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-3)' }}>{answeredCount}/{questions.length} answered</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: timeWarning ? 'rgba(239,68,68,0.12)' : 'rgba(30,64,175,0.12)', border: `1px solid ${timeWarning ? 'rgba(239,68,68,0.3)' : 'rgba(30,64,175,0.3)'}` }}>
          <Clock size={13} color={timeWarning ? '#EF4444' : '#60A5FA'} />
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: timeWarning ? '#EF4444' : '#60A5FA', fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Question navigator dots */}
      <div style={{ display: 'flex', gap: 5, padding: '10px 16px', overflowX: 'auto', scrollbarWidth: 'none', background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
        {questions.map((qn, i) => (
          <button key={qn.id} onClick={() => setCurrentIdx(i)}
            style={{ width: 28, height: 28, borderRadius: 8, border: i === currentIdx ? '2px solid #1E40AF' : '1px solid var(--border)', background: flagged[qn.id] ? 'rgba(245,158,11,0.2)' : answers[qn.id] ? 'rgba(16,185,129,0.15)' : 'var(--bg-3)', color: i === currentIdx ? '#60A5FA' : answers[qn.id] ? '#34D399' : 'var(--text-3)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0, padding: 0 }}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600 }}>Q{currentIdx + 1} of {questions.length}</span>
            <p style={{ margin: '8px 0 0', fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 }}>{q.question_text}</p>
          </div>
          <button onClick={toggleFlag}
            style={{ background: isFlagged ? 'rgba(245,158,11,0.15)' : 'var(--bg-3)', border: `1px solid ${isFlagged ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`, borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: isFlagged ? '#F59E0B' : 'var(--text-3)', flexShrink: 0 }}>
            <Flag size={15} />
          </button>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(['A', 'B', 'C', 'D'] as const).map(opt => {
            const text = q[`option_${opt.toLowerCase()}` as keyof PaperQuestion] as string
            const isSelected = answered === opt
            return (
              <button key={opt} onClick={() => selectAnswer(opt)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: 'var(--r-md)', border: `1px solid ${isSelected ? '#1E40AF' : 'var(--border)'}`, background: isSelected ? 'rgba(30,64,175,0.12)' : 'var(--bg-3)', color: isSelected ? '#93C5FD' : 'var(--text-1)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s', fontSize: '0.9rem' }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: isSelected ? '#1E40AF' : 'var(--bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', color: isSelected ? 'white' : 'var(--text-3)', flexShrink: 0 }}>{opt}</span>
                {text}
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer nav */}
      <div style={{ padding: '12px 16px', background: 'var(--bg-2)', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
        <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
          style={{ flex: 1, padding: '12px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: currentIdx === 0 ? 'var(--text-4)' : 'var(--text-2)', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
          <ChevronLeft size={16} /> Prev
        </button>
        {currentIdx < questions.length - 1 ? (
          <button onClick={() => setCurrentIdx(i => i + 1)}
            style={{ flex: 1, padding: '12px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit}
            style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #1E40AF, #0891B2)', border: 'none', borderRadius: 'var(--r-md)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
            Submit Test
          </button>
        )}
      </div>
    </div>
  )
}
