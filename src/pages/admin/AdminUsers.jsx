import { useState, useEffect } from 'react'
import { Search, Shield, Ban, Eye, Download } from 'lucide-react'
import { getAllSupabaseProfiles, upsertSupabaseProfile } from '../../services/supabaseService'
import { PRICING } from '../../services/paymentService'
import { toast } from 'react-hot-toast'

const MOCK_USERS = [
  { id:1, name:'Arjun Sharma', email:'arjun@gmail.com', phone:'+91 9876543210', state:'Rajasthan', exams:['UPSC','SSC CGL'], joined:'2025-01-15', plan:'paid', status:'active', streak:45, tests:23 },
  { id:2, name:'Priya Nair', email:'priya.nair@gmail.com', phone:'+91 9812345678', state:'Kerala', exams:['IBPS PO','SBI PO'], joined:'2025-02-10', plan:'paid', status:'testing', streak:38, tests:31 },
  { id:3, name:'Ravi Kumar', email:'ravi.kumar@yahoo.com', phone:'+91 9988776655', state:'Bihar', exams:['SSC CGL','RRB NTPC'], joined:'2025-01-20', plan:'free', status:'active', streak:52, tests:18 },
  { id:4, name:'Anita Patel', email:'anita.patel@gmail.com', phone:'+91 9765432109', state:'Gujarat', exams:['UPSC','GPSC'], joined:'2025-03-05', plan:'paid', status:'testing', streak:29, tests:15 },
  { id:5, name:'Suresh Rao', email:'suresh.rao@hotmail.com', phone:'+91 9345678901', state:'Karnataka', exams:['RRB NTPC','KPSC'], joined:'2025-02-28', plan:'free', status:'inactive', streak:0, tests:7 },
  { id:6, name:'Kavya Singh', email:'kavya.singh@gmail.com', phone:'+91 9654321098', state:'UP', exams:['CTET','UPPSC'], joined:'2025-04-01', plan:'paid', status:'active', streak:33, tests:28 },
  { id:7, name:'Deepa Reddy', email:'deepa.reddy@gmail.com', phone:'+91 9543210987', state:'Telangana', exams:['SBI PO','IBPS Clerk'], joined:'2025-01-08', plan:'paid', status:'active', streak:48, tests:42 },
  { id:8, name:'Mohit Jain', email:'mohit.jain@gmail.com', phone:'+91 9432109876', state:'MP', exams:['SSC CGL','MPPSC'], joined:'2025-03-20', plan:'free', status:'suspended', streak:0, tests:5 },
]

