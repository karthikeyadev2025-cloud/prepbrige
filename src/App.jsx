import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useUserStore } from './store/useStore'
import AppLayout from './components/layout/AppLayout'

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

const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#08090f' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading PrepBridge...</p>
    </div>
  </div>
)

function ProtectedRoute({ children }) {
  const { user, onboardingComplete } = useUserStore()
  if (!user) return <Navigate to="/auth" replace />
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useUserStore()
  if (!user) return <Navigate to="/auth" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function OnboardingRoute({ children }) {
  const { user } = useUserStore()
  if (!user) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
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
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
