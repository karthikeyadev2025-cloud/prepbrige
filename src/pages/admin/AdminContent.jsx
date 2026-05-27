import { useState } from 'react'
import { Plus, Edit3, Trash2, Eye, Upload, CheckCircle } from 'lucide-react'
import { EXAM_CATEGORIES } from '../../data/exams'
import { toast } from 'react-hot-toast'

const CONTENT_ITEMS = [
  { id:1, type:'course', title:'UPSC CSE Complete Course 2025', exam:'UPSC', status:'published', lessons:320, updated:'2 days ago' },
  { id:2, type:'notes', title:'SSC CGL Reasoning Notes PDF', exam:'SSC CGL', status:'published', lessons:null, updated:'5 days ago' },
  { id:3, type:'current_affairs', title:'Current Affairs May 2025', exam:'All Exams', status:'published', lessons:null, updated:'Today' },
  { id:4, type:'course', title:'Banking Awareness Crash Course', exam:'Banking', status:'draft', lessons:80, updated:'1 week ago' },
  { id:5, type:'textbook', title:'NCERTs History Class 6-12', exam:'UPSC', status:'published', lessons:null, updated:'2 weeks ago' },
  { id:6, type:'notes', title:'Polity Summary Notes', exam:'UPSC/SSC', status:'published', lessons:null, updated:'3 days ago' },
]

const TYPE_ICONS = { course:'🎓', notes:'📝', current_affairs:'📰', textbook:'📚' }
const STATUS_COLORS = { published:'var(--emerald)', draft:'var(--amber)' }

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('course')
  const [newExam, setNewExam] = useState('upsc')

  const filtered = activeTab === 'all' ? CONTENT_ITEMS : CONTENT_ITEMS.filter(c => c.type === activeTab)

  const handleAdd = () => {
    if (!newTitle) { toast.error('Enter content title'); return }
    toast.success(`"${newTitle}" added as draft!`)
    setShowAddModal(false)
    setNewTitle('')
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Content Manager 📚</h1>
          <p className="page-subtitle">Manage courses, notes, textbooks, and current affairs content</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ gap: 6 }}>
          <Plus size={15} /> Add Content
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Courses', value: '48', icon: '🎓', color: 'var(--purple)' },
          { label: 'Study Notes', value: '312', icon: '📝', color: 'var(--cyan)' },
          { label: 'Textbooks', value: '89', icon: '📚', color: 'var(--emerald)' },
          { label: 'Published', value: '392', icon: '✅', color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} className="card card-p" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[['all','All Content'],['course','Courses'],['notes','Notes'],['current_affairs','Current Affairs'],['textbook','Textbooks']].map(([v,l]) => (
          <button key={v} className={`tab ${activeTab===v ? 'active' : ''}`} onClick={() => setActiveTab(v)}>{l}</button>
        ))}
      </div>

      {/* Content Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: 'var(--bg-3)', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '40px 1fr 120px 80px 100px 120px', gap: 12, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)' }}>
          <div></div><div>Content</div><div>Exam</div><div>Lessons</div><div>Status</div><div>Actions</div>
        </div>
        {filtered.map(item => (
          <div key={item.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '40px 1fr 120px 80px 100px 120px', gap: 12, alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontSize: '1.4rem' }}>{TYPE_ICONS[item.type]}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>Updated {item.updated}</div>
            </div>
            <div style={{ fontSize: '0.8rem' }}><span style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--purple)', padding: '3px 8px', borderRadius: 'var(--r-full)', fontSize: '0.72rem' }}>{item.exam}</span></div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{item.lessons ? `${item.lessons} lessons` : '—'}</div>
            <div>
              <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--r-full)', background: `${STATUS_COLORS[item.status]}20`, color: STATUS_COLORS[item.status], fontWeight: 700, textTransform: 'capitalize' }}>{item.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-icon btn-sm" title="Preview"><Eye size={14} /></button>
              <button className="btn btn-ghost btn-icon btn-sm" title="Edit"><Edit3 size={14} /></button>
              <button className="btn btn-ghost btn-icon btn-sm" title="Delete" style={{ color: 'var(--red)' }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Content Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card card-p" style={{ width: '100%', maxWidth: 480, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: 20 }}>Add New Content</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Content Type</label>
                <div className="tabs">
                  {[['course','Course'],['notes','Notes'],['textbook','Textbook'],['current_affairs','Current Affairs']].map(([v,l]) => (
                    <button key={v} className={`tab ${newType===v ? 'active' : ''}`} onClick={() => setNewType(v)} style={{ fontSize: '0.75rem' }}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" placeholder="Content title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Exam</label>
                <select className="form-select" value={newExam} onChange={e => setNewExam(e.target.value)}>
                  <option value="all">All Exams</option>
                  {EXAM_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Upload File (PDF/Video)</label>
                <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--r-md)', padding: '24px', textAlign: 'center', cursor: 'pointer' }}>
                  <Upload size={24} style={{ margin: '0 auto 8px', color: 'var(--text-4)' }} />
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Click to upload or drag & drop</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>PDF, MP4 up to 500MB</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={handleAdd} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', gap: 6 }}>
                  <CheckCircle size={14} /> Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
