import React, { useState } from 'react'
import { QUESTION_BANK, MOCK_TESTS } from '../../data/questions'
import { Plus, Upload, Search, Filter, Edit, Trash2, Eye, ChevronDown } from 'lucide-react'
import { toast } from 'react-hot-toast'

const allQ = Object.entries(QUESTION_BANK).flatMap(([exam, subjects]) =>
  Object.entries(subjects).flatMap(([subject, qs]) => qs.map(q => ({ ...q, exam, subject })))
)

export default function AdminQuestions() {
  const [questions, setQuestions] = useState(allQ)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ text: '', options: ['','','',''], correct: 0, explanation: '', subject: 'GK', difficulty: 'medium', exam: 'general' })

  const filtered = questions.filter(q =>
    !search || q.text.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = () => {
    if (!form.text.trim()) { toast.error('Question text required'); return }
    setQuestions(qs => [...qs, { ...form, id: 'new_' + Date.now(), num: qs.length + 1 }])
    setShowAdd(false)
    setForm({ text: '', options: ['','','',''], correct: 0, explanation: '', subject: 'GK', difficulty: 'medium', exam: 'general' })
    toast.success('Question added!')
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
              <button className="topbar-btn" style={{ width: 30, height: 30 }} onClick={() => toast.success('Edit dialog opening...')}><Edit size={12} /></button>
              <button className="topbar-btn" style={{ width: 30, height: 30, color: 'var(--red)' }} onClick={() => { setQuestions(qs => qs.filter((_, idx) => idx !== i)); toast.success('Deleted') }}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
