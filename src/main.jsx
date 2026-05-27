import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initAuthObserver } from './firebase/auth'

// Initialize Firebase auth state observer once globally at app start
// This ensures auth state is restored from Firebase persistence on reload
// even before the Auth page mounts its own effect
const unsubscribeAuth = initAuthObserver()
if (import.meta.hot) {
  import.meta.hot.dispose(() => unsubscribeAuth?.())
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
