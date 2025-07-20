// Authentication Logic for Teacher Alex English Academy
// Sophisticated Design System Integration

import { auth } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';

/* ==========================================================================
   STATE MANAGEMENT
   ========================================================================== */

let isRegistrationMode = false;
let isTeacherLoginMode = true;

/* ==========================================================================
   DOM ELEMENT REFERENCES
   ========================================================================== */

// Student Form Elements
const loginBtn = document.getElementById('loginBtn');
const createAccountLink = document.getElementById('createAccountLink');
const studentUsername = document.getElementById('studentUsername');
const studentPassword = document.getElementById('studentPassword');

// Teacher Modal Elements
const teacherAccessBtn = document.getElementById('teacherAccessBtn');
const teacherModal = document.getElementById('teacherModal');
const closeTeacherModal = document.getElementById('closeTeacherModal');
const teacherForm = document.getElementById('teacherForm');

// Message Elements
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');

/* ==========================================================================
   UTILITY FUNCTIONS
   ========================================================================== */

function showMessage(element, message, duration = 5000) {
    element.textContent = message;
    element.classList.remove('hidden');
    element.classList.add('slide-up');
    
    setTimeout(() => {
        element.classList.add('hidden');
        element.classList.remove('slide-up');
    }, duration);
}

function showError(message) {
    hideMessages();
    showMessage(errorMsg, message);
    
    // Add subtle shake animation to form
    const form = document.querySelector('.elegant-card');
    form.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        form.style.animation = '';
    }, 500);
}

function showSuccess(message) {
    hideMessages();
    showMessage(successMsg, message, 3000);
    
    // Add success glow effect
    const form = document.querySelector('.elegant-card');
    form.style.boxShadow = '0 0 30px rgba(34, 197, 94, 0.2)';
    setTimeout(() => {
        form.style.boxShadow = '';
    }, 3000);
}

function hideMessages() {
    errorMsg.classList.add('hidden');
    successMsg.classList.add('hidden');
}

/* ==========================================================================
   STUDENT FORM MANAGEMENT
   ========================================================================== */

function showRegistrationMode() {
    isRegistrationMode = true;
    createAccountLink.innerHTML = '← Voltar para login';
    createAccountLink.classList.add('text-academy-red');
    createAccountLink.classList.remove('text-alex-blue');
    
    // Update input placeholders for registration
    studentUsername.placeholder = 'Escolha seu nome de usuário';
    studentPassword.placeholder = 'Crie uma senha segura';
    
    showSuccess('📝 Modo registro ativado - preencha os dados para criar sua conta');
    
    // Focus on username field
    setTimeout(() => studentUsername.focus(), 100);
}

function showLoginMode() {
    isRegistrationMode = false;
    createAccountLink.innerHTML = '✨ Criar nova conta de estudante';
    createAccountLink.classList.remove('text-academy-red');
    createAccountLink.classList.add('text-alex-blue');
    
    // Reset input placeholders
    studentUsername.placeholder = 'Digite seu nome de usuário';
    studentPassword.placeholder = 'Digite sua senha';
    
    hideMessages();
}

/* ==========================================================================
   TEACHER MODAL MANAGEMENT
   ========================================================================== */

function showTeacherModal() {
    teacherModal.classList.remove('hidden');
    teacherModal.classList.add('fade-in');
    document.body.style.overflow = 'hidden';
    
    // Focus on email field
    setTimeout(() => {
        document.getElementById('teacherEmail').focus();
    }, 100);
}

function hideTeacherModal() {
    teacherModal.classList.add('hidden');
    teacherModal.classList.remove('fade-in');
    document.body.style.overflow = 'auto';
}

/* ==========================================================================
   AUTHENTICATION FUNCTIONS
   ========================================================================== */

