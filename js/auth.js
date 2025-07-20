// Auth Logic - Teacher Alex English Academy
// Clean & Minimal Version

import { auth } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';

// State
let isRegistrationMode = false;

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const createAccountLink = document.getElementById('createAccountLink');
const studentUsername = document.getElementById('studentUsername');
const studentPassword = document.getElementById('studentPassword');
const teacherAccessBtn = document.getElementById('teacherAccessBtn');
const teacherModal = document.getElementById('teacherModal');
const closeTeacherModal = document.getElementById('closeTeacherModal');
const teacherForm = document.getElementById('teacherForm');
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

// Student Auth
async function handleStudentAuth(username, password) {
    try {
        if (!username || !password) {
            showError('Preencha todos os campos');
            return;
        }

        if (isRegistrationMode) {
            // Registration
            localStorage.setItem('studentLoggedIn', 'true');
            localStorage.setItem('studentUsername', username);
            showSuccess('Conta criada! Redirecionando...');
            setTimeout(() => {
                window.location.href = 'student/portal.html';
            }, 2000);
        } else {
            // Login
            localStorage.setItem('studentLoggedIn', 'true');
            localStorage.setItem('studentUsername', username);
            showSuccess('Login realizado! Bem-vindo!');
            setTimeout(() => {
                window.location.href = 'student/portal.html';
            }, 1500);
        }
    } catch (error) {
        showError('Erro no sistema. Tente novamente.');
    }
}

// Teacher Auth
async function handleTeacherLogin(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'teacher/dashboard.html';
    } catch (error) {
        showError('Email ou senha inválidos');
    }
}

// Mode Toggle
function toggleMode() {
    isRegistrationMode = !isRegistrationMode;
    if (isRegistrationMode) {
        createAccountLink.textContent = '← Voltar para login';
        showSuccess('Modo registro ativado');
    } else {
        createAccountLink.textContent = '✨ Criar nova conta de estudante';
    }
}

// Teacher Modal
function showTeacherModal() {
    teacherModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideTeacherModal() {
    teacherModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Event Listeners
loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleStudentAuth(studentUsername.value.trim(), studentPassword.value);
});

createAccountLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMode();
});

teacherAccessBtn.addEventListener('click', showTeacherModal);
closeTeacherModal.addEventListener('click', hideTeacherModal);

teacherModal.addEventListener('click', (e) => {
    if (e.target === teacherModal) hideTeacherModal();
});

teacherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('teacherEmail').value;
    const password = document.getElementById('teacherPassword').value;
    await handleTeacherLogin(email, password);
});

// Keyboard Navigation
studentUsername.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') studentPassword.focus();
});

studentPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideTeacherModal();
});

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname === '/') {
        window.location.href = 'teacher/dashboard.html';
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    studentUsername.focus();
    console.log('🚀 Auth initialized!');
});
