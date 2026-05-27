// Native App Service — PrepBridge
// Wraps Capacitor plugins with graceful web fallbacks
// Works on web (no-op), Android, and iOS

const isNative = () => typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()

// ─── Status Bar ────────────────────────────────────────────────────
export async function setStatusBarDark() {
  if (!isNative()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#0a0f1e' })
  } catch { /* ignore */ }
}

// ─── Splash Screen ─────────────────────────────────────────────────
export async function hideSplashScreen() {
  if (!isNative()) return
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide({ fadeOutDuration: 300 })
  } catch { /* ignore */ }
}

// ─── Haptic Feedback ───────────────────────────────────────────────
export async function hapticLight() {
  if (!isNative()) return
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch { /* ignore */ }
}

export async function hapticMedium() {
  if (!isNative()) return
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch { /* ignore */ }
}

export async function hapticSuccess() {
  if (!isNative()) return
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics')
    await Haptics.notification({ type: NotificationType.Success })
  } catch { /* ignore */ }
}

export async function hapticError() {
  if (!isNative()) return
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics')
    await Haptics.notification({ type: NotificationType.Error })
  } catch { /* ignore */ }
}

// ─── Push Notifications ────────────────────────────────────────────
export async function registerPushNotifications(onToken, onNotification) {
  if (!isNative()) {
    // Web: use Firebase Messaging (already handled in notificationService.js)
    return
  }
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    // Request permission
    const permResult = await PushNotifications.requestPermissions()
    if (permResult.receive !== 'granted') {
      console.warn('[Push] Permission not granted')
      return
    }

    await PushNotifications.register()

    // Get device token
    PushNotifications.addListener('registration', token => {
      console.log('[Push] Native FCM token:', token.value)
      onToken?.(token.value)
    })

    PushNotifications.addListener('registrationError', err => {
      console.error('[Push] Registration error:', err.error)
    })

    // Foreground notification
    PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('[Push] Received:', notification)
      onNotification?.(notification)
    })

    // Notification tap
    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      console.log('[Push] Action:', action)
      const data = action.notification.data
      if (data?.url) window.location.href = data.url
    })
  } catch (e) {
    console.error('[Push] Setup failed:', e)
  }
}

// ─── App State (pause/resume) ──────────────────────────────────────
export async function setupAppListeners(onResume, onPause) {
  if (!isNative()) return () => {}
  try {
    const { App } = await import('@capacitor/app')
    const resumeHandle = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) onResume?.()
      else onPause?.()
    })
    const backHandle = App.addListener('backButton', () => {
      // Android back button — go back or minimize
      if (window.history.length > 1) {
        window.history.back()
      } else {
        App.minimizeApp()
      }
    })
    return () => {
      resumeHandle.remove()
      backHandle.remove()
    }
  } catch {
    return () => {}
  }
}

// ─── Keyboard ──────────────────────────────────────────────────────
export async function setupKeyboard() {
  if (!isNative()) return
  try {
    const { Keyboard } = await import('@capacitor/keyboard')
    Keyboard.addListener('keyboardWillShow', info => {
      document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`)
    })
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.setProperty('--keyboard-height', '0px')
    })
  } catch { /* ignore */ }
}

// ─── Open external URL in browser (not webview) ────────────────────
export async function openInBrowser(url) {
  if (!isNative()) {
    window.open(url, '_blank', 'noopener')
    return
  }
  try {
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url, presentationStyle: 'popover' })
  } catch {
    window.open(url, '_blank')
  }
}

// ─── Platform detection ────────────────────────────────────────────
export function getPlatform() {
  if (typeof window === 'undefined') return 'web'
  const cap = window.Capacitor
  if (!cap) return 'web'
  return cap.getPlatform() // 'web' | 'android' | 'ios'
}

export function isAndroid() { return getPlatform() === 'android' }
export function isIOS() { return getPlatform() === 'ios' }
