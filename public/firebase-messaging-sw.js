// Firebase Messaging Service Worker
// This handles background push notifications when the app is not in focus

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Note: The config will be passed when initializing messaging
firebase.initializeApp({
  apiKey: self.FIREBASE_CONFIG?.apiKey || '',
  authDomain: self.FIREBASE_CONFIG?.authDomain || '',
  projectId: self.FIREBASE_CONFIG?.projectId || '',
  storageBucket: self.FIREBASE_CONFIG?.storageBucket || '',
  messagingSenderId: self.FIREBASE_CONFIG?.messagingSenderId || '',
  appId: self.FIREBASE_CONFIG?.appId || '',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
    tag: payload.data?.postId || 'general', // Group notifications by postId
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();
  
  // Navigate to the post if postId is provided
  const postId = event.notification.data?.postId;
  const url = postId ? `/posts/${postId}` : '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open a new window if no existing window found
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