const STATUS_COLORS = { active:'var(--emerald)', inactive:'var(--amber)', suspended:'var(--red)', testing:'var(--purple)' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedUserIds, setSelectedUserIds] = useState(new Set())

  // 1. Fetch live users from Supabase Database profiles table
  useEffect(() => {
    async function fetchUsers() {
      try {
        const list = await getAllSupabaseProfiles()
        setUsers(list.length > 0 ? list : MOCK_USERS.map(m => ({
          ...m,
          photoURL: null,
          primaryTarget: m.exams?.[0] || 'UPSC',
          lakshyaSlogan: 'Crack competitive exams!',
          selectedLanguage: 'English',
          education: 'Graduate',
          studyHours: '3-4 hours'
        })))
      } catch (e) {
        console.error('Error fetching users from Supabase:', e)
        setUsers(MOCK_USERS)
      }
    }
    fetchUsers()
  }, [])

  // 2. Action: Toggle User Suspension in Supabase
  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active'
    try {
      const userObj = users.find(u => u.id === userId)
      if (userObj) {
        await upsertSupabaseProfile(userId, { ...userObj, status: nextStatus })
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u))
      toast.success(`User status updated to ${nextStatus}!`)
    } catch (e) {
      console.warn('Failed to update live user status on Supabase, applying mock local fallback:', e)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u))
      toast.success(`Mock local user status updated to ${nextStatus}!`)
    }
  }

  // 3. Action: Toggle User Subscription Plan in Supabase
  const handleTogglePlan = async (userId, currentPlan) => {
    const nextPlan = currentPlan === 'paid' ? 'free' : 'paid'
    try {
      const userObj = users.find(u => u.id === userId)
      if (userObj) {
        await upsertSupabaseProfile(userId, {
          ...userObj,
          subscription: { plan: nextPlan, startDate: new Date().toISOString() }
        })
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: nextPlan } : u))
      toast.success(`User plan updated to ${nextPlan === 'paid' ? `Paid (${PRICING.monthly.badge})` : 'Free'}!`)
    } catch (e) {
      console.warn('Failed to update live user plan on Supabase, applying mock local fallback:', e)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: nextPlan } : u))
      toast.success(`Mock local user plan updated to ${nextPlan === 'paid' ? `Paid (${PRICING.monthly.badge})` : 'Free'}!`)
    }
  }

  const toggleSelectUser = (id) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedUserIds.size === filtered.length && filtered.length > 0) {
      setSelectedUserIds(new Set())
    } else {
      setSelectedUserIds(new Set(filtered.map(u => u.id)))
    }
  }

  const handleMassSuspend = () => {
    if (selectedUserIds.size === 0) return
    setUsers(prev => prev.map(u => selectedUserIds.has(u.id) ? { ...u, status: 'suspended' } : u))
    setSelectedUserIds(new Set())
    toast.success('Selected users suspended successfully! 🚫')
  }

  const handleMassActivate = () => {
    if (selectedUserIds.size === 0) return
    setUsers(prev => prev.map(u => selectedUserIds.has(u.id) ? { ...u, status: 'active' } : u))
    setSelectedUserIds(new Set())
    toast.success('Selected users activated successfully! 🟢')
  }

  const filtered = users.filter(u => {
    if (planFilter !== 'all' && u.plan !== planFilter) return false
    if (statusFilter !== 'all' && u.status !== statusFilter) return false
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <main className="page animate-fade-in" role="main" aria-label="User Management">
      <header style={{ marginBottom: 24 }}>
        <div className="label" style={{ marginBottom: 8 }}>Admin Panel</div>
        <h1 style={{ marginBottom: 8 }}>User Management 👥</h1>
        <p style={{ margin: 0, color: 'var(--text-3)' }}>Manage {users.length > 0 ? users.length.toLocaleString() : MOCK_USERS.length.toLocaleString()}+ registered students</p>
      </header>

      {/* Stats */}
      <section className="stats-section" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: users.length.toLocaleString(), icon: '👥', color: 'var(--purple)' },
          { label: 'Paid Users', value: users.filter(u => u.plan === 'paid').length.toLocaleString(), icon: '💳', color: 'var(--emerald)' },
          { label: 'Active Users', value: users.filter(u => u.status === 'active').length.toLocaleString(), icon: '🟢', color: 'var(--cyan)' },
          { label: 'Showing', value: filtered.length.toLocaleString(), icon: '🔍', color: 'var(--amber)' },
        ].map((stat, index) => (
          <article key={stat.label} className="stat-card" tabIndex={0} role="article"
                   aria-labelledby={`user-stat-${index}-value`}
                   aria-describedby={`user-stat-${index}-desc`}
                   style={{
                     outline: 'none',
                     ':focus': {
                       boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.3)'
                     }
                   }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{stat.icon}</div>
            <div id={`user-stat-${index}-value`} style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div id={`user-stat-${index}-desc`} style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{stat.label}</div>
          </article>
        ))}
      </section>

      {/* Filters */}
      <section className="filters-section" aria-label="Filters" style={{ marginBottom: 16 }}>
        <div className="card card-p" style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 14px' }}>
              <Search size={14} color="var(--text-3)" />
              <input
                type="text"
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', width: '100%', fontFamily: 'inherit' }}
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search users by name or email"
              />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label htmlFor="plan-filter" style={{ fontSize: '0.82rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 8 }}>Plan:</label>
              <select
                id="plan-filter"
                className="form-select"
                style={{ width: 'auto' }}
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
                aria-label="Filter by subscription plan"
              >
                <option value="all">All Plans</option>
                <option value="paid">Paid (Premium)</option>
                <option value="free">Free</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label htmlFor="status-filter" style={{ fontSize: '0.82rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 8 }}>Status:</label>
              <select
                id="status-filter"
                className="form-select"
                style={{ width: 'auto' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                aria-label="Filter by user status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Users Table */}
      <section className="users-table-section" aria-label="Users table">
        {selectedUserIds.size > 0 && (
          <div className="card card-p" style={{ padding: '12px 18px', marginBottom: 14, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', animation: 'fadeIn 0.2s ease' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>
              Selected <strong>{selectedUserIds.size}</strong> user(s)
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleMassActivate} className="btn btn-emerald btn-sm" style={{ padding: '6px 14px', fontSize: '0.78rem', minHeight: '32px' }}>
                🟢 Activate Selected
              </button>
              <button onClick={handleMassSuspend} className="btn btn-outline btn-sm" style={{ padding: '6px 14px', fontSize: '0.78rem', minHeight: '32px', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
                🚫 Suspend Selected
              </button>
              <button onClick={() => setSelectedUserIds(new Set())} className="btn btn-ghost btn-sm" style={{ padding: '6px 14px', fontSize: '0.78rem', minHeight: '32px', color: 'var(--text-3)' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table role="table" aria-label="User accounts list">
              <caption style={{ captionSide: 'top', marginBottom: 8, fontSize: '0.82rem', color: 'var(--text-3)' }}>
                List of all student accounts showing personal details, subscription plans, and actions
              </caption>
              <thead>
                <tr style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '12px 16px', width: '48px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      style={{ cursor: 'pointer', minHeight: '20px', minWidth: '20px' }}
                      checked={selectedUserIds.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all users"
                    />
                  </th>
                  {['User', 'State', 'Primary Target', 'Slogan Tagline', 'Exams', 'Joined', 'Plan'].map((header, index) => (
                    <th key={header} scope="col" style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                      {header}
                    </th>
                  ))}
                  {['Status', 'Streak', 'Tests', 'Actions'].map((header, index) => (
                    <th key={header} scope="col" style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s', background: selectedUserIds.has(user.id) ? 'rgba(0,212,255,0.03)' : undefined }}>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        style={{ cursor: 'pointer', minHeight: '20px', minWidth: '20px' }}
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        aria-label={`Select ${user.name}`}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={`Profile of ${user.name}`} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'white', flexShrink: 0 }}>
                            {(user?.name || '?')[0]}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{user.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {user.email && <span>📧 {user.email}</span>}
                            {user.phone && <span style={{ color: 'var(--cyan)' }}>📱 {user.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-3)' }}>{user.state}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--cyan)', fontWeight: 600 }}>
                      {user.primaryTarget ? `🎯 ${user.primaryTarget.toUpperCase()}` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-3)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.lakshyaSlogan || ''}>
                      <em>"{user.lakshyaSlogan || 'No custom slogan'}"</em>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(user?.exams || []).slice(0,2).map(e => (
                          <span key={e} style={{ fontSize: '0.65rem', background: 'rgba(124,58,237,0.1)', color: 'var(--purple)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--r-full)', padding: '1px 6px' }}>
                            {e}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-3)' }}>
                      {user.joined ? new Date(user.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--r-full)', background: user.plan === 'paid' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', color: user.plan === 'paid' ? 'var(--emerald)' : 'var(--text-3)', fontWeight: 700 }}>
                        {user.plan === 'paid' ? '✓ ' + PRICING.monthly.badge : 'Free'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--r-full)', background: `${STATUS_COLORS[user.status]}20`, color: STATUS_COLORS[user.status], fontWeight: 700, textTransform: 'capitalize' }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--amber)' }}>🔥{user.streak}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>{user.tests}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="View user details"
                          aria-label={`View details for ${user.name}`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleTogglePlan(user.id, user.plan)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title={user.plan === 'paid' ? 'Downgrade to Free' : 'Upgrade to Paid'}
                          style={{ color: user.plan === 'paid' ? 'var(--emerald)' : 'var(--text-3)' }}
                          aria-label={`Toggle subscription plan for ${user.name}`}
                        >
                          <Shield size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title={user.status === 'suspended' ? 'Activate user' : 'Suspend user'}
                          style={{ color: user.status === 'suspended' ? 'var(--emerald)' : 'var(--red)' }}
                          aria-label={`${user.status === 'suspended' ? 'Activate' : 'Suspend'} user ${user.name}`}
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* User Details Modal */}
      {selectedUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(5,6,10,0.85)',
            backdropFilter: 'blur(16px)', zIndex: 100000, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 24,
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <div className="card card-p" style={{
            maxWidth: 580, width: '100%', border: '1px solid var(--purple-20)',
            maxHeight: '90vh', overflowY: 'auto', position: 'relative'
          }}>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setSelectedUser(null)}
              style={{ position: 'absolute', top: 16, right: 16, fontSize: '1.2rem', color: 'var(--text-3)' }}
              aria-label="Close profile modal"
            >
              ×
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              {selectedUser.photoURL ? (
                <img src={selectedUser.photoURL} alt={`Profile of ${selectedUser.name}`} style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--purple)' }} />
              ) : (
                <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.8rem', color: 'white' }}>
                  {(selectedUser?.name || '?')[0]}
                </div>
              )}
              <div>
                <h2 id="modal-title" style={{ margin: 0, color: 'white' }}>{selectedUser.name}</h2>
                <span className="badge badge-purple" style={{ marginTop: 6, display: 'inline-block' }}>Student Profile</span>
              </div>
            </div>

            <div className="divider" style={{ margin: '16px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', fontSize: '0.88rem' }}>
              <div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>📧 Email Address</div>
                <div style={{ fontWeight: 600, color: 'white' }}>{selectedUser.email}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>📱 Mobile Number</div>
                <div style={{ fontWeight: 600, color: 'var(--cyan)' }}>{selectedUser.phone}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>🗺️ Selected State</div>
                <div style={{ fontWeight: 600, color: 'white' }}>{selectedUser.state}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>🌐 Chosen Language</div>
                <div style={{ fontWeight: 600, color: 'white' }}>{selectedUser.selectedLanguage || 'English'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>🎓 Target Exam (Lakshya)</div>
                <div style={{ fontWeight: 700, color: 'var(--amber)' }}>🎯 {selectedUser.primaryTarget?.toUpperCase() || 'N/A'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>⏰ Daily Study Target</div>
                <div style={{ fontWeight: 600, color: 'white' }}>{selectedUser.studyHours || '3-4 hours'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>📝 Education Level</div>
                <div style={{ fontWeight: 600, color: 'white' }}>{selectedUser.education || 'Graduate'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>📅 Joined PrepBridge</div>
                <div style={{ fontWeight: 600, color: 'white' }}>
                  {selectedUser.joined ? new Date(selectedUser.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </div>
              </div>
            </div>

            <div className="divider" style={{ margin: '20px 0' }} />

            <div style={{ padding: '14px 18px', background: 'rgba(124,58,237,0.06)', border: '1px solid var(--purple-20)', borderRadius: 'var(--r-md)' }}>
              <div style={{ color: 'var(--purple)', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>🌟 Active Socratic Lakshya Slogan:</div>
              <div style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                "{selectedUser.lakshyaSlogan || 'Crack competitive exams with hard work!'}"
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-outline"
                onClick={() => setSelectedUser(null)}
                aria-label="Close user profile"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
        }

        .stat-card {
          background: var(--bg-card);
          border-radius: var(--r-lg);
          padding: 16px;
          border: 1px solid var(--border);
          text-align: center;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-card:focus {
          outline: 3px solid rgba(0, 212, 255, 0.3);
          outline-offset: 2px;
        }

        .filters-section {
          background: var(--bg-card);
          border-radius: var(--r-lg);
          border: 1px solid var(--border);
        }

        .table-container {
          border-radius: var(--r-lg);
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        tbody tr:hover {
          background: var(--bg-3);
        }

        tbody tr:focus-within {
          outline: 3px solid rgba(0, 212, 255, 0.3);
          outline-offset: -1px;
        }

        button {
          cursor: pointer;
          border: none;
          background: none;
          padding: 4px;
          border-radius: var(--r-full);
          transition: all 0.2s ease;
        }

        button:hover {
          background: var(--bg-3);
        }

        button:focus {
          outline: 2px solid var(--cyan);
          outline-offset: 2px;
        }

        @media (max-width: 768px) {
          .stats-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  )
}