import React, { useState } from 'react'
import { Users, Search, Shield, Ban, Eye, Download, Filter, TrendingUp } from 'lucide-react'

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
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)

  const filtered = MOCK_USERS.filter(u => {
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
                {['User','State','Exams','Joined','Plan','Status','Streak','Tests','Actions'].map(h => (
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
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'white', flexShrink: 0 }}>{user.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{user.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-3)' }}>{user.state}</td>
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
                      <button className="btn btn-ghost btn-icon btn-sm" title="View"><Eye size={14} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Toggle Admin"><Shield size={14} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Suspend" style={{ color: 'var(--red)' }}><Ban size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
