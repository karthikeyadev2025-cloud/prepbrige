import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom'
import { useUserStore, useAppStore } from '../../store/useStore'
import { signOutUser } from '../../firebase/auth'
import { getSubscriptionStatus } from '../../services/paymentService'
import { getSupabaseCurrentAffairs } from '../../services/supabaseService'
import {
  LayoutDashboard, BookOpen, FileText, Newspaper, BrainCircuit,
  GraduationCap, Trophy, Bell, User, Settings, LogOut,
  ChevronLeft, ChevronRight, Search, Menu, Zap, Shield,
  ClipboardList, Users, Palette, Layers, Home, Calendar, TrendingUp
} from 'lucide-react'

const BOTTOM_TABS = [
  { path: '/app/home', icon: Home, label: 'Home' },
  { path: '/app/papers', icon: FileText, label: 'Papers' },
  { path: '/app/timetable', icon: Calendar, label: 'Timetable' },
  { path: '/app/news', icon: Newspaper, label: 'News' },
  { path: '/app/profile', icon: User, label: 'Profile' },
]

const NAV_ITEMS = [
  { section: 'Platform' },
  { path: '/app/home', icon: Home, label: 'Home' },
  { path: '/app/papers', icon: FileText, label: 'Papers' },
  { path: '/app/timetable', icon: Calendar, label: 'Timetable' },
  { path: '/app/news', icon: Newspaper, label: 'News' },
  { path: '/app/progress', icon: TrendingUp, label: 'Progress' },
  { section: 'Tools' },
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/app/exams', icon: BookOpen, label: 'Exam Hub' },
  { path: '/app/mock-tests', icon: ClipboardList, label: 'Mock Tests' },
  { path: '/app/current-affairs', icon: Newspaper, label: 'Current Affairs', badge: 'LIVE' },
  { path: '/app/planner', icon: Zap, label: 'AI Planner', badge: 'NEW' },
  { path: '/app/revision', icon: Layers, label: 'Revision Hub', badge: 'NEW' },
  { path: '/app/question-papers', icon: FileText, label: 'Question Papers' },
  { path: '/app/courses', icon: GraduationCap, label: 'Courses & Notes' },
  { path: '/app/ai-tutor', icon: BrainCircuit, label: 'AI Tutor' },
  { section: 'Community' },
  { path: '/app/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/app/notifications', icon: Bell, label: 'Notifications' },
]

