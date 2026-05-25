import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useUserStore } from '../store/useStore'
import { toast } from 'react-hot-toast'
import { Zap, Eye, EyeOff, ArrowLeft, Phone, Mail, Loader } from 'lucide-react'
import {
  signInWithGoogle, signInEmail, signUpEmail,
  setupRecaptcha, sendOTP, verifyOTP, initAuthObserver
} from '../firebase/auth'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const isSignup = searchParams.get('signup') === '1'
  const [mode, setMode] = useState(isSignup ? 'signup' : 'login')
  const [method, setMethod] = useState('phone')
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, onboardingComplete } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = initAuthObserver()
    return () => unsub?.()
  }, [])

  useEffect(() => {
    if (user && onboardingComplete) navigate('/app/dashboard')
    else if (user) navigate('/onboarding')
  }, [user, onboardingComplete])

  // Setup invisible recaptcha
  useEffect(() => {
    setupRecaptcha('recaptcha-container')
  }, [])

  const handlePhoneStep1 = async () => {
    if (!phone || phone.length < 10) { toast.error('Enter valid 10-digit mobile number'); return }
    setLoading(true)
    try {
      await sendOTP('+91' + phone)
      setStep(2)
      toast.success('OTP sent to +91 ' + phone)
    } catch (err) {
      // Demo fallback — if Firebase phone auth not configured
      console.warn('Phone OTP error (using demo mode):', err.message)
      setStep(2)
      toast.success('OTP sent! (Demo: use 123456)')
    }
    setLoading(false)
  }

  const handlePhoneOTP = async () => {
    if (!otp || otp.length < 6) { toast.error('Enter 6-digit OTP'); return }
    setLoading(true)
    try {
      if (otp === '123456') {
        // Demo mode fallback
        const { setUser, setIsAdmin } = useUserStore.getState()
        setUser({ uid: 'demo_' + Date.now(), phone: '+91' + phone })
        toast.success('Welcome to PrepBridge! 🎉')
      } else {
        await verifyOTP(otp)
        toast.success('Welcome to PrepBridge! 🎉')
      }
    } catch (err) {
      toast.error('Invalid OTP. Please try again.')
    }
    setLoading(false)
  }

  const handleEmailAuth = async () => {
    if (!email) { toast.error('Enter email address'); return }
    if (!password || password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUpEmail(email, password, name)
        toast.success('Account created! Welcome 🎉')
      } else {
        await signInEmail(email, password)
        toast.success('Logged in successfully!')
      }
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' ? 'No account found. Please sign up.'
        : err.code === 'auth/wrong-password' ? 'Incorrect password.'
        : err.code === 'auth/email-already-in-use' ? 'Email already registered. Please login.'
        : err.code === 'auth/invalid-credential' ? 'Invalid credentials. Please check email & password.'
        : err.message
      toast.error(msg)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      toast.success('Signed in with Google!')
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') toast.error('Sign-in cancelled.')
      else toast.error('Google sign-in failed. Try email instead.')
    }
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (method === 'phone') {
      if (step === 1) handlePhoneStep1()
      else handlePhoneOTP()
    } else {
      handleEmailAuth()
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Left */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', overflow: 'hidden' }}>
        <div id="recaptcha-container" />
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: 500, height: 500, background: 'var(--purple)', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.18 }} />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: 32 }}>
            <ArrowLeft size={14} /> Back to home
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, background: 'var(--grad)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="white" />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>Prep<span style={{ color: 'var(--cyan)' }}>Bridge</span></span>
          </div>

          <h2 style={{ marginBottom: 6 }}>{mode === 'login' ? 'Welcome back! 👋' : 'Join PrepBridge 🚀'}</h2>
          <p style={{ marginBottom: 28, fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Login to continue your preparation.' : 'Create your free account. One login for all exams.'}
          </p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} className="btn btn-outline" style={{ width: '100%', marginBottom: 20, gap: 12, padding: '12px 24px', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-4)' }}>or</span>
            <div className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          {/* Method tabs */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button className={`tab ${method === 'phone' ? 'active' : ''}`} onClick={() => { setMethod('phone'); setStep(1) }}>
              <Phone size={13} /> Phone OTP
            </button>
            <button className={`tab ${method === 'email' ? 'active' : ''}`} onClick={() => setMethod('email')}>
              <Mail size={13} /> Email
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {method === 'phone' && step === 1 && (
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="form-input" style={{ width: 70, textAlign: 'center', flexShrink: 0 }}>+91</div>
                  <input className="form-input" type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required />
                </div>
              </div>
            )}

            {method === 'phone' && step === 2 && (
              <div className="form-group">
                <label className="form-label">OTP sent to +91 {phone}</label>
                <input className="form-input" type="text" inputMode="numeric" placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required style={{ letterSpacing: '0.4em', fontSize: '1.3rem', textAlign: 'center', fontWeight: 700 }} />
                <button type="button" onClick={() => { setStep(1); setOtp('') }} style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  ← Change number / Resend OTP
                </button>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-4)', background: 'var(--amber-10)', border: '1px solid var(--amber)33', borderRadius: 'var(--r-sm)', padding: '6px 10px' }}>
                  💡 Demo mode: Enter <strong>123456</strong> as OTP
                </div>
              </div>
            )}

            {method === 'email' && (
              <>
                {mode === 'signup' && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showPwd ? 'text' : 'password'} placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'} value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-4)', background: 'var(--cyan-10)', border: '1px solid var(--cyan-20)', borderRadius: 'var(--r-sm)', padding: '6px 10px' }}>
                  🔑 Admin access: <strong>admin@prepbridge.in</strong>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading
                ? <Loader size={18} style={{ animation: 'spin 0.7s linear infinite' }} />
                : method === 'phone' && step === 1 ? '📱 Send OTP'
                : method === 'phone' ? '✓ Verify OTP'
                : mode === 'login' ? '→ Login'
                : '→ Create Account'
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--text-3)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
              {mode === 'login' ? 'Sign up free' : 'Login'}
            </button>
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right" style={{ flex: 1, background: 'var(--bg-2)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 400, height: 400, background: 'var(--cyan)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.12 }} />
        <div style={{ textAlign: 'center', maxWidth: 360, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '4rem', marginBottom: 24 }}>🎯</div>
          <h3 style={{ marginBottom: 12 }}>One Login.<br />All India Exams.</h3>
          <p style={{ marginBottom: 32 }}>From IAS to bank clerk — single account, ₹599/year, all features included.</p>
          <div style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.08),rgba(124,58,237,0.08))', border: '1px solid var(--border-cyan)', borderRadius: 'var(--r-lg)', padding: '20px 24px', textAlign: 'left', marginBottom: 20 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: 12 }}>🔥 What you get:</div>
            {['AI Tutor powered by Google Gemini', '5 Lakh+ questions & PYQs', 'All 200+ central & state exams', 'Daily current affairs auto-loaded', 'Mock tests with All India rank', 'All 22 Indian languages', 'Push notifications for exam alerts', 'Works offline on any device'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '0.85rem' }}>
                <div style={{ width: 5, height: 5, background: 'var(--emerald)', borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-2)' }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-4)' }}>
            🛡️ Powered by Firebase + Google Gemini AI
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){.auth-right{display:none}}`}</style>
    </div>
  )
}
