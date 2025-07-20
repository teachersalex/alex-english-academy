// Firebase Working Auth - js/auth.js
// KEEPS FIREBASE + WORKS IMMEDIATELY

import { auth, db } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { 
    doc, getDoc, setDoc, updateDoc, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

// State
let isRegistrationMode = false;

// Safe DOM access
function getEl(id) {
    return document.getElementById(id);
}

// DOM Elements
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

// Firebase Student Auth - WORKING
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
            loginBtn.textContent = '🔍 Conectando Firebase...';
            loginBtn.disabled = true;
        }

        const cleanUsername = username.toLowerCase().trim();
        const studentRef = doc(db, 'students', cleanUsername);
        
        try {
            const studentDoc = await getDoc(studentRef);
            
            if (studentDoc.exists()) {
                // STUDENT EXISTS - LOGIN
                const studentData = studentDoc.data();
                
                // Simple password check (in production, use proper hashing)
                if (studentData.password !== password) {
                    showError('Senha incorreta');
                    resetButton();
                    return;
                }

                // Update last login
                await updateDoc(studentRef, {
                    lastLogin: serverTimestamp(),
                    isActive: true
                });

                // Store auth locally
                const authData = {
                    username: cleanUsername,
                    displayName: studentData.displayName,
                    loginTime: new Date().toISOString(),
                    isAuthenticated: true
                };

                localStorage.setItem('studentAuth', JSON.stringify(authData));
                localStorage.setItem('studentLoggedIn', 'true');
                localStorage.setItem('studentUsername', studentData.displayName);

                showSuccess('Login realizado! Redirecionando...');
                setTimeout(() => {
                    window.location.href = 'student/portal.html';
                }, 1500);

            } else {
                // NEW STUDENT - CREATE IN FIREBASE
                if (!isRegistrationMode) {
                    showError('Usuário não encontrado. Clique em "Criar nova conta"');
                    resetButton();
                    return;
                }

                // Create student in Firebase
                const newStudentData = {
                    username: cleanUsername,
                    displayName: username.charAt(0).toUpperCase() + username.slice(1),
                    password: password, // In production, hash this
                    email: `${cleanUsername}@academy.com`,
                    level: 1,
                    totalXP: 0,
                    completedLessons: 0,
                    currentStreak: 0,
                    totalStudyTime: 0,
                    joinDate: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                    isActive: true,
                    
                    // Basic lesson progress
                    audioLessons: {
                        'audio-01': { status: 'not-started', score: 0, attempts: 0 },
                        'audio-02': { status: 'not-started', score: 0, attempts: 0 },
                        'audio-03': { status: 'not-started', score: 0, attempts: 0 },
                        'audio-04': { status: 'not-started', score: 0, attempts: 0 },
                        'audio-05': { status: 'not-started', score: 0, attempts: 0 },
                        'audio-06': { status: 'not-started', score: 0, attempts: 0 },
                        'audio-07': { status: 'not-started', score: 0, attempts: 0 },
                        'audio-08': { status: 'not-started', score: 0, attempts: 0 },
                        'audio-09': { status: 'not-started', score: 0, attempts: 0 },
                        'audio-10': { status: 'not-started', score: 0, attempts: 0 }
                    },
                    
                    // Basic achievements
                    achievements: {
                        'first-steps': { unlocked: false },
                        'perfect-score': { unlocked: false, count: 0 },
                        'week-warrior': { unlocked: false },
                        'listening-master': { unlocked: false }
                    }
                };

                await setDoc(studentRef, newStudentData);

                // Store auth locally
                const authData = {
                    username: cleanUsername,
                    displayName: newStudentData.displayName,
                    loginTime: new Date().toISOString(),
                    isAuthenticated: true
                };

                localStorage.setItem('studentAuth', JSON.stringify(authData));
                localStorage.setItem('studentLoggedIn', 'true');
                localStorage.setItem('studentUsername', newStudentData.displayName);

                showSuccess('Conta criada no Firebase! Redirecionando...');
                setTimeout(() => {
                    window.location.href = 'student/portal.html';
                }, 1500);
            }

        } catch (firestoreError) {
            console.error('Firebase error:', firestoreError);
            
            // Fallback to localStorage if Firebase fails
            showError('Firebase offline. Usando modo local...');
            
            const authData = {
                username: cleanUsername,
                displayName: username.charAt(0).toUpperCase() + username.slice(1),
                loginTime: new Date().toISOString(),
                isAuthenticated: true,
                mode: 'offline'
            };

            localStorage.setItem('studentAuth', JSON.stringify(authData));
            localStorage.setItem('studentLoggedIn', 'true');
            localStorage.setItem('studentUsername', authData.displayName);

            setTimeout(() => {
                window.location.href = 'student/portal.html';
            }, 1500);
        }

    } catch (error) {
        console.error('Auth error:', error);
        showError('Erro de conexão. Tente novamente.');
        resetButton();
    }
}

// Teacher Auth (Firebase Email)
async function handleTeacherLogin(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'teacher/dashboard.html';
    } catch (error) {
        showError('Email ou senha inválidos');
        console.error('Teacher auth error:', error);
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
        showSuccess('Digite os dados para criar conta no Firebase');
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
    
    return hours < 24;
}

export function logoutStudent() {
    localStorage.removeItem('studentAuth');
    localStorage.removeItem('studentLoggedIn');
    localStorage.removeItem('studentUsername');
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 Firebase Auth Loading...');
    init();
    if (studentUsername) studentUsername.focus();
    console.log('✅ Firebase Auth Ready - Real Database!');
});
