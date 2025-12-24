// Firebase Messaging Service Worker
// This handles background push notifications when the app is not in focus

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyBtYuZH7hfXA6SM4O41r-IiDyJ5hgTOdaI",
  authDomain: "threads-of-shayari-ad46a.firebaseapp.com",
  projectId: "threads-of-shayari-ad46a",
  storageBucket: "threads-of-shayari-ad46a.appspot.com",
  messagingSenderId: "775383540594",
  appId: "1:775383540594:web:dfe562ac7cff153869b3eb",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
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
