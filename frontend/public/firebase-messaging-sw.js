// eslint-disable-next-line no-restricted-globals
self.addEventListener("push", function (event) {
  const data = event.data.json();
  // eslint-disable-next-line no-restricted-globals
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    data: data,
  });
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (event.notification.data && event.notification.data.url) {
    // eslint-disable-next-line no-undef
    clients.openWindow(event.notification.data.url);
  }
});
