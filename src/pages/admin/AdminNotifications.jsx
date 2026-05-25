import React, { useState } from 'react'
import { Send, Bell, Users, Target, Clock, CheckCircle, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { EXAM_CATEGORIES, ALL_STATES } from '../../data/exams'

const SENT_NOTIFS = [
  { id:1, title:'SSC CGL 2025 Notification Out!', body:'17,727 vacancies. Apply by July 15.', target:'SSC CGL', sent:'2 hours ago', recipients:45230, opens:18432 },
  { id:2, title:'UPSC Prelims Admit Card Released', body:'Download from upsc.gov.in using your roll number.', target:'UPSC', sent:'1 day ago', recipients:67000, opens:54200 },
  { id:3, title:'Daily Current Affairs — May 26', body:'Top 10 news for competitive exams today.', target:'All Users', sent:'Today 7:00 AM', recipients:245832, opens:89432 },
  { id:4, title:'New Mock Test Added — IBPS PO 2025', body:'50-question mock test based on latest pattern.', target:'Banking', sent:'2 days ago', recipients:89230, opens:34120 },
]

export default function AdminNotifications() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetExam, setTargetExam] = useState('all')
  const [targetState, setTargetState] = useState('all')
  const [sending, setSending] = useState(false)
  const [type, setType] = useState('general')

  const handleSend = async () => {
    if (!title || !body) { toast.error('Fill title and message'); return }
    setSending(true)
    await new Promise(r => setTimeout(r, 1500))
    toast.success(`Notification sent to ${targetExam === 'all' ? 'all users' : targetExam + ' aspirants'}!`)
    setTitle(''); setBody('')
    setSending(false)
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Push Notifications 🔔</h1>
          <p className="page-subtitle">Send targeted notifications to students instantly</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Sent', value: '1,243', icon: '📤', color: 'var(--purple)' },
          { label: 'Avg Open Rate', value: '68%', icon: '👁️', color: 'var(--cyan)' },
          { label: 'Subscribed Users', value: '1.89L', icon: '🔔', color: 'var(--emerald)' },
          { label: 'Sent Today', value: '3', icon: '📅', color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} className="card card-p" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Compose */}
        <div className="card card-p">
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} /> Compose Notification
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Notification Type</label>
              <div className="tabs">
                {[['general','General'],['vacancy','Vacancy'],['result','Result'],['date','Exam Date']].map(([v,l]) => (
                  <button key={v} className={`tab ${type===v ? 'active' : ''}`} onClick={() => setType(v)} style={{ fontSize: '0.75rem', padding: '6px 10px' }}>{l}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Title <span style={{ color: 'var(--red)' }}>*</span></label>
              <input className="form-input" placeholder="e.g. SSC CGL 2025 Notification Released" value={title} onChange={e => setTitle(e.target.value)} maxLength={80} />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', textAlign: 'right' }}>{title.length}/80</div>
            </div>
            <div className="form-group">
              <label className="form-label">Message <span style={{ color: 'var(--red)' }}>*</span></label>
              <textarea className="form-input" rows={3} placeholder="Notification body message..." value={body} onChange={e => setBody(e.target.value)} style={{ resize: 'vertical' }} maxLength={200} />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', textAlign: 'right' }}>{body.length}/200</div>
            </div>
            <div className="form-group">
              <label className="form-label">Target Exam</label>
              <select className="form-select" value={targetExam} onChange={e => setTargetExam(e.target.value)}>
                <option value="all">All Users (2.45L)</option>
                {EXAM_CATEGORIES.map(cat => (
                  <optgroup key={cat.id} label={cat.label}>
                    {cat.exams.slice(0,3).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target State (Optional)</label>
              <select className="form-select" value={targetState} onChange={e => setTargetState(e.target.value)}>
                <option value="all">All States</option>
                {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Preview */}
            {(title || body) && (
              <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginBottom: 8 }}>📱 Preview</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: 'var(--grad)', borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⚡</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>PrepBridge {title && `— ${title}`}</div>
                    {body && <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{body}</div>}
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleSend} disabled={sending || !title || !body} className="btn btn-primary" style={{ gap: 8, justifyContent: 'center' }}>
              {sending ? '⏳ Sending...' : <><Send size={15} /> Send Now</>}
            </button>
          </div>
        </div>

        {/* History */}
        <div>
          <h3 style={{ marginBottom: 16 }}>Recent Notifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SENT_NOTIFS.map(n => (
              <div key={n.id} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>{n.title}</div>
                  <span style={{ fontSize: '0.68rem', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '2px 8px', color: 'var(--text-3)', marginLeft: 8, flexShrink: 0 }}>{n.target}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 10 }}>{n.body}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.72rem', color: 'var(--text-4)' }}>
                  <span><Users size={10} style={{ display: 'inline', marginRight: 3 }} />{n.recipients.toLocaleString()} sent</span>
                  <span><CheckCircle size={10} style={{ display: 'inline', marginRight: 3 }} />{n.opens.toLocaleString()} opened ({Math.round(n.opens/n.recipients*100)}%)</span>
                  <span><Clock size={10} style={{ display: 'inline', marginRight: 3 }} />{n.sent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
