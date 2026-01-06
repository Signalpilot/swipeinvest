// Firebase Cloud Messaging Service Worker
// This runs in the background to handle push notifications

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBtziKGoOU5xkWYU02ejnsz0-mA8LAHSI4",
  authDomain: "swipefolio-1c2f0.firebaseapp.com",
  projectId: "swipefolio-1c2f0",
  storageBucket: "swipefolio-1c2f0.firebasestorage.app",
  messagingSenderId: "378538752218",
  appId: "1:378538752218:web:875d3de9cefb80ccd9cde3",
  measurementId: "G-MMLH3ET3F9"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Swipefolio';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/coin.svg',
    badge: '/coin.svg',
    tag: payload.data?.tag || 'swipefolio-notification',
    data: payload.data,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: payload.data?.requireInteraction === 'true'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        const url = event.notification.data?.url || '/';
        return clients.openWindow(url);
      }
    })
  );
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');
  // Re-subscribe logic would go here
});

console.log('[SW] Firebase Messaging Service Worker loaded');
