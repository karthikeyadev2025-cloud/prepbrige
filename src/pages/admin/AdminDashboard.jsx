import React, { useState } from 'react'
import { Users, ClipboardList, BookOpen, Bell, TrendingUp, DollarSign, Activity, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Link } from 'react-router-dom'

const monthlyData = [
  { month: 'Jan', users: 12400, revenue: 74000, tests: 45000 },
  { month: 'Feb', users: 18200, revenue: 109000, tests: 68000 },
  { month: 'Mar', users: 28600, revenue: 171000, tests: 102000 },
  { month: 'Apr', users: 45200, revenue: 271000, tests: 164000 },
  { month: 'May', users: 72800, revenue: 436000, tests: 248000 },
  { month: 'Jun', users: 98400, revenue: 590000, tests: 342000 },
]

const examData = [
  { name: 'UPSC', value: 28 }, { name: 'SSC', value: 22 }, { name: 'Banking', value: 19 },
  { name: 'Railways', value: 14 }, { name: 'State PSC', value: 10 }, { name: 'Others', value: 7 }
]
const COLORS = ['#00d4ff','#7c3aed','#10b981','#f59e0b','#ef4444','#3b82f6']

const RECENT_USERS = [
  { name: 'Ramesh Kumar', state: 'Bihar', exam: 'UPSC', joined: '2026-05-26', plan: 'All Access' },
  { name: 'Priya Sharma', state: 'Rajasthan', exam: 'Banking', joined: '2026-05-26', plan: 'Free' },
  { name: 'Suresh Yadav', state: 'UP', exam: 'SSC CGL', joined: '2026-05-25', plan: 'All Access' },
  { name: 'Anjali Meena', state: 'MP', exam: 'NEET', joined: '2026-05-25', plan: 'Scholarship' },
  { name: 'Mohit Sahu', state: 'CG', exam: 'Railway', joined: '2026-05-24', plan: 'All Access' },
]

export default function AdminDashboard() {
  return (
    <div className="page animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <div className="label" style={{ marginBottom: 8 }}>Admin Panel</div>
        <h2 style={{ marginBottom: 4 }}>Platform Overview 📊</h2>
        <p style={{ margin: 0 }}>Real-time metrics and platform health</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { icon: Users, label: 'Total Users', value: '98,427', trend: '+34%', color: 'var(--cyan)', bg: 'var(--cyan-10)' },
          { icon: DollarSign, label: 'Monthly Revenue', value: '₹5.9L', trend: '+28%', color: 'var(--emerald)', bg: 'var(--emerald-10)' },
          { icon: ClipboardList, label: 'Tests Today', value: '12,430', trend: '+18%', color: 'var(--purple)', bg: 'var(--purple-10)' },
          { icon: Activity, label: 'Active Now', value: '3,241', trend: 'live', color: 'var(--amber)', bg: 'var(--amber-10)' },
        ].map(s => (
          <div key={s.label} className="card card-p">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} color={s.color} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--emerald)', background: 'var(--emerald-10)', borderRadius: 'var(--r-full)', padding: '3px 8px' }}>{s.trend}</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{s.value}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 24 }}>
        {/* Growth chart */}
        <div className="card card-p">
          <h4 style={{ marginBottom: 20 }}>User & Revenue Growth</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.82rem' }} />
              <Bar dataKey="users" fill="#7c3aed" radius={[4,4,0,0]} name="Users" />
              <Bar dataKey="tests" fill="#00d4ff" radius={[4,4,0,0]} name="Tests" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Exam distribution */}
        <div className="card card-p">
          <h4 style={{ marginBottom: 20 }}>Exam Category Distribution</h4>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={examData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {examData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {examData.map((e, i) => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-3)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />{e.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="card card-p" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h4 style={{ margin: 0 }}>Recent Registrations</h4>
          <Link to="/admin/users" style={{ fontSize: '0.82rem', color: 'var(--cyan)' }}>View All</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['User','State','Target Exam','Joined','Plan'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_USERS.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700 }}>
                        {u.name[0]}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-3)' }}>{u.state}</td>
                  <td style={{ padding: '12px' }}>{u.exam}</td>
                  <td style={{ padding: '12px', color: 'var(--text-3)' }}>{u.joined}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${u.plan === 'All Access' ? 'badge-purple' : u.plan === 'Scholarship' ? 'badge-emerald' : 'badge-cyan'}`}>{u.plan}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid-4">
        {[
          { to: '/admin/questions', icon: ClipboardList, label: 'Manage Questions', desc: '5L+ questions' },
          { to: '/admin/users', icon: Users, label: 'Manage Users', desc: '98K+ registered' },
          { to: '/admin/notifications', icon: Bell, label: 'Send Notification', desc: 'Broadcast to all' },
          { to: '/admin/content', icon: BookOpen, label: 'Manage Content', desc: 'Courses & notes' },
        ].map(a => (
          <Link key={a.to} to={a.to} className="card card-p card-hover" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            <a.icon size={20} color="var(--cyan)" />
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{a.label}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{a.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
