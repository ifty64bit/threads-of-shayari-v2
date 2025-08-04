importScripts("https://js.pusher.com/beams/service-worker.js");

PusherPushNotifications.onNotificationReceived = ({ pushEvent, payload, handleNotification }) => {
  const promise = self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clients => {
      const anyClientVisible = clients.some(client => client.visibilityState === "visible");

      // Post message to all open tabs
      clients.forEach(client => {
        client.postMessage({ type: 'PUSH_NOTIFICATION', payload });
      });

      // Only suppress if the app can show it inline (visible and focused)
      if (!anyClientVisible) {
        return self.registration.showNotification(payload.notification.title, {
          body: payload.notification.body,
          icon: payload.notification.icon,
          data: payload.data,
        });
      }

      return;
    });

  pushEvent.waitUntil(promise);
};