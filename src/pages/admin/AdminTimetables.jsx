import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Calendar, ChevronDown, ChevronUp, Clock, CheckCircle, X, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function AdminTimetables() {
  const [timetables, setTimetables] = useState([])
  const [boards, setBoards] = useState([])
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [showEntryForm, setShowEntryForm] = useState(null) // timetable id
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ title: '', board_id: '', exam_id: '', academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().slice(2), is_official: true })
  const [entryForm, setEntryForm] = useState({ subject_name: '', exam_date: '', exam_time: '09:30 AM', duration_minutes: 180, notes: '' })

  useEffect(() => {
    Promise.all([
      supabase.from('exam_timetables').select('*, timetable_entries(*)').order('created_at', { ascending: false }),
      supabase.from('boards').select('id, name, short_name').order('display_order'),
      supabase.from('exams').select('id, name, board_id').order('display_order'),
    ]).then(([tt, b, e]) => {
      setTimetables(tt.data ?? [])
      setBoards(b.data ?? [])
      setExams(e.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const reload = async () => {
    const { data } = await supabase.from('exam_timetables').select('*, timetable_entries(*)').order('created_at', { ascending: false })
    setTimetables(data ?? [])
  }

  const handleSaveTimetable = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return }
    setSaving(true)
    try {
      if (editingEntry) {
        await supabase.from('exam_timetables').update({ ...form }).eq('id', editingEntry.id)
        toast.success('Timetable updated')
      } else {
        await supabase.from('exam_timetables').insert({ ...form })
        toast.success('Timetable created')
      }
      setShowForm(false)
      setEditingEntry(null)
      setForm({ title: '', board_id: '', exam_id: '', academic_year: form.academic_year, is_official: true })
      await reload()
    } catch (e) {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  const handleDeleteTimetable = async (id) => {
    if (!window.confirm('Delete this timetable and all its entries?')) return
    await supabase.from('timetable_entries').delete().eq('timetable_id', id)
    await supabase.from('exam_timetables').delete().eq('id', id)
    toast.success('Deleted')
    await reload()
  }

  const handleAddEntry = async (timetableId) => {
    if (!entryForm.subject_name.trim() || !entryForm.exam_date) { toast.error('Subject and date required'); return }
    setSaving(true)
    await supabase.from('timetable_entries').insert({ ...entryForm, timetable_id: timetableId })
    toast.success('Entry added')
    setShowEntryForm(null)
    setEntryForm({ subject_name: '', exam_date: '', exam_time: '09:30 AM', duration_minutes: 180, notes: '' })
    await reload()
    setSaving(false)
  }

  const handleDeleteEntry = async (entryId) => {
    await supabase.from('timetable_entries').delete().eq('id', entryId)
    toast.success('Entry removed')
    await reload()
  }

  const startEdit = (tt) => {
    setForm({ title: tt.title, board_id: tt.board_id ?? '', exam_id: tt.exam_id ?? '', academic_year: tt.academic_year ?? '', is_official: tt.is_official })
    setEditingEntry(tt)
    setShowForm(true)
  }

  const inputStyle = { width: '100%', padding: '10px 12px', background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-1)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }

  return (
    <div className="page animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700 }}>Timetable Manager</h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-3)' }}>Manage official and custom exam schedules</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingEntry(null); setForm({ title: '', board_id: '', exam_id: '', academic_year: form.academic_year, is_official: true }) }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'linear-gradient(135deg, #1E40AF, #0891B2)', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
          <Plus size={16} /> New Timetable
        </button>
      </div>

      {/* Create/Edit Timetable Form */}
      {showForm && (
        <div style={{ background: 'var(--bg-3)', border: '1px solid rgba(30,64,175,0.3)', borderRadius: 'var(--r-md)', padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>{editingEntry ? 'Edit Timetable' : 'New Timetable'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="AP SSC March 2026" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Board</label>
              <select value={form.board_id} onChange={e => setForm(f => ({ ...f, board_id: e.target.value }))} style={inputStyle}>
                <option value="">Select Board</option>
                {boards.map(b => <option key={b.id} value={b.id}>{b.short_name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Exam</label>
              <select value={form.exam_id} onChange={e => setForm(f => ({ ...f, exam_id: e.target.value }))} style={inputStyle}>
                <option value="">Select Exam</option>
                {exams.filter(e => !form.board_id || e.board_id === form.board_id).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Academic Year</label>
              <input value={form.academic_year} onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))} placeholder="2025-26" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="is_official" checked={form.is_official} onChange={e => setForm(f => ({ ...f, is_official: e.target.checked }))} style={{ width: 16, height: 16 }} />
              <label htmlFor="is_official" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Official timetable</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSaveTimetable} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#1E40AF', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontWeight: 600 }}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingEntry(null) }}
              style={{ padding: '10px 16px', background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-2)', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array(3).fill(0).map((_, i) => <div key={i} style={{ height: 64, background: 'var(--bg-3)', borderRadius: 'var(--r-md)', animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : timetables.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-3)' }}>
          <Calendar size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>No timetables yet. Create your first one above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {timetables.map(tt => {
            const isExpanded = expandedId === tt.id
            const entries = tt.timetable_entries ?? []
            return (
              <div key={tt.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : tt.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tt.title}</span>
                      {tt.is_official && <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(30,64,175,0.15)', color: '#60A5FA', fontSize: '0.7rem', fontWeight: 700 }}>Official</span>}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{entries.length} entries • {tt.academic_year}</span>
                  </div>
                  <button onClick={() => startEdit(tt)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 6 }}><Edit3 size={15} /></button>
                  <button onClick={() => handleDeleteTimetable(tt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 6 }}><Trash2 size={15} /></button>
                  <button onClick={() => setExpandedId(isExpanded ? null : tt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 6 }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Entries */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
                    {entries.sort((a, b) => a.exam_date.localeCompare(b.exam_date)).map(e => (
                      <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <Calendar size={13} color="var(--text-3)" />
                        <span style={{ flex: 1, fontSize: '0.85rem' }}>{e.subject_name}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{e.exam_date}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{e.exam_time}</span>
                        <button onClick={() => handleDeleteEntry(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}><X size={13} /></button>
                      </div>
                    ))}

                    {/* Add entry form */}
                    {showEntryForm === tt.id ? (
                      <div style={{ marginTop: 12, padding: 14, background: 'var(--bg-4)', borderRadius: 8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Subject *</label>
                            <input value={entryForm.subject_name} onChange={e => setEntryForm(f => ({ ...f, subject_name: e.target.value }))} placeholder="Mathematics" style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Date *</label>
                            <input type="date" value={entryForm.exam_date} onChange={e => setEntryForm(f => ({ ...f, exam_date: e.target.value }))} style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Time</label>
                            <input value={entryForm.exam_time} onChange={e => setEntryForm(f => ({ ...f, exam_time: e.target.value }))} placeholder="09:30 AM" style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Duration (min)</label>
                            <input type="number" value={entryForm.duration_minutes} onChange={e => setEntryForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 0 }))} style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Notes</label>
                            <input value={entryForm.notes} onChange={e => setEntryForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" style={inputStyle} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleAddEntry(tt.id)} disabled={saving} style={{ padding: '8px 16px', background: '#059669', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>Add Entry</button>
                          <button onClick={() => setShowEntryForm(null)} style={{ padding: '8px 12px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.82rem' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowEntryForm(tt.id)}
                        style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.25)', borderRadius: 8, color: '#34D399', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                        <Plus size={14} /> Add Entry
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
