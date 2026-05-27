import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useUserStore } from './store/useStore'
import AppLayout from './components/layout/AppLayout'
import PWAInstallPrompt from './components/layout/PWAInstallPrompt'

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ExamHub = lazy(() => import('./pages/ExamHub'))
const MockTest = lazy(() => import('./pages/MockTest'))
const TestEngine = lazy(() => import('./pages/TestEngine'))
const CurrentAffairs = lazy(() => import('./pages/CurrentAffairs'))
const QuestionPapers = lazy(() => import('./pages/QuestionPapers'))
const AITutor = lazy(() => import('./pages/AITutor'))
const Courses = lazy(() => import('./pages/Courses'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminQuestions = lazy(() => import('./pages/admin/AdminQuestions'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'))
const AdminContent = lazy(() => import('./pages/admin/AdminContent'))
const AdminTheme = lazy(() => import('./pages/admin/AdminTheme'))
const AdminIntegrations = lazy(() => import('./pages/admin/AdminIntegrations'))

const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#08090f' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading PrepBridge...</p>
    </div>
  </div>
)

function ProtectedRoute({ children }) {
  const { user, onboardingComplete, isAdmin } = useUserStore()
  if (!user) return <Navigate to="/" replace />
  if (!onboardingComplete && !isAdmin) return <Navigate to="/onboarding" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useUserStore()
  if (!user) return <Navigate to="/" replace />
  if (!isAdmin) return <Navigate to="/app/dashboard" replace />
  return children
}

function OnboardingRoute({ children }) {
  const { user, isAdmin } = useUserStore()
  if (!user) return <Navigate to="/" replace />
  if (isAdmin) return <Navigate to="/admin" replace />
  return children
}

export default function App() {
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('prepbridge_admin_theme')
      if (saved) {
        const theme = JSON.parse(saved)
        const root = document.documentElement
        if (theme.colorPurple) root.style.setProperty('--purple', theme.colorPurple)
        if (theme.colorCyan) root.style.setProperty('--cyan', theme.colorCyan)
        if (theme.colorEmerald) root.style.setProperty('--emerald', theme.colorEmerald)
        if (theme.colorAmber) root.style.setProperty('--amber', theme.colorAmber)
        if (theme.colorRed) root.style.setProperty('--red', theme.colorRed)
        if (theme.bgBase) root.style.setProperty('--bg', theme.bgBase)
        if (theme.bgLayer2) root.style.setProperty('--bg-2', theme.bgLayer2)
        if (theme.bgLayer3) root.style.setProperty('--bg-3', theme.bgLayer3)
        if (theme.textPrimary) root.style.setProperty('--text-1', theme.textPrimary)
        if (theme.textSecondary) root.style.setProperty('--text-2', theme.textSecondary)
        if (theme.textMuted) root.style.setProperty('--text-3', theme.textMuted)
        if (theme.borderRadius) {
          root.style.setProperty('--r-md', `${theme.borderRadius}px`)
          root.style.setProperty('--r-xl', `${parseInt(theme.borderRadius) + 8}px`)
        }
        if (theme.gradFrom && theme.gradTo) root.style.setProperty('--grad', `linear-gradient(135deg,${theme.gradFrom},${theme.gradTo})`)
        if (theme.fontFamily) root.style.setProperty('--font-family', theme.fontFamily)
      }
    } catch (e) {
      console.error('Failed to load dynamic theme:', e)
    }
  }, [])

  return (
    <BrowserRouter>
      <PWAInstallPrompt />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#111827', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.9rem' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={
            <OnboardingRoute><Onboarding /></OnboardingRoute>
          } />

          {/* App (Protected) */}
          <Route path="/app" element={
            <ProtectedRoute><AppLayout /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="exams" element={<ExamHub />} />
            <Route path="mock-tests" element={<MockTest />} />
            <Route path="test/:testId" element={<TestEngine />} />
            <Route path="current-affairs" element={<CurrentAffairs />} />
            <Route path="question-papers" element={<QuestionPapers />} />
            <Route path="ai-tutor" element={<AITutor />} />
            <Route path="courses" element={<Courses />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin (Protected + Admin) */}
          <Route path="/admin" element={
            <AdminRoute><AppLayout isAdmin /></AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="theme" element={<AdminTheme />} />
            <Route path="integrations" element={<AdminIntegrations />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