const ADMIN_ITEMS = [
  { section: 'Admin Panel' },
  { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/content', icon: BookOpen, label: 'Boards & Exams' },
  { path: '/admin/papers', icon: FileText, label: 'Question Papers' },
  { path: '/admin/questions', icon: ClipboardList, label: 'Question Bank' },
  { path: '/admin/timetables', icon: Calendar, label: 'Timetables' },
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

  // India Pride Ticker State
  const [prideItems, setPrideItems] = useState([])
  const [tickerIndex, setTickerIndex] = useState(0)

  useEffect(() => {
    async function fetchPrideItems() {
      const affairs = await getSupabaseCurrentAffairs()
      setPrideItems(affairs.filter(item => item.importance === 'high' || item.isPrideMoment))
    }
    fetchPrideItems()
  }, [])

  useEffect(() => {
    if (prideItems.length === 0) return
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % prideItems.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [prideItems])

  useEffect(() => { setMobileOpen(false) }, [location.pathname]) // eslint-disable-line react-hooks/set-state-in-effect
  const handleLogout = async () => {
    try {
      await signOutUser()
    } catch (e) {
      console.warn('Firebase signOut failed, clearing local store:', e)
      logout()
    }
    navigate('/')
  }
  return (
    <div className="app-layout" style={{ paddingTop: prideItems.length > 0 ? '32px' : 0 }}>
      {/* Global India Pride Ticker */}
      {prideItems.length > 0 && (
        <div className="india-pride-ticker" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '32px',
          background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(5,6,10,0.96) 25%, rgba(5,6,10,0.96) 75%, rgba(16, 185, 129, 0.15) 100%)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '0 16px',
          overflow: 'hidden',
          fontSize: '0.78rem',
          color: 'var(--text-2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 12, flexShrink: 0 }}>
            <span>🇮🇳</span> Proud to be an Indian:
          </div>
          <div style={{
            flex: 1,
            textAlign: 'left',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontStyle: 'italic',
            color: 'white',
            animation: 'fadeIn 0.5s ease'
          }}>
            "{prideItems[tickerIndex]?.prideDetails || prideItems[tickerIndex]?.summary}"
          </div>
          <div onClick={() => navigate('/app/current-affairs')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--cyan)', fontWeight: 700, textTransform: 'uppercase', paddingLeft: 12, flexShrink: 0 }}>
            Open Tracker <ChevronRight size={10} />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`} style={{ top: prideItems.length > 0 ? '32px' : 0, height: prideItems.length > 0 ? 'calc(100vh - 32px)' : '100vh' }}>
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
            <button onClick={() => setCollapsed(false)} className="btn btn-ghost btn-icon" style={{ position: 'absolute', right: -24, top: 20, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '50%', width: 48, height: 48, padding: 0, zIndex: 10 }}>
              <ChevronRight size={16} />
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
            <>
              {user?.isAdmin && (
                <NavLink to="/admin" className="nav-item" style={{ color: 'var(--amber)', marginBottom: 4 }}>
                  <span className="nav-item-icon"><Shield size={18} color="var(--amber)" /></span>
                  {!collapsed && <span className="nav-item-label" style={{ fontWeight: 700 }}>Enter Admin Panel</span>}
                </NavLink>
              )}
              <NavLink to="/app/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                  {(profile?.name || profile?.displayName || 'U')[0].toUpperCase()}
                </div>
                {!collapsed && (
                  <div className="user-info">
                    <div className="user-name">{profile?.name || profile?.displayName || 'User'}</div>
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
            </>
          )}
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none', marginTop: 4, color: 'var(--red)' }}>
            <span className="nav-item-icon"><LogOut size={18} /></span>
            {!collapsed && <span className="nav-item-label">Logout</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150 }} />}

      {/* Topbar */}
      <header className={`topbar ${collapsed ? 'sidebar-collapsed' : ''}`} style={{ top: prideItems.length > 0 ? '32px' : 0 }}>
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
              🌐 {profile?.selectedLanguage}
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
          <NavLink to="/app/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px 4px 4px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', textDecoration: 'none', minHeight: 48 }}>
            <div className="user-avatar" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
              {(profile?.name || profile?.displayName || 'U')[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-1)', fontWeight: 600, paddingRight: 6 }}>{(profile?.name || profile?.displayName || 'User').split(' ')[0]}</span>
          </NavLink>
        </div>
      </header>

      {/* Main content */}
      <main className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`} style={{ paddingTop: prideItems.length > 0 ? 'calc(var(--topbar-h, 64px) + 32px)' : undefined }}>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      {!isAdmin && (
        <nav className="mobile-bottom-nav" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 'calc(60px + var(--sab, 0px))',
          paddingBottom: 'var(--sab, 0px)',
          background: 'rgba(8,9,15,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
          zIndex: 200,
          display: 'none',
          alignItems: 'stretch',
          justifyContent: 'space-around',
        }}>
          {BOTTOM_TABS.map(tab => (
            <NavLink key={tab.path} to={tab.path}
              style={({ isActive }) => ({
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 3, textDecoration: 'none',
                color: isActive ? '#60A5FA' : 'var(--text-3)',
                fontSize: '0.62rem', fontWeight: 600, transition: 'color 0.2s', padding: '6px 0',
              })}>
              {({ isActive }) => (
                <>
                  <div style={{
                    width: 36, height: 28, borderRadius: 10,
                    background: isActive ? 'rgba(30,64,175,0.2)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                  }}>
                    <tab.icon size={18} />
                  </div>
                  <span>{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
