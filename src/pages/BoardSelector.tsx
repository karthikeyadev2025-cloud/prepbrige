import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, MapPin, GraduationCap, BookOpen } from 'lucide-react'
import { supabase, type Board, type Exam } from '../lib/supabase'
import { usePlatformStore } from '../store/usePlatformStore'

const STATE_META: Record<string, { label: string; icon: string; description: string }> = {
  AP:   { label: 'Andhra Pradesh', icon: '🏛️', description: 'BSEAP, APPSC, APSET, Intermediate' },
  TS:   { label: 'Telangana', icon: '🕌', description: 'TSBIE, TGPSC, EAMCET, ICET, ECET' },
  CBSE: { label: 'CBSE', icon: '📘', description: 'Central Board of Secondary Education' },
  NTA:  { label: 'National (NTA)', icon: '🇮🇳', description: 'JEE, NEET, UPSC, SSC CGL, NMMS' },
}
const STATE_ORDER = ['AP', 'TS', 'CBSE', 'NTA']

interface StateGroup { id: string; label: string; icon: string; description: string; boards: Board[] }

function StepDots({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ height: 8, width: i === step ? 24 : 8, borderRadius: 4, background: i <= step ? '#1E40AF' : 'var(--bg-4)', transition: 'all 0.3s' }} />
      ))}
    </div>
  )
}

export default function BoardSelector() {
  const navigate = useNavigate()
  const { selectedBoard, selectedExam, setSelectedBoard, setSelectedExam, setOnboardingDone } = usePlatformStore()

  const [step, setStep] = useState(0)
  const [stateGroups, setStateGroups] = useState<StateGroup[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null)
  const [localBoard, setLocalBoard] = useState<Board | null>(selectedBoard)
  const [localExam, setLocalExam] = useState<Exam | null>(selectedExam)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('boards').select('*').order('display_order').then(({ data }) => {
      if (!data) return
      const grouped: Record<string, StateGroup> = {}
      data.forEach(b => {
        const key = b.state_code ?? 'OTHER'
        if (!grouped[key]) {
          const meta = STATE_META[key] ?? { label: key, icon: '📋', description: '' }
          grouped[key] = { id: key, label: meta.label, icon: meta.icon, description: meta.description, boards: [] }
        }
        grouped[key].boards.push(b)
      })
      const ordered = STATE_ORDER.filter(k => grouped[k]).map(k => grouped[k])
      const rest = Object.keys(grouped).filter(k => !STATE_ORDER.includes(k)).map(k => grouped[k])
      setStateGroups([...ordered, ...rest])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!localBoard) return
    supabase.from('exams').select('*').eq('board_id', localBoard.id).order('display_order').then(({ data }) => setExams(data ?? []))
  }, [localBoard])

  const selectState = (sg: StateGroup) => {
    setSelectedStateId(sg.id)
    if (sg.boards.length === 1) { setLocalBoard(sg.boards[0]); setStep(2) }
    else setStep(1)
  }

  const handleConfirm = () => {
    if (!localBoard) return
    setSelectedBoard(localBoard)
    setSelectedExam(localExam)
    setOnboardingDone(true)
    navigate('/app/home')
  }

  const currentGroup = stateGroups.find(sg => sg.id === selectedStateId)
  const stepIcons = [<MapPin key={0} size={24} color="#60A5FA" />, <GraduationCap key={1} size={24} color="#34D399" />, <BookOpen key={2} size={24} color="#FBBF24" />]
  const stepTitles = ['State / Region', 'Board', 'Exam']
  const stepSubs = ['Where are you preparing?', `Choose your board in ${currentGroup?.label ?? '...'}`, `Which exam with ${localBoard?.name ?? '...'}?`]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', padding: '24px 20px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontSize: '0.85rem' }}>
            <ChevronLeft size={16} /> Back
          </button>
        ) : <div />}
        <button onClick={() => { setOnboardingDone(true); navigate('/app/home') }} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '0.85rem' }}>Skip</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(30,64,175,0.15)', border: '1px solid rgba(30,64,175,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          {stepIcons[step]}
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px' }}>{stepTitles[step]}</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: 0 }}>{stepSubs[step]}</p>
      </div>

      <StepDots step={step} />

      {/* Step 0: State */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? Array(4).fill(0).map((_, i) => <div key={i} style={{ height: 80, background: 'var(--bg-3)', borderRadius: 'var(--r-md)', animation: 'pulse 1.5s ease infinite' }} />) :
            stateGroups.map(sg => (
              <button key={sg.id} onClick={() => selectState(sg)}
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(30,64,175,0.5)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}>
                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{sg.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{sg.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{sg.description}</div>
                </div>
                <ChevronRight size={16} color="var(--text-3)" />
              </button>
            ))
          }
        </div>
      )}

      {/* Step 1: Board */}
      {step === 1 && currentGroup && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentGroup.boards.map(board => (
            <button key={board.id} onClick={() => { setLocalBoard(board); setStep(2) }}
              style={{ background: localBoard?.id === board.id ? 'rgba(30,64,175,0.1)' : 'var(--bg-3)', border: `1px solid ${localBoard?.id === board.id ? 'rgba(30,64,175,0.5)' : 'var(--border)'}`, borderRadius: 'var(--r-md)', padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%', transition: 'all 0.2s' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(30,64,175,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GraduationCap size={20} color="#60A5FA" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2 }}>{board.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{board.short_name}</div>
              </div>
              {localBoard?.id === board.id && <Check size={16} color="#34D399" />}
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Exam */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {exams.map(exam => (
            <button key={exam.id} onClick={() => setLocalExam(e => e?.id === exam.id ? null : exam)}
              style={{ background: localExam?.id === exam.id ? 'rgba(5,150,105,0.1)' : 'var(--bg-3)', border: `1px solid ${localExam?.id === exam.id ? 'rgba(5,150,105,0.4)' : 'var(--border)'}`, borderRadius: 'var(--r-md)', padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%', transition: 'all 0.2s' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>{exam.name}</div>
                {(exam as any).description && <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{(exam as any).description}</div>}
              </div>
              {localExam?.id === exam.id && <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={13} color="white" /></div>}
            </button>
          ))}
          {exams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>
              <BookOpen size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: '0.85rem' }}>No exams available for this board yet.</p>
            </div>
          )}
          <button onClick={handleConfirm} disabled={!localBoard}
            style={{ marginTop: 8, width: '100%', padding: '15px', background: localBoard ? 'linear-gradient(135deg, #1E40AF, #0891B2)' : 'var(--bg-4)', border: 'none', borderRadius: 'var(--r-md)', color: 'white', cursor: localBoard ? 'pointer' : 'not-allowed', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {localExam ? `Continue with ${localExam.name}` : `Continue with ${localBoard?.short_name ?? '...'}`}
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
