// Firebase Messaging Background Service Worker — PrepBridge
// Note: Service workers cannot access import.meta.env — config is injected at build time
// via the VITE_FIREBASE_* env vars using vite-plugin-pwa's injectManifest or hardcoded here.
// These are PUBLIC Firebase config values — safe to include (they are not secret keys).
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Firebase config — these client-side values are public (not secret)
// They're identical to what's in firebase/config.js
const firebaseConfig = {
  apiKey: self.VITE_FIREBASE_API_KEY || "AIzaSyBphAmrAzMyHn4n4PQ0GQ9Ixj0xnWhVmZk",
  authDomain: "prepbridge-85189.firebaseapp.com",
  projectId: "prepbridge-85189",
  messagingSenderId: "1074613140786",
  appId: "1:1074613140786:web:6092d00d86da43c8426b2b"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background push notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background push received:', payload);

  const title = payload.notification?.title || 'PrepBridge 📢';
  const options = {
    body: payload.notification?.body || 'New exam alert!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    tag: payload.data?.tag || 'prepbridge',
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  self.registration.showNotification(title, options);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
