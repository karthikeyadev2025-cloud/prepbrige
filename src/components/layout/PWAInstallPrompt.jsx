import { useState, useEffect } from 'react'
import { Zap, Download, Share, Smartphone, X } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
  const [isMobile, setIsMobile] = useState(() => {
    const isMobileSize = window.innerWidth <= 768
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    return isMobileSize || hasTouch
  })
  const [isIOS] = useState(() => {
    const ua = window.navigator.userAgent.toLowerCase()
    return /iphone|ipad|ipod/.test(ua)
  })
  const [showPrompt, setShowPrompt] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    if (isInstalled) return

    // Detect mobile / tablet (keep resize listener)
    const checkMobile = () => {
      const isMobileSize = window.innerWidth <= 768
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsMobile(isMobileSize || hasTouch)
    }
    window.addEventListener('resize', checkMobile)

    const isMobileSize = () => window.innerWidth <= 768
    const hasTouchSupport = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // Handle beforeinstallprompt event (Android / Chrome Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // If user hasn't dismissed it in this session, show the prompt
      const dismissedThisSession = sessionStorage.getItem('pwa_prompt_dismissed')
      if (!dismissedThisSession && (isMobileSize() || hasTouchSupport())) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 5. If PWA gets installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      console.log('PrepBridge PWA installed successfully!')
    })

    // 6. Fallback trigger: for iOS or if beforeinstallprompt doesn't fire but it's mobile
    // Wait 2.5s and then show the prompt if not already dismissed in this session
    const timer = setTimeout(() => {
      const dismissedThisSession = sessionStorage.getItem('pwa_prompt_dismissed')
      if (!dismissedThisSession && (isMobileSize() || hasTouchSupport())) {
        setShowPrompt(true)
      }
    }, 2500)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timer)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native Chrome/Android install dialog
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    } else {
      // Show custom installation instructions (especially for iOS or other browsers)
      setShowInstructions(true)
    }
  }

  const handleDismiss = () => {
    // Dismiss only for this active tab session
    sessionStorage.setItem('pwa_prompt_dismissed', 'true')
    setShowPrompt(false)
  }

  // If already installed or not on mobile, do not render anything
  if (isInstalled || !isMobile || !showPrompt) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 6, 10, 0.94)',
      backdropFilter: 'blur(16px)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: '#f1f5f9',
      animation: 'fadeIn 0.3s ease both'
    }}>
      {/* Background blobs for premium feel */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '320px',
        height: '320px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '280px',
        height: '280px',
        background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Main card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(17, 24, 39, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '28px',
        padding: '32px 24px',
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(124, 58, 237, 0.15)',
        zIndex: 1,
        position: 'relative'
      }}>
        
        {/* Close Button (Subtle bypass) */}
        <button 
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >
          <X size={16} />
        </button>

        {/* Logo Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 10px 25px rgba(124, 58, 237, 0.4), 0 0 20px rgba(0, 212, 255, 0.2)',
          animation: 'logoPulse 3s ease-in-out infinite'
        }}>
          <Zap size={36} color="white" />
        </div>

        <h2 style={{
          fontSize: '1.65rem',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          marginBottom: '10px',
          lineHeight: '1.2'
        }}>
          Install Prep<span style={{
            background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Bridge</span> App
        </h2>

        <p style={{
          fontSize: '0.88rem',
          color: '#94a3b8',
          lineHeight: '1.6',
          marginBottom: '28px'
        }}>
          Prepare for <strong>200+ Govt Exams</strong> with mock tests, AI tutor, and current affairs directly on your phone.
        </p>

        {/* Dynamic content */}
        {!showInstructions ? (
          <>
            {/* Feature Highlights */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'left',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ color: '#10b981', display: 'flex' }}>🚀</div>
                <div><strong>Runs on 2G:</strong> Compressed &amp; light (2MB)</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ color: '#00d4ff', display: 'flex' }}>🔊</div>
                <div><strong>Audio AI Doubt Solving</strong> in your language</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ color: '#fbbf24', display: 'flex' }}>⚡</div>
                <div><strong>Instant Alerts:</strong> vacancy &amp; result drops</div>
              </div>
            </div>

            {/* Install Button */}
            <button
              onClick={handleInstallClick}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                border: 'none',
                borderRadius: '9999px',
                color: 'white',
                fontWeight: 800,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(124, 58, 237, 0.4)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Download size={18} />
              Install App Now
            </button>
          </>
        ) : (
          /* Instructions Panel */
          <div style={{
            animation: 'fadeIn 0.2s ease both'
          }}>
            <div style={{
              textAlign: 'left',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '20px 16px',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={16} color="#00d4ff" />
                How to Add to Home Screen
              </h4>

              {isIOS ? (
                /* iOS Specific */
                <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li>Open Safari browser and navigate to our page.</li>
                  <li>
                    Tap the <strong>Share</strong> button <Share size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> at the bottom bar.
                  </li>
                  <li>Scroll down the share sheet menu.</li>
                  <li>
                    Tap <strong>Add to Home Screen</strong> (➕).
                  </li>
                </ol>
              ) : (
                /* Android / Chrome Generic instruction */
                <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li>Tap the browser's menu button (3 vertical dots at top right).</li>
                  <li>
                    Tap <strong>Install App</strong> or <strong>Add to Home Screen</strong>.
                  </li>
                  <li>Follow the on-screen prompt to download.</li>
                </ol>
              )}
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9999px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ← Back to Overview
            </button>
          </div>
        )}

        {/* Continue in Browser option */}
        <div style={{ marginTop: '24px' }}>
          <button 
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
          >
            Continue in Browser (slower)
          </button>
        </div>

      </div>
    </div>
  )
}
