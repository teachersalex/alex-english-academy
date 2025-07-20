// Auth Logic - Teacher Alex English Academy
// Clean & Professional Account Creation

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
const formTitle = document.querySelector('h3'); // "Portal do Estudante"

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

// Student Auth - Clean Logic
async function handleStudentAuth(username, password) {
    try {
        if (!username || !password) {
            showError('Preencha todos os campos');
            return;
        }

        // Validate minimum requirements
        if (username.length < 3) {
            showError('Nome de usuário deve ter pelo menos 3 caracteres');
            return;
        }

        if (password.length < 4) {
            showError('Senha deve ter pelo menos 4 caracteres');
            return;
        }

        if (isRegistrationMode) {
            // Registration Process
            showSuccess('Conta criada com sucesso! Redirecionando...');
            setTimeout(() => {
                localStorage.setItem('studentLoggedIn', 'true');
                localStorage.setItem('studentUsername', username);
                window.location.href = 'student/portal.html';
            }, 1500);
        } else {
            // Login Process
            localStorage.setItem('studentLoggedIn', 'true');
            localStorage.setItem('studentUsername', username);
            window.location.href = 'student/portal.html';
        }
    } catch (error) {
        showError('Erro no sistema. Tente novamente.');
        console.error('Student auth error:', error);
    }
}

// Teacher Auth
async function handleTeacherLogin(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'teacher/dashboard.html';
    } catch (error) {
        showError('Email ou senha inválidos');
        console.error('Teacher auth error:', error);
    }
}

// Mode Toggle - Clean UX
function toggleMode() {
    isRegistrationMode = !isRegistrationMode;
    
    if (isRegistrationMode) {
        // Switch to Registration Mode
        loginBtn.textContent = 'CRIAR MINHA CONTA';
        createAccountLink.textContent = 'Voltar para login';
        formTitle.textContent = 'Criar Conta de Estudante';
        showSuccess('Preencha os dados para criar sua conta');
        
        // Clear any previous errors
        errorMsg.classList.add('hidden');
        
    } else {
        // Switch to Login Mode
        loginBtn.textContent = 'ACESSAR MINHAS AULAS';
        createAccountLink.textContent = 'Criar nova conta de estudante';
        formTitle.textContent = 'Portal do Estudante';
        
        // Clear form
        studentUsername.value = '';
        studentPassword.value = '';
        errorMsg.classList.add('hidden');
        successMsg.classList.add('hidden');
    }
    
    // Focus on username field
    studentUsername.focus();
}

// Teacher Modal
function showTeacherModal() {
    teacherModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.getElementById('teacherEmail').focus();
}

function hideTeacherModal() {
    teacherModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Clear teacher form
    document.getElementById('teacherEmail').value = '';
    document.getElementById('teacherPassword').value = '';
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

// Enhanced Keyboard Navigation
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

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideTeacherModal();
    }
});

// Input Validation Visual Feedback
studentUsername.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value.length > 0 && value.length < 3) {
        e.target.style.borderColor = '#ef4444';
    } else {
        e.target.style.borderColor = '#e5e7eb';
    }
});

studentPassword.addEventListener('input', (e) => {
    const value = e.target.value;
    if (value.length > 0 && value.length < 4) {
        e.target.style.borderColor = '#ef4444';
    } else {
        e.target.style.borderColor = '#e5e7eb';
    }
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
    console.log('🚀 Clean auth system initialized!');
});
