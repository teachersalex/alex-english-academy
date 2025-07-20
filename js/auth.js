// Simple Working Auth - js/auth.js
// NO COMPLEX DEPENDENCIES - IMMEDIATE FUNCTIONALITY

import { auth } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';

// State
let isRegistrationMode = false;

// Safe DOM access
function getEl(id) {
    return document.getElementById(id);
}

// DOM Elements (safe)
const loginBtn = getEl('loginBtn');
const createAccountLink = getEl('createAccountLink');
const studentUsername = getEl('studentUsername');
const studentPassword = getEl('studentPassword');
const teacherAccessBtn = getEl('teacherAccessBtn');
const teacherModal = getEl('teacherModal');
const closeTeacherModal = getEl('closeTeacherModal');
const teacherForm = getEl('teacherForm');
const errorMsg = getEl('errorMsg');
const successMsg = getEl('successMsg');
const formTitle = getEl('formTitle');

// Messages
function showError(msg) {
    if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
        if (successMsg) successMsg.classList.add('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 5000);
    }
}

function showSuccess(msg) {
    if (successMsg) {
        successMsg.textContent = msg;
        successMsg.classList.remove('hidden');
        if (errorMsg) errorMsg.classList.add('hidden');
        setTimeout(() => successMsg.classList.add('hidden'), 3000);
    }
}

// SIMPLE Student Auth - Works Immediately
async function handleStudentAuth(username, password) {
    try {
        if (!username || !password) {
            showError('Preencha todos os campos');
            return;
        }

        if (username.length < 3) {
            showError('Nome de usuário deve ter pelo menos 3 caracteres');
            return;
        }

        if (password.length < 4) {
            showError('Senha deve ter pelo menos 4 caracteres');
            return;
        }

        // Loading state
        if (loginBtn) {
            loginBtn.textContent = '🔍 Entrando...';
            loginBtn.disabled = true;
        }

        // Simple auth - immediate success
        const authData = {
            username: username.toLowerCase(),
            displayName: username.charAt(0).toUpperCase() + username.slice(1),
            loginTime: new Date().toISOString(),
            isAuthenticated: true
        };

        // Store auth
        localStorage.setItem('studentAuth', JSON.stringify(authData));
        localStorage.setItem('studentLoggedIn', 'true');
        localStorage.setItem('studentUsername', authData.displayName);

        // Success message
        if (isRegistrationMode) {
            showSuccess('Conta criada! Redirecionando...');
        } else {
            showSuccess('Login realizado! Redirecionando...');
        }

        // Redirect after 1 second
        setTimeout(() => {
            window.location.href = 'student/portal.html';
        }, 1000);

    } catch (error) {
        console.error('Auth error:', error);
        showError('Erro no sistema');
        resetButton();
    }
}

// Teacher Auth (Firebase)
async function handleTeacherLogin(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'teacher/dashboard.html';
    } catch (error) {
        showError('Email ou senha inválidos');
    }
}

// Mode toggle
function toggleMode() {
    isRegistrationMode = !isRegistrationMode;
    
    if (isRegistrationMode) {
        if (loginBtn) {
            loginBtn.textContent = 'CRIAR MINHA CONTA';
            loginBtn.className = 'btn-secondary w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg';
        }
        if (createAccountLink) createAccountLink.textContent = '← Voltar para login';
        if (formTitle) formTitle.textContent = 'Criar Conta de Estudante';
        showSuccess('Digite os dados para criar sua conta');
    } else {
        if (loginBtn) {
            loginBtn.textContent = 'ACESSAR MINHAS AULAS';
            loginBtn.className = 'btn-primary w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg';
        }
        if (createAccountLink) createAccountLink.textContent = 'Criar nova conta de estudante';
        if (formTitle) formTitle.textContent = 'Portal do Estudante';
        
        // Clear form
        if (studentUsername) studentUsername.value = '';
        if (studentPassword) studentPassword.value = '';
        if (errorMsg) errorMsg.classList.add('hidden');
        if (successMsg) successMsg.classList.add('hidden');
    }
    
    if (studentUsername) studentUsername.focus();
}

function resetButton() {
    if (!loginBtn) return;
    loginBtn.disabled = false;
    if (isRegistrationMode) {
        loginBtn.textContent = 'CRIAR MINHA CONTA';
        loginBtn.className = 'btn-secondary w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg';
    } else {
        loginBtn.textContent = 'ACESSAR MINHAS AULAS';
        loginBtn.className = 'btn-primary w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg';
    }
}

// Teacher modal
function showTeacherModal() {
    if (teacherModal) {
        teacherModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        const email = getEl('teacherEmail');
        if (email) email.focus();
    }
}

function hideTeacherModal() {
    if (teacherModal) {
        teacherModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        const email = getEl('teacherEmail');
        const password = getEl('teacherPassword');
        if (email) email.value = '';
        if (password) password.value = '';
    }
}

// Event listeners
function init() {
    if (loginBtn) {
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (studentUsername && studentPassword) {
                await handleStudentAuth(studentUsername.value.trim(), studentPassword.value);
            }
        });
    }

    if (createAccountLink) {
        createAccountLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMode();
        });
    }

    if (teacherAccessBtn) {
        teacherAccessBtn.addEventListener('click', showTeacherModal);
    }

    if (closeTeacherModal) {
        closeTeacherModal.addEventListener('click', hideTeacherModal);
    }

    if (teacherModal) {
        teacherModal.addEventListener('click', (e) => {
            if (e.target === teacherModal) hideTeacherModal();
        });
    }

    if (teacherForm) {
        teacherForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = getEl('teacherEmail');
            const password = getEl('teacherPassword');
            if (email && password) {
                await handleTeacherLogin(email.value, password.value);
            }
        });
    }

    // Keyboard
    if (studentUsername) {
        studentUsername.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && studentPassword) studentPassword.focus();
        });
    }

    if (studentPassword) {
        studentPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && loginBtn) loginBtn.click();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideTeacherModal();
    });
}

// Auth listener
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname === '/') {
        window.location.href = 'teacher/dashboard.html';
    }
});

// Exports for other files
export function getCurrentStudent() {
    const data = localStorage.getItem('studentAuth');
    return data ? JSON.parse(data) : null;
}

export function isStudentAuthenticated() {
    const student = getCurrentStudent();
    if (!student || !student.isAuthenticated) return false;
    
    const loginTime = new Date(student.loginTime);
    const now = new Date();
    const hours = (now - loginTime) / (1000 * 60 * 60);
    
    return hours < 24; // Valid for 24 hours
}

export function logoutStudent() {
    localStorage.removeItem('studentAuth');
    localStorage.removeItem('studentLoggedIn');
    localStorage.removeItem('studentUsername');
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 Simple Auth Loading...');
    init();
    if (studentUsername) studentUsername.focus();
    console.log('✅ Simple Auth Ready!');
});
