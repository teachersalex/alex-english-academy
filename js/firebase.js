// Firebase Configuration and Initialization
// Teacher Alex - English Academy

// Import Firebase SDK modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDxkiG1iLyIkwJlETiknDqBcBMsmrRsSyk",
    authDomain: "teacher-alex-portal.firebaseapp.com",
    projectId: "teacher-alex-portal",
    storageBucket: "teacher-alex-portal.firebasestorage.app",
    messagingSenderId: "859459202100",
    appId: "1:859459202100:web:5aa01b23c4fc7ba1b16e61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export app instance
export default app;

console.log('🔥 Firebase initialized successfully!');