(() => {
  'use strict';

  const firebaseConfig = {
    apiKey: 'AIzaSyB0uzVr7YNL17tultmG6rtGBZBN2z1tD4s',
    authDomain: 'mini-e8864.firebaseapp.com',
    databaseURL: 'https://mini-e8864-default-rtdb.firebaseio.com',
    projectId: 'mini-e8864',
    storageBucket: 'mini-e8864.firebasestorage.app',
    messagingSenderId: '228491639997',
    appId: '1:228491639997:web:619ebf911f1bb64d158bd4',
    measurementId: 'G-L9R3BHXE9C'
  };

  const VAPID_KEY = 'BNSBhmaQhbcYXaj7qlCT4dueHFsQRfBYyKE_Gqvj418Kn8D7fvb9GFDYgrmYOJ_jg74OJmzV7Z2mHMZEpYJO6ik';

  if (typeof window.firebase === 'undefined') {
    console.error('Firebase SDK is not loaded. Load compat SDK scripts before firebase-config.js.');
    return;
  }

  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

  const db = firebase.firestore();
  const auth = firebase.auth();
  const storage = firebase.storage();

  let messaging = null;
  try {
    if ('Notification' in window && 'serviceWorker' in navigator && firebase.messaging) {
      messaging = firebase.messaging();
    }
  } catch (error) {
    console.warn('Firebase Messaging is unavailable:', error.message);
  }

  window.db = db;
  window.auth = auth;
  window.storage = storage;
  window.messaging = messaging;
  window.firebaseConfig = firebaseConfig;

  async function saveTokenToDatabase(token) {
    const user = auth.currentUser;
    if (!user) {
      localStorage.setItem('fcmToken', token);
      return;
    }

    await db.collection('users').doc(user.uid).set({
      fcmToken: token,
      tokenUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  window.requestFCMToken = async function requestFCMToken() {
    if (!messaging || !('Notification' in window)) return null;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;

      let registration;
      try {
        registration = await navigator.serviceWorker.getRegistration();
      } catch (_) {
        registration = null;
      }

      const options = { vapidKey: VAPID_KEY };
      if (registration) options.serviceWorkerRegistration = registration;

      const token = await messaging.getToken(options);
      if (token) await saveTokenToDatabase(token);
      return token || null;
    } catch (error) {
      console.warn('FCM token request failed:', error.message);
      return null;
    }
  };

  window.onForegroundMessage = function onForegroundMessage(callback) {
    if (!messaging || typeof callback !== 'function') return () => {};
    return messaging.onMessage(callback);
  };

  auth.onAuthStateChanged(async user => {
    if (!user) return;
    const pendingToken = localStorage.getItem('fcmToken');
    if (!pendingToken) return;
    try {
      await saveTokenToDatabase(pendingToken);
      localStorage.removeItem('fcmToken');
    } catch (error) {
      console.warn('Could not attach saved FCM token:', error.message);
    }
  });

  console.log('✅ Firebase connected successfully');
})();

