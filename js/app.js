// Main Application Logic
// Teacher Alex - English Academy

// Import Firebase services
import { auth, db } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { 
    doc, 
    setDoc, 
    getDoc 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

// App State
let isLoginMode = true;
let currentUser = null;

// DOM Elements
const loginPage = document.getElementById('loginPage');
const indexPage = document.getElementById('indexPage');
const loginForm = document.getElementById('loginForm');
const toggleMode = document.getElementById('toggleMode');
const errorMsg = document.getElementById('errorMsg');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// Utility Functions
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    setTimeout(() => errorMsg.classList.add('hidden'), 5000);
}

function showLogin() {
    loginPage.classList.remove('hidden');
    indexPage.classList.add('hidden');
}

function showDashboard() {
    loginPage.classList.add('hidden');
    indexPage.classList.remove('hidden');
}

function updateUI(user) {
    if (user) {
        currentUser = user;
        userName.textContent = user.email;
        showDashboard();
        console.log('User logged in:', user.email);
    } else {
        currentUser = null;
        showLogin();
        console.log('User logged out');
    }
}

// Authentication Functions
async function handleLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful:', userCredential.user.email);
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
    }
}

async function handleRegister(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Save user profile to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: email,
            role: 'student',
            level: 1,
            totalXP: 0,
            timeStudied: 0,
            currentStreak: 0,
            achievements: [],
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        });
        
        console.log('Registration successful:', userCredential.user.email);
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message);
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        console.log('Logout successful');
    } catch (error) {
        console.error('Logout error:', error);
        showError(error.message);
    }
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (isLoginMode) {
        await handleLogin(email, password);
    } else {
        await handleRegister(email, password);
    }
});

toggleMode.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    if (isLoginMode) {
        submitBtn.textContent = 'Login';
        toggleMode.textContent = 'Need an account? Register';
    } else {
        submitBtn.textContent = 'Register';
        toggleMode.textContent = 'Have an account? Login';
    }
});

logoutBtn.addEventListener('click', handleLogout);

// Auth State Listener
onAuthStateChanged(auth, updateUI);

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Teacher Alex English Academy initialized!');
});

// PWA Service Worker (commented until properly configured)
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js');
// }