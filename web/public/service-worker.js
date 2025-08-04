importScripts("https://js.pusher.com/beams/service-worker.js");

PusherPushNotifications.onNotificationReceived = ({ pushEvent, payload, handleNotification }) => {
  const promise = self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clients => {
      const isFocused = clients.some(client => client.focused);

      if (clients.length > 0) {
        // Post message to all open tabs
        clients.forEach(client => {
          client.postMessage({ type: 'PUSH_NOTIFICATION', payload });
        });

        // Show native notification only if not focused (i.e. minimized/in background)
        if (!isFocused) {
          return self.registration.showNotification(payload.notification.title, {
            body: payload.notification.body,
            icon: payload.notification.icon,
            data: payload.data,
          });
        }

        // Do nothing if focused and visible
        return;
      }

      // No tabs open at all — show notification
      return handleNotification(payload);
    });

  pushEvent.waitUntil(promise);
};