async function handleStudentAuth(username, password) {
    try {
        // Input validation
        if (!username || !password) {
            showError('Por favor, preencha todos os campos');
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

        // Add loading state to button
        const originalText = loginBtn.textContent;
        loginBtn.textContent = '⏳ Processando...';
        loginBtn.disabled = true;

        if (isRegistrationMode) {
            // Student Registration Flow
            console.log('Student registration attempt:', username);
            
            // Simulate registration process
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Check if username already exists (simulate)
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            if (existingUsers.includes(username.toLowerCase())) {
                throw new Error('Nome de usuário já existe. Escolha outro.');
            }
            
            // Save new user
            existingUsers.push(username.toLowerCase());
            localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
            localStorage.setItem('studentLoggedIn', 'true');
            localStorage.setItem('studentUsername', username);
            localStorage.setItem('studentRegistrationDate', new Date().toISOString());
            
            showSuccess('🎉 Conta criada com sucesso! Redirecionando para seu portal...');
            
            setTimeout(() => {
                window.location.href = 'student/portal.html';
            }, 2000);
            
        } else {
            // Student Login Flow
            console.log('Student login attempt:', username);
            
            // Simulate login process
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simple validation for demo
            // In production, this would validate against real database
            localStorage.setItem('studentLoggedIn', 'true');
            localStorage.setItem('studentUsername', username);
            localStorage.setItem('lastLoginDate', new Date().toISOString());
            
            showSuccess('✅ Login realizado com sucesso! Bem-vindo de volta!');
            
            setTimeout(() => {
                window.location.href = 'student/portal.html';
            }, 1500);
        }
        
    } catch (error) {
        console.error('Student auth error:', error);
        showError(error.message || 'Erro no sistema. Tente novamente.');
        
        // Reset button
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
    }
}

async function handleTeacherLogin(email, password) {
    try {
        // Add loading state
        const submitBtn = teacherForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '⏳ Entrando...';
        submitBtn.disabled = true;

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Teacher login successful:', userCredential.user.email);
        
        // Redirect to simplified teacher dashboard
        window.location.href = 'teacher/dashboard.html';
        
    } catch (error) {
        console.error('Teacher login error:', error);
        
        let errorMessage = 'Email ou senha inválidos';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Conta não encontrada. Verifique o email.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Senha incorreta. Tente novamente.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Muitas tentativas. Aguarde alguns minutos.';
        }
        
        showError(errorMessage);
        
        // Reset button
        const submitBtn = teacherForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */

// Student Form Events
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

// Teacher Modal Events
teacherAccessBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showTeacherModal();
});

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

/* ==========================================================================
   KEYBOARD INTERACTIONS
   ========================================================================== */

// Enhanced keyboard navigation
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

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key closes modal
    if (e.key === 'Escape') {
        hideTeacherModal();
    }
    
    // Ctrl/Cmd + Enter submits form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!teacherModal.classList.contains('hidden')) {
            teacherForm.dispatchEvent(new Event('submit'));
        } else {
            loginBtn.click();
        }
    }
});

/* ==========================================================================
   FIREBASE AUTH STATE LISTENER
   ========================================================================== */

onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname === '/') {
        // Teacher already logged in, redirect to dashboard
        window.location.href = 'teacher/dashboard.html';
    }
});

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Set initial mode (login)
    showLoginMode();
    
    // Focus on username field
    setTimeout(() => {
        studentUsername.focus();
    }, 100);
    
    // Add CSS animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
    
    console.log('🚀 Teacher Alex Landing Page with Sophisticated Design initialized!');
});

/* ==========================================================================
   FORM VALIDATION HELPERS
   ========================================================================== */

// Real-time validation feedback
studentUsername.addEventListener('input', (e) => {
    const value = e.target.value;
    if (value.length > 0 && value.length < 3) {
        e.target.style.borderColor = 'var(--academy-red)';
    } else if (value.length >= 3) {
        e.target.style.borderColor = 'var(--alex-blue)';
    } else {
        e.target.style.borderColor = 'var(--light-gray)';
    }
});

studentPassword.addEventListener('input', (e) => {
    const value = e.target.value;
    if (value.length > 0 && value.length < 4) {
        e.target.style.borderColor = 'var(--academy-red)';
    } else if (value.length >= 4) {
        e.target.style.borderColor = 'var(--alex-blue)';
    } else {
        e.target.style.borderColor = 'var(--light-gray)';
    }
});

/* ==========================================================================
   ANALYTICS & TRACKING (FOR FUTURE USE)
   ========================================================================== */

function trackUserAction(action, details = {}) {
    // Placeholder for future analytics integration
    console.log(`📊 User Action: ${action}`, details);
    
    // Store in localStorage for now
    const actions = JSON.parse(localStorage.getItem('userActions') || '[]');
    actions.push({
        action,
        details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    });
    
    // Keep only last 100 actions
    if (actions.length > 100) {
        actions.splice(0, actions.length - 100);
    }
    
    localStorage.setItem('userActions', JSON.stringify(actions));
}
