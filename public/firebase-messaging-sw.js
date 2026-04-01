/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCbe0n03WFN4g-Z0TCKJtRJNiUzctffCNQ',
  authDomain: 'squadup-a3a55.firebaseapp.com',
  projectId: 'squadup-a3a55',
  storageBucket: 'squadup-a3a55.firebasestorage.app',
  messagingSenderId: '497625770241',
  appId: '1:497625770241:web:26ae61b9730748c18ad300',
});

const messaging = firebase.messaging();

// Handle background push messages (app is closed or in background)
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const options = {
    body: body || 'You have a new notification',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: payload.data || {},
  };
  self.registration.showNotification(title || 'SquadUp', options);
});

// Handle notification click — open the relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const url = data.gameId ? `/pregame/${data.gameId}` : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
