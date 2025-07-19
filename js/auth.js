// Authentication Logic for Landing Page
// Teacher Alex - English Academy

import { auth } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';

// App State
let isLoginMode = true;

// DOM Elements
const teacherLoginBtn = document.getElementById('teacherLoginBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');
const toggleMode = document.getElementById('toggleMode');
const errorMsg = document.getElementById('errorMsg');

// Modal Functions
function showModal() {
    loginModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    loginModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    setTimeout(() => errorMsg.classList.add('hidden'), 5000);
}

// Authentication Functions
async function handleLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful:', userCredential.user.email);
        
        // Redirect to teacher dashboard
        window.location.href = 'teacher/dashboard.html';
        
    } catch (error) {
        console.error('Login error:', error);
        showError('Invalid email or password');
    }
}

async function handleRegister(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Registration successful:', userCredential.user.email);
        
        // Redirect to teacher dashboard
        window.location.href = 'teacher/dashboard.html';
        
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message);
    }
}

// Event Listeners
teacherLoginBtn.addEventListener('click', showModal);
closeModal.addEventListener('click', hideModal);

// Close modal on outside click
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        hideModal();
    }
});

// Login form submission
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

// Toggle between login and register
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

// Auth State Listener - redirect if already logged in
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname === '/') {
        // User is logged in, redirect to dashboard
        window.location.href = 'teacher/dashboard.html';
    }
});

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideModal();
    }
});

console.log('🚀 Teacher Alex Landing Page initialized!');