import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'in.prepbridge.app',
  appName: 'PrepBridge',
  webDir: 'dist',

  // Production server — comment out for local dev builds
  // server: { url: 'https://prepbridge.in', cleartext: false },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0f1e',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',           // dark icons on light bg / light icons on dark bg
      backgroundColor: '#0a0f1e',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',          // resize body so inputs stay above keyboard
      style: 'DARK',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    App: {
      // Handle deep links — e.g. prepbridge://auth for OTP redirect
    },
  },

  // Android specific
  android: {
    allowMixedContent: false,
    backgroundColor: '#0a0f1e',
    captureInput: true,
    webContentsDebuggingEnabled: false, // set true only for debug builds
  },

  // iOS specific
  ios: {
    contentInset: 'automatic',    // respects safe area / notch
    scrollEnabled: true,
    backgroundColor: '#0a0f1e',
    allowsLinkPreview: false,
    handleApplicationNotifications: true,
  },
}

export default config
