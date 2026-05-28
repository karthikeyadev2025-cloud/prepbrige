import { useState, useEffect } from 'react'
import { Settings, CreditCard, Shield, Mail, Key, Phone, CloudLightning, Save, HelpCircle, Eye, EyeOff, Smartphone } from 'lucide-react'
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

  // App Store Links (managed from Admin → Integrations → App Downloads)
  appStoreEnabled: true,
  playStoreUrl: 'https://play.google.com/store/apps/details?id=in.prepbridge.app',
  appStoreUrl: 'https://apps.apple.com/app/prepbridge/id0000000000',
  appStoreHeadline: 'Take Your Prep Everywhere',
  appStoreSubtext: 'Native app for Android & iOS. Works offline. Push alerts for every exam.',
  showPlayStore: true,
  showAppStore: true,
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
    <main className="page animate-fade-in" role="main" aria-label="Integrations & Settings">
      <header style={{ marginBottom: 24 }}>
        <div className="label" style={{ marginBottom: 8 }}>Admin Panel</div>
        <h1 style={{ marginBottom: 8 }}>
          <Settings size={24} color="var(--purple)" style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Integrations & Payments
        </h1>
        <p style={{ color: 'var(--text-3)', margin: 0 }}>
          Configure Razorpay, Firebase, OAuth, and app store links without touching code.
        </p>
      </header>

      {/* Save Button */}
      <div className="card card-p" style={{ marginBottom: 24 }}>
        <button
          onClick={handleSave}
          className="btn btn-primary"
          disabled={loading}
          style={{ gap: 8 }}
          aria-label={loading ? 'Saving settings...' : 'Save and synchronize all settings'}
        >
          <Save size={16} />
          {loading ? 'Syncing...' : 'Save & Sync Live'}
        </button>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginLeft: 16 }}>
          Syncs to Supabase and all live nodes instantly
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Navigation Sidebar */}
        <nav aria-label="Integration categories" role="navigation">
          <div className="card" style={{ position: 'sticky', top: 24 }}>
            <div className="tabs">
              {[
                { id: 'razorpay', label: 'Payment Gateway', icon: CreditCard, desc: 'Razorpay setup' },
                { id: 'firebase', label: 'Firebase & Auth', icon: Shield, desc: 'SDK & security' },
                { id: 'supabase', label: 'Supabase', icon: CloudLightning, desc: 'Storage & DB' },
                { id: 'oauth', label: 'Google OAuth', icon: Key, desc: 'Login integration' },
                { id: 'general', label: 'App Settings', icon: Settings, desc: 'Support & links' },
                { id: 'appstore', label: 'App Downloads', icon: Smartphone, desc: 'Play/App Store' },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  aria-label={`Switch to ${tab.label} settings`}
                  style={{
                    outline: 'none',
                    ':focus': {
                      boxShadow: '0 0 0 2px rgba(0, 212, 255, 0.3)'
                    }
                  }}
                >
                  <tab.icon size={18} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{tab.label}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>{tab.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ position: 'relative' }}>
          {/* Razorpay Payment Gateway */}
          {activeTab === 'razorpay' && (
            <section aria-labelledby="razorpay-title">
              <h2 id="razorpay-title" style={{ marginBottom: 16 }}>Payment Gateway Setup</h2>

              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ marginBottom: 8 }}>Razorpay Keys</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                    Paste your Razorpay keys for real-time payment processing. Test mode is safe for development.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <label htmlFor="razorpay-key-id" style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>
                      Razorpay Key ID
                    </label>
                    <input
                      id="razorpay-key-id"
                      type="text"
                      className="form-input"
                      value={settings.razorpayKeyId}
                      onChange={e => updateSetting('razorpayKeyId', e.target.value)}
                      placeholder="rzp_test_..."
                      aria-describedby="razorpay-key-desc"
                    />
                    <div id="razorpay-key-desc" style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>
                      Available in your Razorpay Dashboard → Settings → API Keys
                    </div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <label htmlFor="razorpay-key-secret" style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>
                      Razorpay Key Secret
                    </label>
                    <div style={{ display: 'flex' }}>
                      <input
                        id="razorpay-key-secret"
                        type={showSecret ? 'text' : 'password'}
                        className="form-input"
                        value={settings.razorpayKeySecret}
                        onChange={e => updateSetting('razorpayKeySecret', e.target.value)}
                        placeholder="rzp_live_..."
                        aria-describedby="razorpay-key-secret-desc"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="btn btn-ghost"
                        style={{ marginLeft: 8 }}
                        aria-label={showSecret ? 'Hide secret key' : 'Show secret key'}
                      >
                        {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div id="razorpay-key-secret-desc" style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>
                      Never share this secret. Keep it secure in production.
                    </div>
                  </div>

                  <div>
                    <label htmlFor="plan-price" style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>
                      Monthly Plan Price (₹)
                    </label>
                    <input
                      id="plan-price"
                      type="number"
                      className="form-input"
                      value={settings.planPrice}
                      onChange={e => updateSetting('planPrice', e.target.value)}
                      placeholder="249"
                      min="0"
                      aria-describedby="plan-price-desc"
                    />
                    <div id="plan-price-desc" style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>
                      Price displayed to users per month. Currently: ₹{settings.planPrice}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="razorpay-mode" style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>
                      Mode
                    </label>
                    <select
                      id="razorpay-mode"
                      className="form-select"
                      value={settings.razorpayMode}
                      onChange={e => updateSetting('razorpayMode', e.target.value)}
                      aria-describedby="razorpay-mode-desc"
                    >
                      <option value="test">Test Mode</option>
                      <option value="live">Live Mode</option>
                    </select>
                    <div id="razorpay-mode-desc" style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>
                      Test mode uses test credentials. Live mode processes real payments.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      id="auto-upgrade"
                      checked={settings.autoUpgradeUser}
                      onChange={e => updateSetting('autoUpgradeUser', e.target.checked)}
                      aria-describedby="auto-upgrade-desc"
                    />
                    <label htmlFor="auto-upgrade" style={{ fontSize: '0.82rem', cursor: 'pointer' }}>
                      Auto-upgrade users to paid plan after payment
                    </label>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Firebase & Auth */}
          {activeTab === 'firebase' && (
            <section aria-labelledby="firebase-title">
              <h2 id="firebase-title" style={{ marginBottom: 16 }}>Firebase & Authentication</h2>

              <div className="card">
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ marginBottom: 8 }}>Firebase Configuration</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                    These are auto-filled from your .env file. Edit only if needed.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>API Key</label>
                    <div className="form-input" style={{ background: 'var(--bg-3)', cursor: 'default' }}>
                      {settings.firebaseApiKey || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>Auth Domain</label>
                    <div className="form-input" style={{ background: 'var(--bg-3)', cursor: 'default' }}>
                      {settings.firebaseAuthDomain || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>Project ID</label>
                    <div className="form-input" style={{ background: 'var(--bg-3)', cursor: 'default' }}>
                      {settings.firebaseProjectId || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>Storage Bucket</label>
                    <div className="form-input" style={{ background: 'var(--bg-3)', cursor: 'default' }}>
                      {settings.firebaseStorageBucket || 'Not set'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <h3 style={{ marginBottom: 8 }}>Auth Settings</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      id="force-phone-otp"
                      checked={settings.forcePhoneOtp}
                      onChange={e => updateSetting('forcePhoneOtp', e.target.checked)}
                      aria-describedby="force-phone-otp-desc"
                    />
                    <label htmlFor="force-phone-otp" style={{ fontSize: '0.82rem', cursor: 'pointer' }}>
                      Force phone OTP for all logins
                    </label>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Supabase */}
          {activeTab === 'supabase' && (
            <section aria-labelledby="supabase-title">
              <h2 id="supabase-title" style={{ marginBottom: 16 }}>Supabase Integration</h2>

              <div className="card">
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ marginBottom: 8 }}>Supabase Configuration</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                    PostgreSQL database and real-time sync settings.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>Supabase URL</label>
                    <div className="form-input" style={{ background: 'var(--bg-3)', cursor: 'default' }}>
                      {settings.supabaseUrl || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>Anon Key</label>
                    <div className="form-input" style={{ background: 'var(--bg-3)', cursor: 'default' }}>
                      {settings.supabaseAnonKey ? settings.supabaseAnonKey.substring(0, 20) + '...' : 'Not set'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>Storage Bucket</label>
                    <div className="form-input" style={{ background: 'var(--bg-3)', cursor: 'default' }}>
                      {settings.supabaseBucket || 'Not set'}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* OAuth */}
          {activeTab === 'oauth' && (
            <section aria-labelledby="oauth-title">
              <h2 id="oauth-title" style={{ marginBottom: 16 }}>Google OAuth Setup</h2>

              <div className="card">
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ marginBottom: 8 }}>Google OAuth Credentials</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                    Set up OAuth for seamless Google login. Update these after configuring in Google Cloud Console.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <label htmlFor="google-client-id" style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>
                      Google Client ID
                    </label>
                    <input
                      id="google-client-id"
                      type="text"
                      className="form-input"
                      value={settings.googleClientId}
                      onChange={e => updateSetting('googleClientId', e.target.value)}
                      placeholder="YOUR_GOOGLE_CLIENT_ID"
                      aria-describedby="google-client-id-desc"
                    />
                    <div id="google-client-id-desc" style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>
                      Found in Google Cloud Console → Credentials
                    </div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <label htmlFor="google-client-secret" style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>
                      Google Client Secret
                    </label>
                    <div style={{ display: 'flex' }}>
                      <input
                        id="google-client-secret"
                        type={showSecret ? 'text' : 'password'}
                        className="form-input"
                        value={settings.googleClientSecret}
                        onChange={e => updateSetting('googleClientSecret', e.target.value)}
                        placeholder="YOUR_GOOGLE_CLIENT_SECRET"
                        aria-describedby="google-client-secret-desc"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="btn btn-ghost"
                        style={{ marginLeft: 8 }}
                        aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                      >
                        {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div id="google-client-secret-desc" style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>
                      Keep this secret secure. Never commit to public repositories.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <section aria-labelledby="general-title">
              <h2 id="general-title" style={{ marginBottom: 16 }}>General App Settings</h2>

              <div className="card">
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ marginBottom: 8 }}>Support Information</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                    Customer support contact details displayed in the app.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <label htmlFor="support-email" style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>
                      Support Email
                    </label>
                    <input
                      id="support-email"
                      type="email"
                      className="form-input"
                      value={settings.supportEmail}
                      onChange={e => updateSetting('supportEmail', e.target.value)}
                      placeholder="support@prepbridge.in"
                    />
                  </div>

                  <div>
                    <label htmlFor="support-phone" style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>
                      Support Phone
                    </label>
                    <input
                      id="support-phone"
                      type="tel"
                      className="form-input"
                      value={settings.supportPhone}
                      onChange={e => updateSetting('supportPhone', e.target.value)}
                      placeholder="+91 8080808080"
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      id="maintenance-mode"
                      checked={settings.maintenanceMode}
                      onChange={e => updateSetting('maintenanceMode', e.target.checked)}
                      aria-describedby="maintenance-mode-desc"
                    />
                    <label htmlFor="maintenance-mode" style={{ fontSize: '0.82rem', cursor: 'pointer' }}>
                      Enable Maintenance Mode
                    </label>
                  </div>
                  <div id="maintenance-mode-desc" style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4 }}>
                    When enabled, all users see a maintenance message.
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* App Store Links */}
          {activeTab === 'appstore' && (
            <section aria-labelledby="appstore-title">
              <h2 id="appstore-title" style={{ marginBottom: 16 }}>App Downloads</h2>

              <div className="card">
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ marginBottom: 8 }}>App Store Links</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                    Configure app store links and promotional messaging.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <label htmlFor="play-store-url" style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>
                      Google Play Store URL
                    </label>
                    <input
                      id="play-store-url"
                      type="url"
                      className="form-input"
                      value={settings.playStoreUrl}
                      onChange={e => updateSetting('playStoreUrl', e.target.value)}
                      placeholder="https://play.google.com/store/apps/details?id=in.prepbridge.app"
                    />
                  </div>

                  <div>
                    <label htmlFor="app-store-url" style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>
                      Apple App Store URL
                    </label>
                    <input
                      id="app-store-url"
                      type="url"
                      className="form-input"
                      value={settings.appStoreUrl}
                      onChange={e => updateSetting('appStoreUrl', e.target.value)}
                      placeholder="https://apps.apple.com/app/prepbridge/id0000000000"
                    />
                  </div>

                  <div>
                    <label htmlFor="app-store-headline" style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>
                      App Store Headline
                    </label>
                    <input
                      id="app-store-headline"
                      type="text"
                      className="form-input"
                      value={settings.appStoreHeadline}
                      onChange={e => updateSetting('appStoreHeadline', e.target.value)}
                      placeholder="Take Your Prep Everywhere"
                    />
                  </div>

                  <div>
                    <label htmlFor="app-store-subtext" style={{ fontSize: '0.82rem', display: 'block', marginBottom: 6 }}>
                      App Store Subtext
                    </label>
                    <input
                      id="app-store-subtext"
                      type="text"
                      className="form-input"
                      value={settings.appStoreSubtext}
                      onChange={e => updateSetting('appStoreSubtext', e.target.value)}
                      placeholder="Native app for Android & iOS. Works offline."
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        id="show-play-store"
                        checked={settings.showPlayStore}
                        onChange={e => updateSetting('showPlayStore', e.target.checked)}
                      />
                      <label htmlFor="show-play-store" style={{ fontSize: '0.82rem', cursor: 'pointer' }}>
                        Show Google Play
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        id="show-app-store"
                        checked={settings.showAppStore}
                        onChange={e => updateSetting('showAppStore', e.target.checked)}
                      />
                      <label htmlFor="show-app-store" style={{ fontSize: '0.82rem', cursor: 'pointer' }}>
                        Show App Store
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-3)', borderRadius: 'var(--r-md)' }}>
                  <h4 style={{ marginBottom: 12 }}>Preview</h4>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {settings.showPlayStore && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--green)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '8px 16px', opacity: settings.showPlayStore ? 1 : 0.4 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 20.5v-17c.49.32 1.05.61 1.66.87 2.09.91 4.07 1.34 5.9 1.34.76 0 1.5-.1 2.22-.28.72-.18 1.38-.44 2-.77.61-.33 1.19-.73 1.74-1.19s.96-.97 1.29-1.51c.32.54.71 1.02 1.15 1.48.44.46.91.86 1.41 1.21.5.35 1.04.65 1.61.89.57.24 1.18.44 1.82.59v17c-1.09-.44-2.27-.67-3.55-.67-1.24 0-2.44.2-3.59.64-1.15.45-2.19 1.08-3.1 1.89-.91-.81-1.95-1.45-3.1-1.89-1.15-.44-2.35-.64-3.59-.64-1.28 0-2.46.23-3.55.67m4-7c-.32 0-.64.12-.89.37-.25.25-.37.57-.37.89s.12.64.37.89c.25.25.57.37.89.37.32 0 .64-.12.89-.37.25-.25.37-.57.37-.89s-.12-.64-.37-.89c-.25-.25-.57-.37-.89-.37m8 0c-.32 0-.64.12-.89.37-.25.25-.37.57-.37.89s.12.64.37.89c.25.25.57.37.89.37.32 0 .64-.12.89-.37.25-.25.37-.57.37-.89s-.12-.64-.37-.89c-.25-.25-.57-.37-.89-.37z"/></svg>
                        <div>
                          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>GET IT ON</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white', lineHeight: 1.1 }}>Google Play</div>
                        </div>
                      </div>
                    )}
                    {settings.showAppStore && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#000', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '8px 16px', opacity: settings.appStoreEnabled ? 1 : 0.4 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                        <div>
                          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>DOWNLOAD ON THE</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white', lineHeight: 1.1 }}>App Store</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      <style jsx>{`
        .tabs {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .tab-btn:hover {
          background: var(--bg-3);
        }

        .tab-btn.active {
          background: var(--purple-10);
          border-color: var(--purple);
          color: var(--purple);
        }

        .tab-btn:focus {
          outline: 2px solid var(--cyan);
          outline-offset: 2px;
        }

        .form-input {
          width: 100%;
          padding: 10px 14px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          color: var(--text-1);
          font-size: 0.88rem;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: 2px solid var(--cyan);
          outline-offset: 2px;
          background: var(--bg-3);
        }

        .form-select {
          width: 100%;
          padding: 10px 14px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          color: var(--text-1);
          font-size: 0.88rem;
          cursor: pointer;
        }

        .form-select:focus {
          outline: 2px solid var(--cyan);
          outline-offset: 2px;
          background: var(--bg-3);
        }
      `}</style>
    </main>
  )
}