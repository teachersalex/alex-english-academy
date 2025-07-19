// Authentication Logic for Landing Page
// Teacher Alex - English Academy

import { auth } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';

// App State
let isTeacherLoginMode = true;

// DOM Elements - Teacher Portal
const teacherLoginBtn = document.getElementById('teacherLoginBtn');
const teacherModal = document.getElementById('teacherModal');
const closeTeacherModal = document.getElementById('closeTeacherModal');
const teacherForm = document.getElementById('teacherForm');
const teacherToggleMode = document.getElementById('teacherToggleMode');
const teacherErrorMsg = document.getElementById('teacherErrorMsg');

// DOM Elements - Student Portal
const studentLoginBtn = document.getElementById('studentLoginBtn');
const studentModal = document.getElementById('studentModal');
const closeStudentModal = document.getElementById('closeStudentModal');
const studentForm = document.getElementById('studentForm');
const studentErrorMsg = document.getElementById('studentErrorMsg');

// Modal Functions - Teacher
function showTeacherModal() {
    teacherModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideTeacherModal() {
    teacherModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showTeacherError(message) {
    teacherErrorMsg.textContent = message;
    teacherErrorMsg.classList.remove('hidden');
    setTimeout(() => teacherErrorMsg.classList.add('hidden'), 5000);
}

// Modal Functions - Student
function showStudentModal() {
    studentModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideStudentModal() {
    studentModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showStudentError(message) {
    studentErrorMsg.textContent = message;
    studentErrorMsg.classList.remove('hidden');
    setTimeout(() => studentErrorMsg.classList.add('hidden'), 5000);
}

// Authentication Functions - Teacher
async function handleTeacherLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Teacher login successful:', userCredential.user.email);
        
        // Redirect to teacher dashboard
        window.location.href = 'teacher/dashboard.html';
        
    } catch (error) {
        console.error('Teacher login error:', error);
        showTeacherError('Invalid email or password');
    }
}

async function handleTeacherRegister(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Teacher registration successful:', userCredential.user.email);
        
        // Redirect to teacher dashboard
        window.location.href = 'teacher/dashboard.html';
        
    } catch (error) {
        console.error('Teacher registration error:', error);
        showTeacherError(error.message);
    }
}

// Authentication Functions - Student
async function handleStudentLogin(username, password) {
    try {
        // For now, we'll use a simple validation
        // TODO: Connect to student database
        
        if (username && password) {
            console.log('Student login attempt:', username);
            
            // Simulate successful login
            // In the future, this will validate against student database
            localStorage.setItem('studentLoggedIn', 'true');
            localStorage.setItem('studentUsername', username);
            
            // Redirect to student portal (to be created)
            window.location.href = 'student/portal.html';
        } else {
            showStudentError('Por favor, preencha todos os campos');
        }
        
    } catch (error) {
        console.error('Student login error:', error);
        showStudentError('Erro no login. Tente novamente.');
    }
}

// Event Listeners - Teacher Portal
teacherLoginBtn.addEventListener('click', showTeacherModal);
closeTeacherModal.addEventListener('click', hideTeacherModal);

// Event Listeners - Student Portal  
studentLoginBtn.addEventListener('click', showStudentModal);
closeStudentModal.addEventListener('click', hideStudentModal);

// Close modals on outside click
teacherModal.addEventListener('click', (e) => {
    if (e.target === teacherModal) {
        hideTeacherModal();
    }
});

studentModal.addEventListener('click', (e) => {
    if (e.target === studentModal) {
        hideStudentModal();
    }
});

// Teacher form submission
teacherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('teacherEmail').value;
    const password = document.getElementById('teacherPassword').value;
    
    if (isTeacherLoginMode) {
        await handleTeacherLogin(email, password);
    } else {
        await handleTeacherRegister(email, password);
    }
});

// Student form submission
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('studentUsername').value;
    const password = document.getElementById('studentPassword').value;
    
    await handleStudentLogin(username, password);
});

// Toggle between teacher login and register
teacherToggleMode.addEventListener('click', () => {
    isTeacherLoginMode = !isTeacherLoginMode;
    const submitBtn = teacherForm.querySelector('button[type="submit"]');
    
    if (isTeacherLoginMode) {
        submitBtn.textContent = 'Access Dashboard';
        teacherToggleMode.textContent = 'Need an account? Register';
    } else {
        submitBtn.textContent = 'Create Account';
        teacherToggleMode.textContent = 'Have an account? Login';
    }
});

// Auth State Listener - redirect if already logged in
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname === '/') {
        // User is logged in, redirect to dashboard
        window.location.href = 'teacher/dashboard.html';
    }
});

// Escape key to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideTeacherModal();
        hideStudentModal();
    }
});

console.log('🚀 Teacher Alex Landing Page with Student & Teacher Portals initialized!');
