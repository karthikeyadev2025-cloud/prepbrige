import { useState, useEffect } from 'react'
import { useUserStore } from '../store/useStore'
import { Calendar, Target, CheckCircle, RefreshCw, Brain, Clock, Plus, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function StudyPlanner() {
  const { profile } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null) // Array of days
  const [days, setDays] = useState(30)
  const [weakSubjects, setWeakSubjects] = useState('')

  // Try to load existing plan
  useEffect(() => {
    async function loadPlan() {
      if (!profile?.uid) return
      try {
        const localPlan = localStorage.getItem(`pb_plan_${profile.uid}`)
        if (localPlan) {
          setPlan(JSON.parse(localPlan))
        }
      } catch (err) { console.error(err) }
    }
    loadPlan()
  }, [profile])

  const generatePlan = async () => {
    if (!profile?.primaryTarget) {
      toast.error('Please lock a primary target exam in your profile first.')
      return
    }
    setLoading(true)
    toast.success('K² AI is analyzing syllabus structure...')
    
    try {
      // Direct call to Gemini
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
      const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
      
      const prompt = `You are K², an elite competitive exam strategist for Indian exams. 
Create a strict ${days}-day study plan for the ${profile.primaryTarget.toUpperCase()} exam. 
The student is weak in: ${weakSubjects || 'No specific weaknesses mentioned'}.
Output ONLY valid JSON. The JSON must be an array of objects. Each object represents a day.
Example format:
[
  { "day": 1, "topic": "Polity: Fundamental Rights", "status": "pending", "focus": "Revision" },
  { "day": 2, "topic": "Quant: Percentages & Ratios", "status": "pending", "focus": "Practice" }
]
Do not include markdown tags. Just the raw JSON array. Keep topics concise but highly specific to the exam syllabus.`

      const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      })
      
      const data = await res.json()
      let text = data.candidates[0].content.parts[0].text
      text = text.replace(/```json/g, '').replace(/```/g, '').trim()
      
      const parsed = JSON.parse(text)
      setPlan(parsed)
      localStorage.setItem(`pb_plan_${profile.uid}`, JSON.stringify(parsed))
      toast.success('Your personalized Lakshya Tracker is ready! 🎯')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = (index) => {
    const updated = [...plan]
    updated[index].status = updated[index].status === 'completed' ? 'pending' : 'completed'
    setPlan(updated)
    localStorage.setItem(`pb_plan_${profile.uid}`, JSON.stringify(updated))
    if (updated[index].status === 'completed') {
      toast.success('Task completed! +5 Points 🏆')
      // If we had a direct point adder, we'd call it here
    }
  }

  const completedCount = plan ? plan.filter(d => d.status === 'completed').length : 0
  const progress = plan ? Math.round((completedCount / plan.length) * 100) : 0

  return (
    <div className="page animate-fade-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Mera Lakshya Tracker 🎯</h1>
          <p className="page-subtitle">AI-generated dynamic syllabus schedule tailored to your weaknesses.</p>
        </div>
      </div>

      {!plan ? (
        <div className="card card-p" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <Brain size={48} color="var(--purple)" style={{ marginBottom: 16 }} />
          <h2 style={{ marginBottom: 12 }}>Build Your Strategy</h2>
          <p style={{ color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.5 }}>
            Let K² AI analyze the {profile?.primaryTarget?.toUpperCase() || 'Exam'} syllabus and build a day-by-day checklist designed to finish your preparation exactly on time.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left', marginBottom: 24 }}>
            <div className="form-group">
              <label className="form-label">Days to Exam</label>
              <select className="form-select" value={days} onChange={e => setDays(Number(e.target.value))}>
                <option value={15}>15 Days (Crash Course)</option>
                <option value={30}>30 Days (Standard)</option>
                <option value={60}>60 Days (Comprehensive)</option>
                <option value={90}>90 Days (Deep Dive)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Weak Subjects / Focus Areas</label>
              <input 
                className="form-input" 
                placeholder="e.g. Modern History, Data Interpretation" 
                value={weakSubjects}
                onChange={e => setWeakSubjects(e.target.value)}
              />
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: 14 }} onClick={generatePlan} disabled={loading}>
            {loading ? <RefreshCw size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={18} />}
            {loading ? 'Consulting Strategy Algorithms...' : 'Generate My Strategy Plan'}
          </button>
        </div>
      ) : (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          <div className="card card-p" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0' }}>{days}-Day Execution Plan</h3>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-3)' }}>
                {completedCount} of {plan.length} tasks completed
              </div>
            </div>
            <div style={{ width: 120 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4, fontWeight: 700, color: 'var(--cyan)' }}>
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--cyan)', width: `${progress}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => { if(window.confirm('Delete this plan and start over?')) { setPlan(null); localStorage.removeItem(`pb_plan_${profile.uid}`) } }}>
              Regenerate Plan
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {plan.map((task, idx) => (
              <div 
                key={idx} 
                className="card" 
                style={{ 
                  padding: '16px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 16,
                  borderLeft: task.status === 'completed' ? '4px solid var(--emerald)' : '4px solid var(--border)',
                  opacity: task.status === 'completed' ? 0.6 : 1,
                  transition: 'var(--t)',
                  cursor: 'pointer'
                }}
                onClick={() => toggleTask(idx)}
              >
                <div style={{ flexShrink: 0 }}>
                  <CheckCircle size={24} color={task.status === 'completed' ? 'var(--emerald)' : 'var(--text-4)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, marginBottom: 4 }}>DAY {task.day} • {task.focus?.toUpperCase() || 'STUDY'}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: task.status === 'completed' ? 'var(--text-3)' : 'var(--text-1)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                    {task.topic}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
