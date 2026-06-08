import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'
import { initAuthObserver } from './firebase/auth'
import { hideSplashScreen, setStatusBarDark, setupKeyboard } from './services/nativeService'

// Global error boundary — shows a readable message instead of blank screen
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#08090f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚡</div>
            <h2 style={{ color: '#f1f5f9', marginBottom: 8 }}>PrepBridge failed to load</h2>
            <p style={{ color: '#64748b', marginBottom: 24, fontSize: '0.9rem' }}>{this.state.error.message}</p>
            <button onClick={() => window.location.reload()} style={{ background: 'linear-gradient(135deg,#7c3aed,#00d4ff)', color: 'white', border: 'none', borderRadius: 999, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Initialize Firebase auth state observer once globally
const unsubscribeAuth = initAuthObserver()
if (import.meta.hot) {
  import.meta.hot.dispose(() => unsubscribeAuth?.())
}

// Initialize native features (no-op on web)
hideSplashScreen()
setStatusBarDark()
setupKeyboard()

// Elite Console Branding
console.log(
  `%c
  ____                 ____       _     _            
 |  _ \\ _ __ ___ _ __ | __ ) _ __(_) __| | __ _  ___ 
 | |_) | '__/ _ \\ '_ \\|  _ \\| '__| |/ _\` |/ _\` |/ _ \\
 |  __/| | |  __/ |_) | |_) | |  | | (_| | (_| |  __/
 |_|   |_|  \\___| .__/|____/|_|  |_|\\__,_|\\__, |\\___|
                |_|                       |___/      
                
  🚀 Welcome to the PrepBridge Matrix!
  Secure Enterprise Environment Initiated.
  `,
  'color: #10B981; font-weight: bold; font-family: monospace; font-size: 14px;'
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
