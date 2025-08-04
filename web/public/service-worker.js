importScripts("https://js.pusher.com/beams/service-worker.js");

self.addEventListener('push', () => {
  // Beams service worker handles push internally; no need to handle here
});

// Override default Beams handler
PusherPushNotifications.onNotificationReceived = ({ pushEvent, payload, handleNotification }) => {
  pushEvent.waitUntil((async () => {
    // Check all controlled clients (tabs/windows)
    const allClients = await self.clients.matchAll({ includeUncontrolled: false, type: 'window' });
    const focused = allClients.some(c => c.visibilityState === 'visible');

    if (focused) {
      // Send message to page(s)
      allClients.forEach(client => {
        client.postMessage({
          type: 'PUSH_NOTIFICATION',
          payload
        });
      });
      // Don't call default notification display
    } else {
      // Use default Beams notification behavior:
      return handleNotification(payload);
    }
  })());
};