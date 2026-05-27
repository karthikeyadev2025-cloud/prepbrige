import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initAuthObserver } from './firebase/auth'
import { hideSplashScreen, setStatusBarDark, setupKeyboard } from './services/nativeService'

// Initialize Firebase auth state observer once globally
const unsubscribeAuth = initAuthObserver()
if (import.meta.hot) {
  import.meta.hot.dispose(() => unsubscribeAuth?.())
}

// Initialize native features (no-op on web)
hideSplashScreen()
setStatusBarDark()
setupKeyboard()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
