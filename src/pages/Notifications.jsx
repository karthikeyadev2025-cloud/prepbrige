import { useState } from 'react'
import { Bell, BellOff, CheckCheck } from 'lucide-react'
import { useUserStore } from '../store/useStore'
import { registerPushNotifications } from '../services/notificationService'
import { toast } from 'react-hot-toast'

const SAMPLE_NOTIFS = [
  { id:1, type:'vacancy', title:'SSC CGL 2025 Notification Released', body:'17,727 vacancies announced. Application starts June 15, 2025. Last date July 15.', time:'2 hours ago', read:false, exam:'SSC CGL', priority:'high' },
  { id:2, type:'result', title:'IBPS PO Prelims 2024 Result Out', body:'Mains exam scheduled for January 12, 2025. Admit cards downloadable from Dec 28.', time:'5 hours ago', read:false, exam:'IBPS PO', priority:'high' },
  { id:3, type:'admit', title:'RRB NTPC Admit Card Available', body:'Download your admit card for CBT-1. Exam dates: Feb 15 – Mar 10, 2025.', time:'1 day ago', read:false, exam:'RRB NTPC', priority:'medium' },
  { id:4, type:'answer_key', title:'UPSC Prelims 2024 Answer Key Released', body:'Official answer key uploaded. Objections can be raised until Dec 10.', time:'2 days ago', read:true, exam:'UPSC', priority:'medium' },
  { id:5, type:'syllabus', title:'BPSC 70th Syllabus Updated', body:'Bihar PSC has revised the mains syllabus. New Optional subjects added.', time:'3 days ago', read:true, exam:'BPSC', priority:'low' },
  { id:6, type:'vacancy', title:'SBI PO 2025 — 2000 Vacancies', body:'State Bank of India announces PO recruitment. Online applications from Jan 1.', time:'4 days ago', read:true, exam:'SBI PO', priority:'high' },
  { id:7, type:'result', title:'NEET UG 2024 Final Result', body:'Final result after NTA correction released. Check on neet.nta.nic.in', time:'5 days ago', read:true, exam:'NEET UG', priority:'high' },
  { id:8, type:'date', title:'JEE Mains 2025 — Exam Dates Announced', body:'Session 1: Jan 22-30, 2025. Session 2: Apr 2-8, 2025.', time:'1 week ago', read:true, exam:'JEE Mains', priority:'medium' },
]

const TYPE_ICONS = {
  vacancy:'📢', result:'🎉', admit:'🪪', answer_key:'🔑', syllabus:'📚', date:'📅'
}
const TYPE_COLORS = {
  vacancy:'var(--purple)', result:'var(--emerald)', admit:'var(--cyan)', answer_key:'var(--amber)', syllabus:'var(--cyan)', date:'var(--red)'
}
const PRIORITY_BADGE = {
  high: { label:'Urgent', color:'var(--red)' },
  medium: { label:'Important', color:'var(--amber)' },
  low: { label:'Info', color:'var(--text-3)' }
}

export default function Notifications() {
  const [filter, setFilter] = useState('all')
  const [notifs, setNotifs] = useState(SAMPLE_NOTIFS)
  const [subscribing, setSubscribing] = useState(false)
  const { user, profile, updateProfile } = useUserStore()

  const handleEnablePush = async () => {
    if (!user?.uid) {
      toast.error('Please sign in to enable notifications.')
      return
    }
    setSubscribing(true)
    try {
      await registerPushNotifications(user.uid)
      toast.success('Push notifications successfully enabled!')
      if (updateProfile) {
        updateProfile({ pushNotificationsEnabled: true })
      }
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to enable push notifications.')
    } finally {
      setSubscribing(false)
    }
  }
  const unread = notifs.filter(n => !n.read).length

  const markAllRead = () => setNotifs(n => n.map(x => ({...x, read:true})))
  const markRead = (id) => setNotifs(n => n.map(x => x.id === id ? {...x, read:true} : x))

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'vacancy') return n.type === 'vacancy'
    if (filter === 'result') return n.type === 'result' || n.type === 'answer_key'
    return true
  })

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            Notifications
            {unread > 0 && <span style={{ background: 'var(--red)', color:'white', fontSize:'0.7rem', fontWeight:800, padding:'2px 8px', borderRadius:'var(--r-full)' }}>{unread} new</span>}
          </h1>
          <p className="page-subtitle">Stay updated on vacancies, results, admit cards & syllabus changes</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn btn-outline btn-sm" style={{ gap: 6 }}>
            <CheckCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      {/* Push notification banner */}
      {!profile?.pushNotificationsEnabled && (
        <div className="card card-p" style={{ marginBottom: 20, background: 'linear-gradient(135deg,rgba(0,212,255,0.08),rgba(124,58,237,0.08))', border: '1px solid rgba(0,212,255,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Bell size={24} color="var(--cyan)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>Enable Push Notifications</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Get instant alerts on your phone for new vacancies, results and important dates — even when the app is closed.</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleEnablePush} disabled={subscribing}>
              {subscribing ? 'Enabling...' : 'Enable Now'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[['all','All'], ['unread','Unread'], ['vacancy','Vacancies'], ['result','Results']].map(([v,l]) => (
          <button key={v} className={`tab ${filter===v ? 'active' : ''}`} onClick={() => setFilter(v)}>
            {l} {v==='unread' && unread > 0 && `(${unread})`}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
            <BellOff size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No notifications here.</p>
          </div>
        ) : filtered.map(notif => (
          <div key={notif.id} onClick={() => markRead(notif.id)} className="card card-hover" style={{ padding: '16px 20px', display: 'flex', gap: 14, cursor: 'pointer', borderLeft: `3px solid ${notif.read ? 'var(--border)' : TYPE_COLORS[notif.type]}`, opacity: notif.read ? 0.75 : 1 }}>
            <div style={{ fontSize: '1.6rem', flexShrink: 0, lineHeight: 1 }}>{TYPE_ICONS[notif.type]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: notif.read ? 500 : 700, fontSize: '0.92rem' }}>{notif.title}</span>
                {!notif.read && <span style={{ width: 7, height: 7, background: 'var(--cyan)', borderRadius: '50%', flexShrink: 0 }} />}
                <span style={{ fontSize: '0.67rem', padding: '2px 8px', borderRadius: 'var(--r-full)', background: `${PRIORITY_BADGE[notif.priority].color}20`, color: PRIORITY_BADGE[notif.priority].color, fontWeight: 700 }}>
                  {PRIORITY_BADGE[notif.priority].label}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 6 }}>{notif.body}</p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', background: 'var(--bg-3)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 'var(--r-full)', color: 'var(--text-3)' }}>{notif.exam}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>{notif.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
