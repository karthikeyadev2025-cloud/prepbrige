// Firebase Messaging Background Service Worker — PrepBridge
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase inside the service worker context
firebase.initializeApp({
  apiKey: "AIzaSyBphAmrAzMyHn4n4PQ0GQ9Ixj0xnWhVmZk",
  authDomain: "prepbridge-85189.firebaseapp.com",
  projectId: "prepbridge-85189",
  messagingSenderId: "1074613140786",
  appId: "1:1074613140786:web:6092d00d86da43c8426b2b"
});

const messaging = firebase.messaging();

// Intercept background notifications and render desktop toasts
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background payload:', payload);

  const notificationTitle = payload.notification?.title || 'PrepBridge Alert 📢';
  const notificationOptions = {
    body: payload.notification?.body || 'New competitive exam alert received.',
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
