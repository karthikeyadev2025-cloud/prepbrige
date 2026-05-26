import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom'
import { useUserStore, useAppStore } from '../../store/useStore'
import { getSubscriptionStatus } from '../../services/paymentService'
import {
  LayoutDashboard, BookOpen, FileText, Newspaper, BrainCircuit,
  GraduationCap, Trophy, Bell, User, Settings, LogOut,
  ChevronLeft, ChevronRight, Search, Menu, Zap, Shield,
  ClipboardList, Users, MessageSquare, Star, Palette
} from 'lucide-react'

const NAV_ITEMS = [
  { section: 'Main' },
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/app/exams', icon: BookOpen, label: 'Exam Hub' },
  { path: '/app/mock-tests', icon: ClipboardList, label: 'Mock Tests' },
  { path: '/app/current-affairs', icon: Newspaper, label: 'Current Affairs', badge: 'LIVE' },
  { section: 'Study' },
  { path: '/app/question-papers', icon: FileText, label: 'Question Papers' },
  { path: '/app/courses', icon: GraduationCap, label: 'Courses & Notes' },
  { path: '/app/ai-tutor', icon: BrainCircuit, label: 'AI Tutor', badge: 'NEW' },
  { section: 'Community' },
  { path: '/app/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/app/notifications', icon: Bell, label: 'Notifications' },
]

const ADMIN_ITEMS = [
  { section: 'Admin Panel' },
  { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/questions', icon: ClipboardList, label: 'Question Bank' },
  { path: '/admin/content', icon: BookOpen, label: 'Content' },
  { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { section: 'Customization' },
  { path: '/admin/theme', icon: Palette, label: 'Theme & CSS', badge: 'NEW' },
  { path: '/admin/integrations', icon: Settings, label: 'Integrations & Payments', badge: 'NEW' },
]

export default function AppLayout({ isAdmin = false }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile, logout } = useUserStore()
  const { notifications } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()
  const unread = notifications.filter(n => !n.read).length
  const items = isAdmin ? ADMIN_ITEMS : NAV_ITEMS

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={18} color="white" />
          </div>
          {!collapsed && <div className="sidebar-logo-text">Prep<span>Bridge</span></div>}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="btn btn-ghost btn-icon" style={{ marginLeft: 'auto' }}>
              <ChevronLeft size={16} />
            </button>
          )}
          {collapsed && (
            <button onClick={() => setCollapsed(false)} className="btn btn-ghost btn-icon" style={{ position: 'absolute', right: -12, top: 20, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '50%', width: 24, height: 24, padding: 0, zIndex: 10 }}>
              <ChevronRight size={12} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {items.map((item, i) => {
            if (item.section) {
              return collapsed ? <div key={i} className="divider" style={{ margin: '8px 12px' }} /> :
                <div key={i} className="nav-section-title">{item.section}</div>
            }
            return (
              <NavLink key={item.path} to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.path === '/admin'}
              >
                <span className="nav-item-icon"><item.icon size={18} /></span>
                {!collapsed && (
                  <>
                    <span className="nav-item-label">{item.label}</span>
                    {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          {isAdmin ? (
            <NavLink to="/app/dashboard" className="nav-item">
              <span className="nav-item-icon"><User size={18} /></span>
              {!collapsed && <span className="nav-item-label">Exit Admin</span>}
            </NavLink>
          ) : (
            <NavLink to="/app/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              {!collapsed && (
                <div className="user-info">
                  <div className="user-name">{profile?.name || 'User'}</div>
                  <div className="user-plan">
                    {(() => {
                      const s = getSubscriptionStatus(profile?.subscription)
                      if (s.isPaid) return '✅ Premium'
                      if (s.isTrial && s.isActive) return `🌟 Trial · ${s.daysLeft}d left`
                      if (s.isTrial && s.isExpired) return '🔒 Trial Ended'
                      return '🚀 Try Free'
                    })()}
                  </div>
                </div>
              )}
            </NavLink>
          )}
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none', marginTop: 4, color: 'var(--red)' }}>
            <span className="nav-item-icon"><LogOut size={18} /></span>
            {!collapsed && <span className="nav-item-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150 }} />}

      {/* Topbar */}
      <header className={`topbar ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="topbar-left">
          <button className="topbar-btn" onClick={() => setMobileOpen(o => !o)} id="hamburger">
            <Menu size={18} />
          </button>
          <div className="topbar-search">
            <Search size={14} />
            <input placeholder="Search exams, topics, questions..." />
          </div>
        </div>
        <div className="topbar-right">
          {profile?.selectedLanguage && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '6px 12px' }}>
              🌐 {profile.selectedLanguage}
            </span>
          )}
          <NavLink to="/app/notifications" className="topbar-btn">
            <Bell size={16} />
            {unread > 0 && <span className="notif-count">{unread > 9 ? '9+' : unread}</span>}
          </NavLink>
          {user?.isAdmin && (
            <NavLink to="/admin" className="topbar-btn" title="Admin Panel">
              <Shield size={16} />
            </NavLink>
          )}
          <NavLink to="/app/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px 4px 4px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', textDecoration: 'none' }}>
            <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.78rem' }}>
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-1)', fontWeight: 600 }}>{profile?.name?.split(' ')[0] || 'User'}</span>
          </NavLink>
        </div>
      </header>

      {/* Main content */}
      <main className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  )
}
