import React, { useState } from 'react'
import { useUserStore } from '../store/useStore'
import { User, Lock, Globe, Bell, LogOut, Camera, Edit3, ChevronRight, Shield, Flame, Star, Target, BookOpen, Clock } from 'lucide-react'
import { signOutUser } from '../firebase/auth'
import { useNavigate } from 'react-router-dom'
import { ALL_LANGUAGES, EXAM_CATEGORIES } from '../data/exams'
import { toast } from 'react-hot-toast'

export default function Profile() {
  const { profile, user, logout, updateProfile } = useUserStore()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [activeTab, setActiveTab] = useState('profile')

  const handleLogout = async () => {
    await signOutUser()
    navigate('/')
    toast.success('Logged out successfully')
  }

  const handleSave = () => {
    updateProfile({ name })
    setEditing(false)
    toast.success('Profile updated!')
  }

  const STATS = [
    { label: 'Tests Taken', value: profile?.stats?.testsTaken || 12, icon: '📋', color: 'var(--purple)' },
    { label: 'Avg Score', value: `${profile?.stats?.avgScore || 74}%`, icon: '🎯', color: 'var(--cyan)' },
    { label: 'Day Streak', value: `${profile?.streak || 7}🔥`, icon: '🔥', color: 'var(--amber)' },
    { label: 'Study Hours', value: `${profile?.stats?.hours || 48}h`, icon: '⏱️', color: 'var(--emerald)' },
    { label: 'Questions', value: profile?.stats?.questions || 1240, icon: '❓', color: 'var(--red)' },
    { label: 'Points', value: profile?.points || 1840, icon: '⭐', color: 'var(--amber)' },
  ]

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)', gap: 6 }}>
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* Profile Header */}
      <div className="card card-p" style={{ marginBottom: 20, background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(0,212,255,0.08))', border: '1px solid rgba(124,58,237,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: 'white', boxShadow: 'var(--glow-purple)' }}>
              {profile?.name?.[0]?.toUpperCase() || '?'}
            </div>
            {user?.isAdmin && (
              <div style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--amber)', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={12} color="white" />
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} style={{ maxWidth: 240 }} placeholder="Your full name" />
                <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h2 style={{ margin: 0 }}>{profile?.name || 'User'}</h2>
                <button onClick={() => setEditing(true)} className="btn btn-ghost btn-icon btn-sm"><Edit3 size={14} /></button>
              </div>
            )}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 8 }}>
              {user?.email || user?.phone || 'PrepBridge User'}
              {user?.isAdmin && <span style={{ marginLeft: 8, background: 'var(--amber)', color: 'white', fontSize: '0.68rem', padding: '2px 8px', borderRadius: 'var(--r-full)', fontWeight: 700 }}>ADMIN</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {profile?.state && <span style={{ fontSize: '0.75rem', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '3px 10px', color: 'var(--text-3)' }}>📍 {profile.state}</span>}
              {profile?.exams?.slice(0,2).map(e => <span key={e} style={{ fontSize: '0.75rem', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 'var(--r-full)', padding: '3px 10px', color: 'var(--purple)' }}>{e.toUpperCase()}</span>)}
              <span style={{ fontSize: '0.75rem', background: 'var(--emerald-10)', border: '1px solid var(--emerald-20)', borderRadius: 'var(--r-full)', padding: '3px 10px', color: 'var(--emerald)' }}>✓ All Access ₹599/yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ gap: 12, marginBottom: 24 }}>
        {STATS.map(s => (
          <div key={s.label} className="card card-p" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[['profile','Profile'],['exams','My Exams'],['settings','Settings']].map(([v,l]) => (
          <button key={v} className={`tab ${activeTab===v ? 'active' : ''}`} onClick={() => setActiveTab(v)}>{l}</button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {[
            { label: 'Full Name', value: profile?.name || 'Not set', icon: <User size={16} /> },
            { label: 'Phone / Email', value: user?.phone || user?.email || 'Not set', icon: <User size={16} /> },
            { label: 'State', value: profile?.state || 'Not set', icon: <Globe size={16} /> },
            { label: 'Preferred Language', value: profile?.language || 'English', icon: <Globe size={16} /> },
            { label: 'Education', value: profile?.education || 'Not set', icon: <BookOpen size={16} /> },
            { label: 'Target Year', value: profile?.targetYear || 'Not set', icon: <Target size={16} /> },
            { label: 'Study Hours/Day', value: profile?.studyHours || '3-4 hours', icon: <Clock size={16} /> },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{item.label}</div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.value}</div>
              </div>
              <ChevronRight size={16} color="var(--text-4)" />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'exams' && (
        <div>
          <h4 style={{ marginBottom: 12 }}>Your Selected Exams</h4>
          <div className="grid-3" style={{ gap: 12 }}>
            {(profile?.exams || ['upsc','ssc_cgl']).map(examId => {
              const cat = EXAM_CATEGORIES.find(c => c.exams.some(e => e.id === examId))
              const exam = EXAM_CATEGORIES.flatMap(c => c.exams).find(e => e.id === examId)
              return exam ? (
                <div key={examId} className="card card-p" style={{ borderLeft: `3px solid ${cat?.color || 'var(--purple)'}` }}>
                  <div style={{ fontWeight: 700 }}>{exam.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 8 }}>{exam.fullName}</div>
                  {exam.nextDate && <div style={{ fontSize: '0.75rem', color: 'var(--cyan)' }}>📅 {new Date(exam.nextDate).toLocaleDateString('en-IN', { month:'short', year:'numeric' })}</div>}
                </div>
              ) : null
            })}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {[
            { label: 'Notification Preferences', icon: <Bell size={16} />, action: 'Manage' },
            { label: 'Language Settings', icon: <Globe size={16} />, action: 'Change' },
            { label: 'Change Password', icon: <Lock size={16} />, action: 'Update' },
            { label: 'Privacy Settings', icon: <Shield size={16} />, action: 'View' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: 'var(--text-3)' }}>{item.icon}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>{item.action}</span>
              <ChevronRight size={16} color="var(--text-4)" />
            </div>
          ))}
          <div style={{ padding: '16px 20px' }}>
            <button onClick={handleLogout} className="btn" style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', gap: 8, justifyContent: 'center' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
