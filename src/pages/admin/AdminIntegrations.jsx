import { useState, useEffect } from 'react'
import { Settings, CreditCard, Shield, Mail, Key, Phone, CloudLightning, Save, HelpCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getSupabaseSettings, saveSupabaseSettings } from '../../services/supabaseService'

const DEFAULT_SETTINGS = {
  // Razorpay
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY || '',
  razorpayKeySecret: '',
  planPrice: '249',
  currency: 'INR',
  razorpayMode: 'test', // test | live
  autoUpgradeUser: true,

  // Google OAuth Credentials (paste actual keys in Admin integrations dashboard)
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
  googleClientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',

  // Firebase — pre-filled from environment variables
  firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  firebaseStorageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  firebaseSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  firebaseAppId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  forcePhoneOtp: false,
  firebaseVapidKey: '',
  webPushPrivateKey: '',

  // Supabase Storage — pre-filled from environment variables
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  supabaseBucket: import.meta.env.VITE_SUPABASE_BUCKET || 'profile_photos',

  // General App Settings
  supportEmail: 'support@prepbridge.in',
  supportPhone: '+91 8080808080',
  maintenanceMode: false,
}

export default function AdminIntegrations() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [activeTab, setActiveTab] = useState('razorpay')
  const [loading, setLoading] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  // Load settings from Supabase on mount (with localStorage fallback)
  useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      try {
        const local = localStorage.getItem('prepbridge_admin_settings')
        if (local) {
          setSettings(JSON.parse(local))
        }

        // Fetch live from Supabase Settings PostgreSQL table
        const liveSettings = await getSupabaseSettings()
        if (liveSettings) {
          setSettings(liveSettings)
          localStorage.setItem('prepbridge_admin_settings', JSON.stringify(liveSettings))
        }
      } catch (e) {
        console.warn('Failed to load from Supabase database, using local cached settings:', e)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const updateSetting = (key, value) => {
    setSettings(s => ({ ...s, [key]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // 1. Save to local storage for quick sync
      localStorage.setItem('prepbridge_admin_settings', JSON.stringify(settings))

      // 2. Save to live Supabase database so all nodes sync instantly
      await saveSupabaseSettings(settings)

      toast.success('Integrations & settings successfully synchronized live!')
    } catch (e) {
      console.error('Error saving settings to database:', e)
      toast.error('Failed to sync to database, saved locally in cache.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={24} color="var(--purple)" /> Integrations &amp; Payments settings
          </h1>
          <p className="page-subtitle">Configure live Razorpay payment processing, Firebase SDK keys, OTP triggers, and customer support rules without touching code.</p>
        </div>
        <button onClick={handleSave} className="btn btn-primary btn-sm" style={{ gap: 8 }} disabled={loading}>
          <Save size={14} /> {loading ? 'Syncing...' : 'Save & Sync Live'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Navigation Sidebar */}
        <div>
          <div className="card" style={{ overflow: 'hidden', position: 'sticky', top: 80 }}>
            {[
              { id: 'razorpay', icon: CreditCard, label: 'Razorpay Gateway' },
              { id: 'google', icon: Key, label: 'Google OAuth Config' },
              { id: 'firebase', icon: Shield, label: 'Firebase Platform' },
              { id: 'supabase', icon: CloudLightning, label: 'Supabase Storage' },
              { id: 'app', icon: Settings, label: 'Support & Globals' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 18px',
                  background: activeTab === tab.id ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
                  borderLeft: activeTab === tab.id ? '3px solid var(--cyan)' : '3px solid transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: activeTab === tab.id ? 'var(--cyan)' : 'var(--text-2)',
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Configurations Area */}
        <div>
          {activeTab === 'razorpay' && (
            <div className="card card-p animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <CreditCard size={20} color="var(--cyan)" />
                <h4 style={{ margin: 0 }}>Razorpay API Configuration</h4>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Razorpay Processing Mode</label>
                  <span style={{ fontSize: '0.72rem', background: settings.razorpayMode === 'live' ? 'rgba(239,68,68,0.15)' : 'rgba(0,212,255,0.15)', color: settings.razorpayMode === 'live' ? 'var(--red)' : 'var(--cyan)', border: `1px solid ${settings.razorpayMode === 'live' ? 'rgba(239,68,68,0.3)' : 'rgba(0,212,255,0.3)'}`, borderRadius: 'var(--r-full)', padding: '2px 8px', fontWeight: 700, textTransform: 'uppercase' }}>
                    {settings.razorpayMode} Mode
                  </span>
                </div>
                <div className="tabs" style={{ marginTop: 8 }}>
                  <button className={`tab ${settings.razorpayMode === 'test' ? 'active' : ''}`} onClick={() => updateSetting('razorpayMode', 'test')} style={{ fontSize: '0.78rem', flex: 1 }}>Sandbox / Test</button>
                  <button className={`tab ${settings.razorpayMode === 'live' ? 'active' : ''}`} onClick={() => updateSetting('razorpayMode', 'live')} style={{ fontSize: '0.78rem', flex: 1 }}>Production / Live</button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Razorpay Key ID</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.razorpayKeyId}
                    onChange={e => updateSetting('razorpayKeyId', e.target.value)}
                    placeholder="rzp_test_..."
                    style={{ paddingRight: '40px', fontFamily: 'monospace' }}
                  />
                  <Key size={14} style={{ position: 'absolute', right: '14px', top: '16px', color: 'var(--text-4)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Razorpay Key Secret</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSecret ? 'text' : 'password'}
                    className="form-input"
                    value={settings.razorpayKeySecret}
                    onChange={e => updateSetting('razorpayKeySecret', e.target.value)}
                    placeholder="Key Secret..."
                    style={{ paddingRight: '40px', fontFamily: 'monospace' }}
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    style={{ position: 'absolute', right: '14px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)' }}
                  >
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div className="form-group">
                  <label className="form-label">All-Access Plan Price</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '12px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-2)' }}>₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.planPrice}
                      onChange={e => updateSetting('planPrice', e.target.value)}
                      style={{ paddingLeft: '28px' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-select" value={settings.currency} onChange={e => updateSetting('currency', e.target.value)}>
                    <option value="INR">INR (Indian Rupee)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Auto-Upgrade User Plan</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Automatically unlock Paid plan for students on successful checkout.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoUpgradeUser}
                  onChange={e => updateSetting('autoUpgradeUser', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--cyan)', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="card card-p animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Shield size={20} color="var(--purple)" />
                <h4 style={{ margin: 0 }}>Firebase Integration Config</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label">Firebase API Key</label>
                  <input type="text" className="form-input" value={settings.firebaseApiKey} onChange={e => updateSetting('firebaseApiKey', e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Auth Domain</label>
                  <input type="text" className="form-input" value={settings.firebaseAuthDomain} onChange={e => updateSetting('firebaseAuthDomain', e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label">Project ID</label>
                  <input type="text" className="form-input" value={settings.firebaseProjectId} onChange={e => updateSetting('firebaseProjectId', e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Storage Bucket</label>
                  <input type="text" className="form-input" value={settings.firebaseStorageBucket} onChange={e => updateSetting('firebaseStorageBucket', e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div className="form-group">
                  <label className="form-label">Messaging Sender ID</label>
                  <input type="text" className="form-input" value={settings.firebaseSenderId} onChange={e => updateSetting('firebaseSenderId', e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">App ID</label>
                  <input type="text" className="form-input" value={settings.firebaseAppId} onChange={e => updateSetting('firebaseAppId', e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div className="form-group">
                  <label className="form-label">Web Push VAPID Public Key</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.firebaseVapidKey || ''}
                    onChange={e => updateSetting('firebaseVapidKey', e.target.value)}
                    placeholder="VAPID Public Key..."
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Web Push Private Key</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSecret ? 'text' : 'password'}
                      className="form-input"
                      value={settings.webPushPrivateKey || ''}
                      onChange={e => updateSetting('webPushPrivateKey', e.target.value)}
                      placeholder="Private Key..."
                      style={{ paddingRight: '40px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                    />
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      style={{ position: 'absolute', right: '14px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)' }}
                    >
                      {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Enforce SMS Phone OTP Verification</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Force OTP confirmation via mobile SMS verification during registration.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.forcePhoneOtp}
                  onChange={e => updateSetting('forcePhoneOtp', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--purple)', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'google' && (
            <div className="card card-p animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Key size={20} color="var(--purple)" />
                <h4 style={{ margin: 0 }}>Google OAuth API Credentials</h4>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Google Client ID</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.googleClientId || ''}
                    onChange={e => updateSetting('googleClientId', e.target.value)}
                    placeholder="123456-abcdef.apps.googleusercontent.com"
                    style={{ paddingRight: '40px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                  <Key size={14} style={{ position: 'absolute', right: '14px', top: '16px', color: 'var(--text-4)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Google Client Secret</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSecret ? 'text' : 'password'}
                    className="form-input"
                    value={settings.googleClientSecret || ''}
                    onChange={e => updateSetting('googleClientSecret', e.target.value)}
                    placeholder="Client Secret..."
                    style={{ paddingRight: '40px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    style={{ position: 'absolute', right: '14px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)' }}
                  >
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: 'var(--r-md)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                <div style={{ fontWeight: 700, color: 'var(--purple)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HelpCircle size={14} /> Google Cloud Security Setup Instructions
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-2)' }}>
                  <li>Whitelists are essential for redirect loops. Add your custom domain (<b>https://prepbridge.in</b> and <b>https://www.prepbridge.in</b>) to your <b>Authorized JavaScript Origins</b>.</li>
                  <li>Configure <b>Authorized Redirect URIs</b> under Google Credentials using your Firebase auth handler link: <br /><code style={{ display: 'inline-block', background: 'var(--bg-3)', padding: '2px 6px', borderRadius: 4, marginTop: 4, fontFamily: 'monospace', fontSize: '0.75rem' }}>https://prepbridge-85189.firebaseapp.com/__/auth/handler</code></li>
                  <li>Enable Google Sign-in inside your Firebase Console and paste your Web client ID and Client Secret in the <b>Web SDK Configuration</b>.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="card card-p animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <CloudLightning size={20} color="var(--cyan)" />
                <h4 style={{ margin: 0 }}>Supabase Storage Configuration</h4>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Supabase Project URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.supabaseUrl || ''}
                  onChange={e => updateSetting('supabaseUrl', e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Supabase Anon Public API Key</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSecret ? 'text' : 'password'}
                    className="form-input"
                    value={settings.supabaseAnonKey || ''}
                    onChange={e => updateSetting('supabaseAnonKey', e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
                    style={{ paddingRight: '40px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    style={{ position: 'absolute', right: '14px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)' }}
                  >
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Storage Bucket Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.supabaseBucket || ''}
                  onChange={e => updateSetting('supabaseBucket', e.target.value)}
                  placeholder="profile_photos"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ padding: '16px', background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: 'var(--r-md)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                <div style={{ fontWeight: 700, color: 'var(--cyan)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HelpCircle size={14} /> Supabase Bucket Requirements
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-2)' }}>
                  <li>Your storage bucket (default: <code style={{ fontFamily: 'monospace' }}>profile_photos</code>) MUST be set to <b>Public</b> inside the Supabase Storage dashboard.</li>
                  <li>Enable open Read/Write CORS rules in the Supabase Storage tab so your production domain (<b>https://prepbridge.in</b>) can upload profile images directly.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'app' && (
            <div className="card card-p animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <CloudLightning size={20} color="var(--amber)" />
                <h4 style={{ margin: 0 }}>Customer Support &amp; System Rules</h4>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Student Support Email</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" className="form-input" value={settings.supportEmail} onChange={e => updateSetting('supportEmail', e.target.value)} style={{ paddingLeft: '38px' }} />
                  <Mail size={14} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-4)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Student Support Mobile Phone</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" className="form-input" value={settings.supportPhone} onChange={e => updateSetting('supportPhone', e.target.value)} style={{ paddingLeft: '38px' }} />
                  <Phone size={14} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-4)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--r-md)' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--red)' }}>Enable Maintenance Mode ⚠️</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Temorarily lock the student interface with a Maintenance countdown screen.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={e => updateSetting('maintenanceMode', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--red)', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
