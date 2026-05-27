import { useState, useEffect } from 'react'
import { useUserStore } from '../store/useStore'
import { User, Lock, Globe, Bell, LogOut, Edit3, ChevronRight, Shield, Star, Target, BookOpen, Clock, Zap } from 'lucide-react'
import { signOutUser } from '../firebase/auth'
import { useNavigate } from 'react-router-dom'
import { EXAM_CATEGORIES } from '../data/exams'
import { toast } from 'react-hot-toast'
import { initiatePremiumCheckout, PRICING, getSubscriptionStatus } from '../services/paymentService'

export default function Profile() {
  const { profile, user, updateProfile } = useUserStore()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [activeTab, setActiveTab] = useState('profile')
  const [selectedPlan, setSelectedPlan] = useState('annual') // default: best value annual plan
  const sub = getSubscriptionStatus(profile?.subscription)
  const [remaining, setRemaining] = useState('')
  useEffect(() => {
    if (sub.isTrial && sub.isActive) {
      const update = () => {
        const now = Date.now()
        const end = new Date(sub.trialEndsAt).getTime()
        const msLeft = Math.max(0, end - now)
        const days = Math.floor(msLeft / (1000 * 60 * 60 * 24))
        const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        setRemaining(`${days}d ${hours}h`)
      }
      update()
      const id = setInterval(update, 60 * 60 * 1000) // hourly
      return () => clearInterval(id)
    } else {
      setRemaining('')
    }
  }, [sub])

  const handleLogout = async () => {
    await signOutUser()
    navigate('/')
    toast.success('Logged out successfully')
  }

  const handleSave = () => {
    updateProfile({ name })
    
    // Sync updated details to offline/demo profile catalog to survive logout
    if (user?.uid?.startsWith('demo_')) {
      try {
        const savedProfiles = localStorage.getItem('prepbridge_demo_profiles')
        const profiles = savedProfiles ? JSON.parse(savedProfiles) : {}
        const currentProfile = useUserStore.getState().profile
        profiles[user.uid] = { ...currentProfile, name }
        localStorage.setItem('prepbridge_demo_profiles', JSON.stringify(profiles))
      } catch (e) {
        console.error('Failed to sync updated demo profile:', e)
      }
    }

    // Also sync updated details to Supabase Database (PostgreSQL)!
    if (user?.uid) {
      import('../services/supabaseService')
        .then(({ syncProfileToSupabase }) => {
          const currentProfile = useUserStore.getState().profile
          syncProfileToSupabase(user.uid, { ...currentProfile, name })
        })
        .catch(err => console.error('[Profile] Failed to sync updated profile to Supabase:', err))
    }
    
    setEditing(false)
    toast.success('Profile updated!')
  }

  const handleSettingsAction = (setting) => {
    if (setting === 'Language Settings') {
      setActiveTab('exams')
      toast.success('Switching to Exams & Languages! Update your preferences there.')
    } else {
      toast.success(`${setting} coming soon! Your data is fully secured.`, { icon: '🔒' })
    }
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
              {profile?.subscription?.plan === 'paid' ? (
                <span style={{ fontSize: '0.75rem', background: 'var(--amber-10)', border: '1px solid var(--amber-20)', borderRadius: 'var(--r-full)', padding: '3px 10px', color: 'var(--amber)', fontWeight: 700 }}>⭐ PREMIUM VIP</span>
              ) : (
                <span style={{ fontSize: '0.75rem', background: 'var(--emerald-10)', border: '1px solid var(--emerald-20)', borderRadius: 'var(--r-full)', padding: '3px 10px', color: 'var(--emerald)' }}>Free Tier</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Banner — show for non-paid users (trial active, trial expired, or free) */}
      {!sub.isPaid && (
        <div className="card card-p animate-fade-in" style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(0,212,255,0.07))',
          border: '1px solid rgba(124,58,237,0.3)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Star size={18} color="var(--amber)" style={{ fill: 'var(--amber)' }} />
            {sub.isTrial && sub.isActive ? (
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'white' }}>
                🌟 Trial Active — <span style={{ color: sub.hoursLeft < 12 ? 'var(--red)' : sub.hoursLeft < 24 ? 'var(--amber)' : 'var(--emerald)' }}>
                  {sub.hoursLeft < 1 ? 'expires soon!' : sub.hoursLeft < 24 ? `${sub.hoursLeft}h remaining` : `${sub.daysLeft} day${sub.daysLeft !== 1 ? 's' : ''} remaining`}
                </span>
              </h4>
            ) : sub.isTrial && sub.isExpired ? (
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'white' }}>🔒 Trial Ended — Subscribe to Continue</h4>
            ) : (
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'white' }}>Unlock All-Access Premium 🚀</h4>
            )}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0 0 18px', lineHeight: 1.5 }}>
            {sub.isTrial && sub.isActive
              ? 'You have full premium access right now! Upgrade before it expires to never miss a thing.'
              : sub.isTrial && sub.isExpired
              ? 'Your 2-day free trial is over. Choose a plan below to keep all premium features.'
              : 'Unlimited AI doubt solving, all-India mock tests, live current affairs, 5L+ questions & more.'}
          </p>

          {/* 3-Plan Selector */}
          <div className="plans-selector-grid">
            {[
              { key: 'monthly',  label: 'Monthly',  price: '₹249',   sub: '/month',         tag: null,          tagColor: null,          accent: 'var(--purple)',  accentRgb: '124,58,237' },
              { key: 'sixMonth', label: '6 Months', price: '₹1,195', sub: `≈₹${PRICING.sixMonth.perMonth}/mo`, tag: 'Popular',    tagColor: 'var(--cyan)',   accent: 'var(--cyan)',    accentRgb: '0,212,255' },
              { key: 'annual',   label: 'Annual',   price: '₹1,999', sub: `≈₹${PRICING.annual.perMonth}/mo`,   tag: 'Best Value', tagColor: 'var(--amber)', accent: 'var(--amber)',   accentRgb: '245,158,11' },
            ].map(p => {
              const isSelected = selectedPlan === p.key
              return (
                <div key={p.key} onClick={() => setSelectedPlan(p.key)} style={{
                  padding: '12px 10px', borderRadius: 'var(--r-lg)', cursor: 'pointer',
                  transition: 'all 0.2s', position: 'relative', textAlign: 'center',
                  background: isSelected ? `rgba(${p.accentRgb},0.14)` : 'rgba(255,255,255,0.03)',
                  border: isSelected ? `2px solid ${p.accent}` : '2px solid var(--border)',
                  boxShadow: isSelected ? `0 0 16px rgba(${p.accentRgb},0.25)` : 'none',
                }}>
                  {p.tag && (
                    <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: p.tagColor, color: p.key === 'annual' ? '#000' : 'white', fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--r-full)', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
                      {p.tag}
                    </div>
                  )}
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4, marginTop: p.tag ? 4 : 0 }}>{p.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: isSelected ? p.accent : 'white', lineHeight: 1 }}>{p.price}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', marginTop: 3 }}>{p.sub}</div>
                  {p.key !== 'monthly' && (
                    <div style={{ fontSize: '0.6rem', color: p.accent, fontWeight: 700, marginTop: 3 }}>
                      Save ₹{PRICING[p.key].savings}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={() => initiatePremiumCheckout(user, profile, updateProfile, null, selectedPlan)}
            className="btn btn-primary"
            style={{ width: '100%', gap: 8, boxShadow: 'var(--glow-purple)', fontWeight: 700, justifyContent: 'center' }}
          >
            <Zap size={14} />
            {selectedPlan === 'annual'
              ? `Get Annual Plan — ₹1,999/yr (Save ₹${PRICING.annual.savings})`
              : selectedPlan === 'sixMonth'
              ? `Get 6-Month Plan — ₹1,195 (20% OFF)`
              : 'Get Monthly Plan — ₹249/mo'}
          </button>
        </div>
      )}


      {/* Premium Active Subscription Status Card */}
      {sub.isPaid && (
        <div className="card card-p animate-fade-in" style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))',
          border: '1px solid rgba(245,158,11,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '16px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={20} color="var(--amber)" style={{ fill: 'var(--amber)' }} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.98rem', color: 'var(--amber)' }}>PrepBridge All-Access Active 💎</h4>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 2 }}>
                {profile?.subscription?.planLabel || 'All-Access'} · Payment ID: {profile?.subscription?.paymentId || 'rzp_test_VIP'} · Member since {new Date(profile?.subscription?.startDate || profile?.createdAt || '2024-01-01').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}{profile?.subscription?.expiresAt ? ` · Renews ${new Date(profile.subscription.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.15)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--r-full)', padding: '4px 12px', fontWeight: 700 }}>
            Active Subscription
          </span>
        </div>
      )}

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
            <div key={i} onClick={() => handleSettingsAction(item.label)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
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
