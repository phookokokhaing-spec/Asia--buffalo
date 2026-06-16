// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyB0uzVr7YNL17tultmG6rtGBZBN2z1tD4s",
    authDomain: "mini-e8864.firebaseapp.com",
    databaseURL: "https://mini-e8864-default-rtdb.firebaseio.com",
    projectId: "mini-e8864",
    storageBucket: "mini-e8864.firebasestorage.app",
    messagingSenderId: "228491639997",
    appId: "1:228491639997:web:619ebf911f1bb64d158bd4",
    measurementId: "G-L9R3BHXE9C"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
var db = firebase.firestore();
var auth = firebase.auth();
var storage = firebase.storage();
var messaging = firebase.messaging();

// Make them globally available
window.db = db;
window.auth = auth;
window.storage = storage;
window.messaging = messaging;
console.log('✅ Firebase connected successfully!');

// ============================================
// FCM NOTIFICATION FUNCTIONS
// ============================================

// ⭐ YOUR VAPID KEY
const VAPID_KEY = "BNSBhmaQhbcYXaj7qlCT4dueHFsQRfBYyKE_Gqvj418Kn8D7fvb9GFDYgrmYOJ_jg74OJmzV7Z2mHMZEpYJO6ik";

// Request permission and get FCM token
window.requestFCMToken = async function() {
    try {
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
            console.warn('❌ Notification permission denied');
            return null;
        }
        
        const currentToken = await messaging.getToken({ vapidKey: VAPID_KEY });
        
        if (currentToken) {
            console.log('✅ FCM Token:', currentToken);
            await saveTokenToDatabase(currentToken);
            return currentToken;
        } else {
            console.warn('❌ No registration token available');
            return null;
        }
    } catch (err) {
        console.error('❌ Error getting FCM token:', err);
        return null;
    }
};

// Listen to foreground messages
window.onForegroundMessage = function(callback) {
    messaging.onMessage((payload) => {
        console.log('📩 Foreground message received:', payload);
        callback(payload);
    });
};

// Save token to Firestore
async function saveTokenToDatabase(token) {
    const user = auth.currentUser;
    if (!user) {
        localStorage.setItem('fcmToken', token);
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).set({
            fcmToken: token,
            tokenUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('✅ Token saved to database');
    } catch (err) {
        console.error('Error saving token:', err);
    }
}

// Handle token refresh
messaging.onTokenRefresh(async () => {
    try {
        const refreshedToken = await messaging.getToken({ vapidKey: VAPID_KEY });
        console.log('🔄 Token refreshed:', refreshedToken);
        await saveTokenToDatabase(refreshedToken);
    } catch (err) {
        console.error('Unable to retrieve refreshed token:', err);
    }
});

