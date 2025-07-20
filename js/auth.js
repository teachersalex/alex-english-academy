// Authentication Logic for Landing Page
// Teacher Alex - English Academy

import { auth } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';

// App State
let isRegistrationMode = false;
let isTeacherLoginMode = true;

// DOM Elements - Student Form
const loginBtn = document.getElementById('loginBtn');
const createAccountLink = document.getElementById('createAccountLink');
const studentUsername = document.getElementById('studentUsername');
const studentPassword = document.getElementById('studentPassword');

// DOM Elements - Teacher Modal
const teacherAccessBtn = document.getElementById('teacherAccessBtn');
const teacherModal = document.getElementById('teacherModal');
const closeTeacherModal = document.getElementById('closeTeacherModal');
const teacherForm = document.getElementById('teacherForm');

// DOM Elements - Messages
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');

// Utility Functions
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    successMsg.classList.add('hidden');
    setTimeout(() => errorMsg.classList.add('hidden'), 5000);
}

function showSuccess(message) {
    successMsg.textContent = message;
    successMsg.classList.remove('hidden');
    errorMsg.classList.add('hidden');
    setTimeout(() => successMsg.classList.add('hidden'), 3000);
}

function hideMessages() {
    errorMsg.classList.add('hidden');
    successMsg.classList.add('hidden');
}

// Student Form Functions - Simples e direto
function showRegistrationMode() {
    isRegistrationMode = true;
    createAccountLink.textContent = '← Voltar para login';
    showSuccess('Modo registro ativado - preencha os dados para criar sua conta');
}

function showLoginMode() {
    isRegistrationMode = false;
    createAccountLink.textContent = 'Criar nova conta de estudante';
    hideMessages();
}

// Teacher Modal Functions
function showTeacherModal() {
    teacherModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideTeacherModal() {
    teacherModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Authentication Functions - Student
async function handleStudentAuth(username, password) {
    try {
        if (!username || !password) {
            showError('Por favor, preencha todos os campos');
            return;
        }

        if (isRegistrationMode) {
            // Student Registration
            console.log('Student registration attempt:', username);
            
            // TODO: Save to student database
            localStorage.setItem('studentLoggedIn', 'true');
            localStorage.setItem('studentUsername', username);
            
            showSuccess('Conta criada com sucesso! Redirecionando...');
            
            setTimeout(() => {
                window.location.href = 'student/portal.html';
            }, 2000);
            
        } else {
            // Student Login (padrão)
            console.log('Student login attempt:', username);
            
            // TODO: Validate against student database
            localStorage.setItem('studentLoggedIn', 'true');
            localStorage.setItem('studentUsername', username);
            
            showSuccess('Login realizado com sucesso!');
            
            setTimeout(() => {
                window.location.href = 'student/portal.html';
            }, 1500);
        }
        
    } catch (error) {
        console.error('Student auth error:', error);
        showError('Erro no sistema. Tente novamente.');
    }
}

// Authentication Functions - Teacher
async function handleTeacherLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Teacher login successful:', userCredential.user.email);
        
        window.location.href = 'teacher/dashboard.html';
        
    } catch (error) {
        console.error('Teacher login error:', error);
        showError('Email ou senha inválidos');
    }
}

// Event Listeners - Student Form
loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const username = studentUsername.value.trim();
    const password = studentPassword.value;
    
    await handleStudentAuth(username, password);
});

createAccountLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (isRegistrationMode) {
        showLoginMode();
    } else {
        showRegistrationMode();
    }
});

// Event Listeners - Teacher Modal
teacherAccessBtn.addEventListener('click', showTeacherModal);
closeTeacherModal.addEventListener('click', hideTeacherModal);

teacherModal.addEventListener('click', (e) => {
    if (e.target === teacherModal) {
        hideTeacherModal();
    }
});

teacherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('teacherEmail').value;
    const password = document.getElementById('teacherPassword').value;
    
    await handleTeacherLogin(email, password);
});

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname === '/') {
        window.location.href = 'teacher/dashboard.html';
    }
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideTeacherModal();
    }
});

// Form Enter Key Support
studentUsername.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        studentPassword.focus();
    }
});

studentPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Modo padrão: login
    showLoginMode();
    
    // Focus username field
    studentUsername.focus();
    
    console.log('🚀 Teacher Alex Landing Page initialized!');
});
