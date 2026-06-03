import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AlertTriangle, ShieldAlert } from 'lucide-react'

/**
 * ExamInsulationLayout (Absolute Layout Insulation Framework)
 * Completely strips standard platform sidebars, topbars, footers, and global links.
 * Mounts a strict distraction-free layout to prevent exam abandonment and accidental misclicks.
 */
export default function ExamInsulationLayout() {
  const [showExitWarning, setShowExitWarning] = React.useState(false)
  const navigate = useNavigate()

  // Prevent accidental page reloads or navigation away during exam sessions
  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = 'Warning: Active exam session! Navigating away will auto-submit and grade your ongoing attempt.'
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const handleForceExit = () => {
    setShowExitWarning(false)
    navigate('/app/mock-tests', { replace: true })
  }

  return (
    <div style={{
      background: 'var(--bg)',
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Banner indicating Secured Distraction-Free exam mode */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: '#f87171',
        fontWeight: 600
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={14} />
          <span>INSULATED MOCK EXAM SYSTEM — SECURED VIEWPORT ACTIVE</span>
        </div>
        <button
          onClick={() => setShowExitWarning(true)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            color: 'white',
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            transition: 'background 0.2s',
            minWidth: '70px',
            minHeight: '28px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          Exit Exam
        </button>
      </div>

      {/* Main Exam viewport container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>

      {/* Absolute insulated exam abandonment exit warning modal */}
      {showExitWarning && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div className="card card-p" style={{
            maxWidth: '480px',
            width: '90%',
            background: 'var(--bg-2)',
            border: '1.5px solid var(--border-2)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={24} color="var(--amber)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'white', marginBottom: 6 }}>Abandon Mock Test?</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                  Exiting this active exam session will automatically close your attempt, trigger server-side evaluation, and commit your grade. Unsaved answers will be discarded.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowExitWarning(false)}
                style={{ minHeight: '48px', padding: '10px 20px' }}
              >
                Resume Exam
              </button>
              <button
                className="btn btn-primary"
                onClick={handleForceExit}
                style={{
                  background: 'var(--red)',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
                  minHeight: '48px',
                  padding: '10px 20px'
                }}
              >
                Abandon & Evaluate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
