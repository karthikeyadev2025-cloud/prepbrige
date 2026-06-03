import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, FileText, Search, Filter, Save, X, ExternalLink } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const PAPER_TYPES = ['question_paper', 'model_paper', 'mock_test', 'quiz', 'sample_paper']
const DIFFICULTIES = ['easy', 'medium', 'hard']
const TYPE_LABELS = { question_paper: 'Official', model_paper: 'Model', mock_test: 'Mock Test', quiz: 'Quiz', sample_paper: 'Sample' }
const TYPE_COLORS = { question_paper: '#1E40AF', model_paper: '#059669', mock_test: '#D97706', quiz: '#0891B2', sample_paper: '#7C2D12' }

export default function AdminPapers() {
  const [papers, setPapers] = useState([])
  const [boards, setBoards] = useState([])
  const [exams, setExams] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPaper, setEditingPaper] = useState(null)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  const emptyForm = { title: '', board_id: '', exam_id: '', subject_id: '', year: new Date().getFullYear(), paper_type: 'question_paper', difficulty: 'medium', total_marks: 100, duration_minutes: 180, is_official: false, file_url: '', description: '', language: 'English' }
  const [form, setForm] = useState(emptyForm)

  const loadPapers = async (reset = false) => {
    const p = reset ? 0 : page
    if (reset) setPage(0)
    let q = supabase.from('question_papers').select('*, boards(short_name), exams(name)', { count: 'exact' }).order('created_at', { ascending: false }).range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1)
    if (search) q = q.ilike('title', `%${search}%`)
    if (filterType) q = q.eq('paper_type', filterType)
    const { data } = await q
    if (reset) setPapers(data ?? [])
    else setPapers(prev => [...prev, ...(data ?? [])])
    setLoading(false)
  }

  useEffect(() => {
    Promise.all([
      supabase.from('boards').select('id, name, short_name').order('display_order'),
      supabase.from('exams').select('id, name, board_id').order('display_order'),
      supabase.from('subjects').select('id, name, course_id').order('name'),
    ]).then(([b, e, s]) => {
      setBoards(b.data ?? [])
      setExams(e.data ?? [])
      setSubjects(s.data ?? [])
    })
    loadPapers(true)
  }, [])

  useEffect(() => { loadPapers(true) }, [search, filterType])

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return }
    setSaving(true)
    try {
      const payload = { ...form, board_id: form.board_id || null, exam_id: form.exam_id || null, subject_id: form.subject_id || null, file_url: form.file_url || null, description: form.description || null }
      if (editingPaper) {
        await supabase.from('question_papers').update(payload).eq('id', editingPaper.id)
        toast.success('Paper updated')
      } else {
        await supabase.from('question_papers').insert(payload)
        toast.success('Paper added')
      }
      setShowForm(false)
      setEditingPaper(null)
      setForm(emptyForm)
      loadPapers(true)
    } catch (e) {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this paper?')) return
    await supabase.from('question_papers').delete().eq('id', id)
    toast.success('Deleted')
    loadPapers(true)
  }

  const startEdit = (p) => {
    setForm({ title: p.title, board_id: p.board_id ?? '', exam_id: p.exam_id ?? '', subject_id: p.subject_id ?? '', year: p.year ?? new Date().getFullYear(), paper_type: p.paper_type, difficulty: p.difficulty ?? 'medium', total_marks: p.total_marks, duration_minutes: p.duration_minutes, is_official: p.is_official, file_url: p.file_url ?? '', description: p.description ?? '', language: p.language ?? 'English' })
    setEditingPaper(p)
    setShowForm(true)
  }

  const inputStyle = { width: '100%', padding: '10px 12px', background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-1)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }

  return (
    <div className="page animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700 }}>Question Papers</h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-3)' }}>Manage official, model, mock, and quiz papers</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingPaper(null); setForm(emptyForm) }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'linear-gradient(135deg, #1E40AF, #0891B2)', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
          <Plus size={16} /> Add Paper
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--bg-3)', border: '1px solid rgba(30,64,175,0.3)', borderRadius: 'var(--r-md)', padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>{editingPaper ? 'Edit Paper' : 'New Paper'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="AP SSC Mathematics March 2025" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Board</label>
              <select value={form.board_id} onChange={e => setForm(f => ({ ...f, board_id: e.target.value }))} style={inputStyle}>
                <option value="">No board</option>
                {boards.map(b => <option key={b.id} value={b.id}>{b.short_name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Exam</label>
              <select value={form.exam_id} onChange={e => setForm(f => ({ ...f, exam_id: e.target.value }))} style={inputStyle}>
                <option value="">No exam</option>
                {exams.filter(e => !form.board_id || e.board_id === form.board_id).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Paper Type *</label>
              <select value={form.paper_type} onChange={e => setForm(f => ({ ...f, paper_type: e.target.value }))} style={inputStyle}>
                {PAPER_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} style={inputStyle}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Year</label>
              <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) || 0 }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Total Marks</label>
              <input type="number" value={form.total_marks} onChange={e => setForm(f => ({ ...f, total_marks: parseInt(e.target.value) || 0 }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Duration (min)</label>
              <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 0 }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Language</label>
              <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} style={inputStyle}>
                {['English', 'Telugu', 'Hindi', 'Urdu'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>PDF URL (optional)</label>
              <input value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="is_official" checked={form.is_official} onChange={e => setForm(f => ({ ...f, is_official: e.target.checked }))} style={{ width: 16, height: 16 }} />
              <label htmlFor="is_official" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Official paper</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#1E40AF', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontWeight: 600 }}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save Paper'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingPaper(null) }} style={{ padding: '10px 16px', background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 20, padding: '8px 14px', flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--text-3)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search papers..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: '0.85rem', width: '100%' }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '8px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text-2)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}>
          <option value="">All Types</option>
          {PAPER_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array(5).fill(0).map((_, i) => <div key={i} style={{ height: 60, background: 'var(--bg-3)', borderRadius: 'var(--r-md)', animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : papers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-3)' }}>
          <FileText size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>No papers found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {papers.map(p => {
            const color = TYPE_COLORS[p.paper_type] ?? '#1E40AF'
            return (
              <div key={p.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={16} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ padding: '1px 6px', borderRadius: 5, background: `${color}15`, color, fontSize: '0.68rem', fontWeight: 700 }}>{TYPE_LABELS[p.paper_type]}</span>
                    {p.year && <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{p.year}</span>}
                    {p.boards && <span style={{ fontSize: '0.72rem', color: '#60A5FA' }}>{p.boards.short_name}</span>}
                    {p.is_official && <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 700 }}>Official</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {p.file_url && <a href={p.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-3)', padding: 6 }}><ExternalLink size={14} /></a>}
                  <button onClick={() => startEdit(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 6 }}><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 6 }}><Trash2 size={14} /></button>
                </div>
              </div>
            )
          })}
          {papers.length >= PAGE_SIZE && (
            <button onClick={() => { setPage(p => p + 1); loadPapers() }} style={{ padding: 12, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.85rem' }}>
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  )
}
