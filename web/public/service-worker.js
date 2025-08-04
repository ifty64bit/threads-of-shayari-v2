importScripts("https://js.pusher.com/beams/service-worker.js");

PusherPushNotifications.onNotificationReceived = ({ pushEvent, payload, handleNotification }) => {
  // Only display toast if page(s) are open—delegate to front-end
  const promise = self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clients => {
      if (clients.length > 0) {
        // Post message to all open tabs
        clients.forEach(client => {
          client.postMessage({ type: 'PUSH_NOTIFICATION', payload });
        });
        // Skip default behavior (native notification)
        return;
      }
      // No tabs open: show native notification using default handler
      return handleNotification(payload);
    });

  pushEvent.waitUntil(promise);
};