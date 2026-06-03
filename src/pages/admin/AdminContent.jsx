import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, ChevronRight, ChevronDown, BookOpen, Save, X, Globe, GraduationCap } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const MEDIUMS = ['English', 'Telugu', 'Hindi', 'Urdu']
const EXAM_TYPES = ['board_exam', 'entrance', 'competitive', 'scholarship']

function FieldGroup({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = { width: '100%', padding: '9px 12px', background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-1)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }

export default function AdminContent() {
  const [tab, setTab] = useState('boards')
  const [data, setData] = useState({ boards: [], exams: [], courses: [], subjects: [] })
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [showForm, setShowForm] = useState(null) // { type, parent?, editing? }
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const loadAll = async () => {
    const [boards, exams, courses, subjects] = await Promise.all([
      supabase.from('boards').select('*').order('display_order'),
      supabase.from('exams').select('*').order('display_order'),
      supabase.from('courses').select('*').order('display_order'),
      supabase.from('subjects').select('*').order('display_order'),
    ])
    setData({ boards: boards.data ?? [], exams: exams.data ?? [], courses: courses.data ?? [], subjects: subjects.data ?? [] })
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  const openForm = (type, parent = null, editing = null) => {
    const defaults = {
      boards: { name: '', short_name: '', state_code: '', description: '', display_order: 0 },
      exams: { name: '', description: '', exam_type: 'board_exam', display_order: 0, board_id: parent?.id ?? '' },
      courses: { name: '', description: '', medium: 'English', class_level: '', is_active: true, display_order: 0, exam_id: parent?.id ?? '', board_id: parent?.board_id ?? '' },
      subjects: { name: '', description: '', color_hex: '#1E40AF', display_order: 0, course_id: parent?.id ?? '' },
    }
    setForm(editing ? { ...defaults[type], ...editing } : defaults[type])
    setShowForm({ type, parent, editing })
  }

  const handleSave = async () => {
    if (!form.name?.trim()) { toast.error('Name required'); return }
    setSaving(true)
    const { type, editing } = showForm
    try {
      const payload = { ...form }
      // Clean empty strings to null for FK fields
      ;['board_id', 'exam_id', 'course_id'].forEach(k => { if (payload[k] === '') payload[k] = null })
      if (editing) {
        await supabase.from(type).update(payload).eq('id', editing.id)
        toast.success('Updated')
      } else {
        await supabase.from(type).insert(payload)
        toast.success('Created')
      }
      setShowForm(null)
      await loadAll()
    } catch (e) {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  const handleDelete = async (type, id, name) => {
    if (!window.confirm(`Delete "${name}"? This may also delete related records.`)) return
    await supabase.from(type).delete().eq('id', id)
    toast.success('Deleted')
    await loadAll()
  }

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const tabs = [
    { key: 'boards', label: 'Boards', count: data.boards.length },
    { key: 'exams', label: 'Exams', count: data.exams.length },
    { key: 'courses', label: 'Courses', count: data.courses.length },
    { key: 'subjects', label: 'Subjects', count: data.subjects.length },
  ]

  return (
    <div className="page animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700 }}>Boards & Exams</h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-3)' }}>Manage the full board → exam → course → subject hierarchy</p>
        </div>
        <button onClick={() => openForm(tab)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'linear-gradient(135deg, #1E40AF, #0891B2)', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
          <Plus size={16} /> Add {tab.slice(0, -1).charAt(0).toUpperCase() + tab.slice(1, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: tab === t.key ? 'rgba(30,64,175,0.2)' : 'transparent', color: tab === t.key ? '#60A5FA' : 'var(--text-3)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
            {t.label}
            <span style={{ padding: '1px 6px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', fontSize: '0.7rem' }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Inline Form */}
      {showForm && showForm.type === tab && (
        <div style={{ background: 'var(--bg-3)', border: '1px solid rgba(30,64,175,0.3)', borderRadius: 'var(--r-md)', padding: 20, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>{showForm.editing ? 'Edit' : 'New'} {tab.slice(0, -1).charAt(0).toUpperCase() + tab.slice(1, -1)}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <FieldGroup label="Name *">
              <input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter name" style={inputStyle} />
            </FieldGroup>
            {tab === 'boards' && <>
              <FieldGroup label="Short Name">
                <input value={form.short_name ?? ''} onChange={e => setForm(f => ({ ...f, short_name: e.target.value }))} placeholder="BSEAP" style={inputStyle} />
              </FieldGroup>
              <FieldGroup label="State Code">
                <input value={form.state_code ?? ''} onChange={e => setForm(f => ({ ...f, state_code: e.target.value }))} placeholder="AP / TS / CBSE / NTA" style={inputStyle} />
              </FieldGroup>
            </>}
            {tab === 'exams' && <>
              <FieldGroup label="Board">
                <select value={form.board_id ?? ''} onChange={e => setForm(f => ({ ...f, board_id: e.target.value }))} style={inputStyle}>
                  <option value="">No board</option>
                  {data.boards.map(b => <option key={b.id} value={b.id}>{b.short_name}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Exam Type">
                <select value={form.exam_type ?? 'board_exam'} onChange={e => setForm(f => ({ ...f, exam_type: e.target.value }))} style={inputStyle}>
                  {EXAM_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </FieldGroup>
            </>}
            {tab === 'courses' && <>
              <FieldGroup label="Exam">
                <select value={form.exam_id ?? ''} onChange={e => setForm(f => ({ ...f, exam_id: e.target.value }))} style={inputStyle}>
                  <option value="">No exam</option>
                  {data.exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Medium">
                <select value={form.medium ?? 'English'} onChange={e => setForm(f => ({ ...f, medium: e.target.value }))} style={inputStyle}>
                  {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Class Level">
                <input value={form.class_level ?? ''} onChange={e => setForm(f => ({ ...f, class_level: e.target.value }))} placeholder="Class 10 / Class 11-12" style={inputStyle} />
              </FieldGroup>
            </>}
            {tab === 'subjects' && <>
              <FieldGroup label="Course">
                <select value={form.course_id ?? ''} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} style={inputStyle}>
                  <option value="">No course</option>
                  {data.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Color">
                <input type="color" value={form.color_hex ?? '#1E40AF'} onChange={e => setForm(f => ({ ...f, color_hex: e.target.value }))} style={{ ...inputStyle, padding: 4, height: 40, cursor: 'pointer' }} />
              </FieldGroup>
            </>}
            <FieldGroup label="Description">
              <input value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" style={inputStyle} />
            </FieldGroup>
            <FieldGroup label="Display Order">
              <input type="number" value={form.display_order ?? 0} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} style={inputStyle} />
            </FieldGroup>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#1E40AF', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontWeight: 600 }}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setShowForm(null)} style={{ padding: '10px 16px', background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array(4).fill(0).map((_, i) => <div key={i} style={{ height: 56, background: 'var(--bg-3)', borderRadius: 'var(--r-md)', animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* BOARDS */}
          {tab === 'boards' && data.boards.map(board => {
            const boardExams = data.exams.filter(e => e.board_id === board.id)
            return (
              <div key={board.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(30,64,175,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Globe size={16} color="#60A5FA" />
                  </div>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => toggle(board.id)}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{board.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{board.short_name} · {boardExams.length} exams</div>
                  </div>
                  <button onClick={() => openForm('exams', board)} style={{ padding: '5px 10px', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 6, color: '#34D399', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>+ Exam</button>
                  <button onClick={() => openForm('boards', null, board)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete('boards', board.id, board.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}><Trash2 size={14} /></button>
                  <button onClick={() => toggle(board.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
                    {expanded[board.id] ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </button>
                </div>
                {expanded[board.id] && boardExams.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingLeft: 52, paddingRight: 16, paddingBottom: 10 }}>
                    {boardExams.map(exam => (
                      <div key={exam.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ flex: 1, fontSize: '0.85rem' }}>{exam.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', background: 'var(--bg-4)', padding: '2px 8px', borderRadius: 6 }}>{exam.exam_type?.replace('_', ' ')}</span>
                        <button onClick={() => openForm('exams', null, exam)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><Edit3 size={13} /></button>
                        <button onClick={() => handleDelete('exams', exam.id, exam.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* EXAMS */}
          {tab === 'exams' && data.exams.map(exam => {
            const board = data.boards.find(b => b.id === exam.board_id)
            return (
              <div key={exam.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>{exam.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{board?.short_name ?? 'No board'} · {exam.exam_type?.replace('_', ' ')}</div>
                </div>
                <button onClick={() => openForm('exams', null, exam)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><Edit3 size={14} /></button>
                <button onClick={() => handleDelete('exams', exam.id, exam.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}><Trash2 size={14} /></button>
              </div>
            )
          })}

          {/* COURSES */}
          {tab === 'courses' && data.courses.map(course => {
            const exam = data.exams.find(e => e.id === course.exam_id)
            return (
              <div key={course.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(5,150,105,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <GraduationCap size={16} color="#34D399" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>{course.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{exam?.name ?? 'No exam'} · {course.medium} · {course.class_level}</div>
                </div>
                <button onClick={() => openForm('courses', null, course)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><Edit3 size={14} /></button>
                <button onClick={() => handleDelete('courses', course.id, course.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}><Trash2 size={14} /></button>
              </div>
            )
          })}

          {/* SUBJECTS */}
          {tab === 'subjects' && data.subjects.map(subject => {
            const course = data.courses.find(c => c.id === subject.course_id)
            return (
              <div key={subject.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 10, height: 36, borderRadius: 4, background: subject.color_hex ?? '#1E40AF', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>{subject.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{course?.name ?? 'No course'}</div>
                </div>
                <button onClick={() => openForm('subjects', null, subject)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><Edit3 size={14} /></button>
                <button onClick={() => handleDelete('subjects', subject.id, subject.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}><Trash2 size={14} /></button>
              </div>
            )
          })}

          {data[tab].length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-3)' }}>
              <BookOpen size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ fontWeight: 600 }}>No {tab} yet. Use the button above to add the first one.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
