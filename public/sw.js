self.addEventListener('push', function (event) {
  const options = {
    body: event.data.text(),
    icon: '/assets/images/logo.png',
    badge: '/assets/images/logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View Order',
        icon: '/assets/images/logo.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('Order Ready!', options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
