import { useState, useEffect } from 'react'
import { Search, Shield, Ban, Eye, Download } from 'lucide-react'
import { getAllSupabaseProfiles, upsertSupabaseProfile } from '../../services/supabaseService'
import { toast } from 'react-hot-toast'

const MOCK_USERS = [
  { id:1, name:'Arjun Sharma', email:'arjun@gmail.com', phone:'+91 9876543210', state:'Rajasthan', exams:['UPSC','SSC CGL'], joined:'2025-01-15', plan:'paid', status:'active', streak:45, tests:23 },
  { id:2, name:'Priya Nair', email:'priya.nair@gmail.com', phone:'+91 9812345678', state:'Kerala', exams:['IBPS PO','SBI PO'], joined:'2025-02-10', plan:'paid', status:'active', streak:38, tests:31 },
  { id:3, name:'Ravi Kumar', email:'ravi.kumar@yahoo.com', phone:'+91 9988776655', state:'Bihar', exams:['SSC CGL','RRB NTPC'], joined:'2025-01-20', plan:'free', status:'active', streak:52, tests:18 },
  { id:4, name:'Anita Patel', email:'anita.patel@gmail.com', phone:'+91 9765432109', state:'Gujarat', exams:['UPSC','GPSC'], joined:'2025-03-05', plan:'paid', status:'active', streak:29, tests:15 },
  { id:5, name:'Suresh Rao', email:'suresh.rao@hotmail.com', phone:'+91 9345678901', state:'Karnataka', exams:['RRB NTPC','KPSC'], joined:'2025-02-28', plan:'free', status:'inactive', streak:0, tests:7 },
  { id:6, name:'Kavya Singh', email:'kavya.singh@gmail.com', phone:'+91 9654321098', state:'UP', exams:['CTET','UPPSC'], joined:'2025-04-01', plan:'paid', status:'active', streak:33, tests:28 },
  { id:7, name:'Deepa Reddy', email:'deepa.reddy@gmail.com', phone:'+91 9543210987', state:'Telangana', exams:['SBI PO','IBPS Clerk'], joined:'2025-01-08', plan:'paid', status:'active', streak:48, tests:42 },
  { id:8, name:'Mohit Jain', email:'mohit.jain@gmail.com', phone:'+91 9432109876', state:'MP', exams:['SSC CGL','MPPSC'], joined:'2025-03-20', plan:'free', status:'suspended', streak:0, tests:5 },
]

const STATUS_COLORS = { active:'var(--emerald)', inactive:'var(--amber)', suspended:'var(--red)' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)

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
      toast.success(`User plan updated to ${nextPlan === 'paid' ? 'Paid (₹599)' : 'Free'}!`)
    } catch (e) {
      console.warn('Failed to update live user plan on Supabase, applying mock local fallback:', e)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: nextPlan } : u))
      toast.success(`Mock local user plan updated to ${nextPlan === 'paid' ? 'Paid (₹599)' : 'Free'}!`)
    }
  }

  const filtered = users.filter(u => {
    if (planFilter !== 'all' && u.plan !== planFilter) return false
    if (statusFilter !== 'all' && u.status !== statusFilter) return false
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management 👥</h1>
          <p className="page-subtitle">Manage {MOCK_USERS.length.toLocaleString()}+ registered students</p>
        </div>
        <button className="btn btn-outline btn-sm" style={{ gap: 6 }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: '2,45,832', icon: '👥', color: 'var(--purple)' },
          { label: 'Paid Users', value: '1,23,419', icon: '💳', color: 'var(--emerald)' },
          { label: 'Active Today', value: '18,432', icon: '🟢', color: 'var(--cyan)' },
          { label: 'New This Month', value: '12,543', icon: '📈', color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} className="card card-p" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card card-p" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 14px' }}>
            <Search size={14} color="var(--text-3)" />
            <input style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', width: '100%', fontFamily: 'inherit' }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
            <option value="all">All Plans</option>
            <option value="paid">Paid ₹599</option>
            <option value="free">Free</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}>
                {['User','State','Primary Target','Slogan Tagline','Exams','Joined','Plan'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
                {['Status','Streak','Tests','Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'white', flexShrink: 0 }}>{user.name[0]}</div>
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
                      {user.exams.slice(0,2).map(e => <span key={e} style={{ fontSize: '0.65rem', background: 'rgba(124,58,237,0.1)', color: 'var(--purple)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--r-full)', padding: '1px 6px' }}>{e}</span>)}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-3)' }}>{new Date(user.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--r-full)', background: user.plan === 'paid' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', color: user.plan === 'paid' ? 'var(--emerald)' : 'var(--text-3)', fontWeight: 700 }}>
                      {user.plan === 'paid' ? '✓ ₹599' : 'Free'}
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
                      <button onClick={() => setSelectedUser(user)} className="btn btn-ghost btn-icon btn-sm" title="View"><Eye size={14} /></button>
                      <button onClick={() => handleTogglePlan(user.id, user.plan)} className="btn btn-ghost btn-icon btn-sm" title="Toggle Paid Plan" style={{ color: user.plan === 'paid' ? 'var(--emerald)' : 'var(--text-3)' }}><Shield size={14} /></button>
                      <button onClick={() => handleToggleStatus(user.id, user.status)} className="btn btn-ghost btn-icon btn-sm" title={user.status === 'suspended' ? 'Activate' : 'Suspend'} style={{ color: user.status === 'suspended' ? 'var(--emerald)' : 'var(--red)' }}><Ban size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Socratic Admin Detailed Profile Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(5,6,10,0.85)',
          backdropFilter: 'blur(16px)', zIndex: 100000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 24,
          animation: 'fadeIn 0.25s ease'
        }}>
          <div className="card card-p" style={{
            maxWidth: 580, width: '100%', border: '1px solid var(--purple-20)',
            maxHeight: '90vh', overflowY: 'auto', position: 'relative'
          }}>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedUser(null)} style={{ position: 'absolute', top: 16, right: 16, fontSize: '1.2rem', color: 'var(--text-3)' }}>×</button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              {selectedUser.photoURL ? (
                <img src={selectedUser.photoURL} alt={selectedUser.name} style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--purple)' }} />
              ) : (
                <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.8rem', color: 'white' }}>{selectedUser.name[0]}</div>
              )}
              <div>
                <h3 style={{ margin: 0, color: 'white' }}>{selectedUser.name}</h3>
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
                <div style={{ fontWeight: 600, color: 'white' }}>{new Date(selectedUser.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
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
              <button className="btn btn-outline" onClick={() => setSelectedUser(null)}>Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
