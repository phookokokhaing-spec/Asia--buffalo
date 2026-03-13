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

// Initialize services - USE VAR NOT CONST
var db = firebase.firestore();
var auth = firebase.auth();
var analytics = firebase.analytics();
var storage = firebase.storage();
// Make them globally available
window.db = db;
window.auth = auth;
window.storage = storage;
console.log('✅ Firebase connected successfully!');



