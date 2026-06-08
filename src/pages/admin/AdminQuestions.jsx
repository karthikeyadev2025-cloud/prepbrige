import { useState, useEffect } from 'react'
import { getSupabaseExamQuestions } from '../../services/supabaseService'
import { Plus, Upload, Search, Edit, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ text: '', options: ['','','',''], correct: 0, explanation: '', subject: 'GK', difficulty: 'medium', exam: 'general' })

  useEffect(() => {
    async function fetchQuestions() {
      const qList = await getSupabaseExamQuestions(null, 50)
      setQuestions(qList)
    }
    fetchQuestions()
  }, [])

  const filtered = questions.filter(q =>
    !search || q.text.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async () => {
    if (!form.text.trim()) { toast.error('Question text required'); return }
    try {
      const { data, error } = await supabase.from('questions').insert({
        question_text: form.text,
        options: form.options.map(o => ({ text: o })),
        correct_option_id: form.correct,
        explanation: form.explanation,
        subject_id: form.subject
      }).select()

      if (error) throw error

      if (data && data[0]) {
        const questionId = data[0].id
        const { error: mapError } = await supabase.from('question_exam_mapping').insert({
          question_id: questionId,
          exam_id: form.exam
        })
        if (mapError) throw mapError
      }

      toast.success('Question added to database!')
      setShowAdd(false)
      setForm({ text: '', options: ['','','',''], correct: 0, explanation: '', subject: 'GK', difficulty: 'medium', exam: 'general' })
      const qList = await getSupabaseExamQuestions(null, 50)
      setQuestions(qList)
    } catch (e) {
      console.warn('DB Insert failed, saving locally:', e)
      setQuestions(qs => [...qs, { ...form, id: 'new_' + Date.now(), num: qs.length + 1 }])
      setShowAdd(false)
      setForm({ text: '', options: ['','','',''], correct: 0, explanation: '', subject: 'GK', difficulty: 'medium', exam: 'general' })
      toast.success('Saved locally')
    }
  }

  const handleDelete = async (qId, idx) => {
    if (!window.confirm('Delete this question from database?')) return
    try {
      if (qId && !String(qId).startsWith('new_')) {
        await supabase.from('question_exam_mapping').delete().eq('question_id', qId)
        const { error } = await supabase.from('questions').delete().eq('id', qId)
        if (error) throw error
      }
      setQuestions(qs => qs.filter((_, i) => i !== idx))
      toast.success('Deleted from database!')
    } catch (e) {
      console.warn('DB delete failed, removing locally:', e)
      setQuestions(qs => qs.filter((_, i) => i !== idx))
      toast.success('Removed locally')
    }
  }

  return (
    <div className="page animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Question Bank Manager</h2>
          <p style={{ margin: 0 }}>{questions.length.toLocaleString()} questions total (demo sample)</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={() => toast.success('CSV import dialog opening...')}><Upload size={14} /> Bulk Import CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Question</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '8px 16px' }}>
          <Search size={14} color="var(--text-3)" />
          <input style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: '0.88rem', fontFamily: 'inherit', flex: 1 }} placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {showAdd && (
        <div className="card card-p" style={{ marginBottom: 24, border: '1px solid var(--border-cyan)' }}>
          <h4 style={{ marginBottom: 16 }}>Add New Question</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Question Text</label>
              <textarea className="form-input" rows={3} value={form.text} onChange={e => setForm(f => ({...f, text: e.target.value}))} style={{ resize: 'vertical' }} />
            </div>
            {form.options.map((opt, i) => (
              <div key={i} className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Option {String.fromCharCode(65+i)}
                  <input type="radio" name="correct" checked={form.correct === i} onChange={() => setForm(f => ({...f, correct: i}))} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--emerald)' }}>Mark as correct</span>
                </label>
                <input className="form-input" value={opt} onChange={e => setForm(f => { const ops = [...f.options]; ops[i] = e.target.value; return {...f, options: ops} })} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Exam</label>
                <select className="form-select" value={form.exam} onChange={e => setForm(f => ({...f, exam: e.target.value}))}>
                  <option value="general">General</option>
                  <option value="upsc">UPSC</option>
                  <option value="ssc_cgl">SSC CGL</option>
                  <option value="ibps_po">IBPS PO</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input className="form-input" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select className="form-select" value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value}))}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Explanation</label>
              <textarea className="form-input" rows={2} value={form.explanation} onChange={e => setForm(f => ({...f, explanation: e.target.value}))} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Question</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((q, i) => (
          <div key={q.id || i} className="card" style={{ padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'var(--bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', flexShrink: 0 }}>{i+1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 6 }}>{q.text}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-cyan">{q.exam?.toUpperCase()}</span>
                <span className="badge badge-purple">{q.subject}</span>
                <span className={`badge ${q.difficulty === 'easy' ? 'badge-emerald' : q.difficulty === 'hard' ? 'badge-red' : 'badge-amber'}`}>{q.difficulty}</span>
                {q.year && <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-3)' }}>PYQ {q.year}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button className="topbar-btn" style={{ width: 30, height: 30 }} onClick={() => toast.success('Edit dialog coming soon!')}><Edit size={12} /></button>
              <button className="topbar-btn" style={{ width: 30, height: 30, color: 'var(--red)' }} onClick={() => handleDelete(q.id, i)}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
