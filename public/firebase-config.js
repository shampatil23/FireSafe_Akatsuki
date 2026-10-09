// FIREBASE PROTOTYPE CONFIGURATION
// Add your Firebase project details here. 
// Both mobile-sim.html and operator.html use this file to communicate in real-time.

const firebaseConfig = {
    apiKey: "AIzaSyABxypsQ9pxPvjb5WJyYltxzhcucnQFEHo",
    authDomain: "firesafe-48056.firebaseapp.com",
    projectId: "firesafe-48056",
    storageBucket: "firesafe-48056.firebasestorage.app",
    messagingSenderId: "712111941461",
    appId: "1:712111941461:web:5229b53f5af5fca5ef31dc",
    databaseURL: "https://firesafe-48056-default-rtdb.firebaseio.com"
};

// Initialize Firebase
let db = null;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log("Firebase RTDB initialized successfully.");
} catch (e) {
    console.error("Firebase Initialization Error (check your config):", e);
}
