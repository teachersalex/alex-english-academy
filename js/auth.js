// Enhanced Auth Logic - Teacher Alex English Academy
// CSI ENHANCED: Real Student Firestore Authentication + Existing Teacher Auth

import { auth, db } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { 
    doc, getDoc, setDoc, updateDoc, 
    serverTimestamp, collection, getDocs 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

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
const formTitle = document.getElementById('formTitle');

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

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

// Generate device fingerprint for cross-device tracking
function generateDeviceId() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Alex Academy Device', 2, 2);
    
    const fingerprint = btoa(canvas.toDataURL()).substring(0, 16);
    const timestamp = Date.now().toString(36);
    return `${fingerprint}_${timestamp}`;
}

// Create initial lesson progress structure
function createInitialLessonProgress() {
    const lessons = {};
    for (let i = 1; i <= 10; i++) {
        const lessonId = `audio-${i.toString().padStart(2, '0')}`;
        lessons[lessonId] = {
            status: "not-started",
            score: 0,
            totalQuestions: 5,
            attempts: 0,
            timeSpent: 0
        };
    }
    return lessons;
}

// ========================================================================
// REAL STUDENT FIRESTORE AUTHENTICATION (CSI ENHANCED)
// ========================================================================

async function handleStudentAuth(username, password) {
    try {
        // Input validation
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

        // Show loading state
        loginBtn.textContent = '🔍 Verificando...';
        loginBtn.disabled = true;

        const cleanUsername = username.toLowerCase().trim();
        const studentRef = doc(db, 'students', cleanUsername);
        const studentDoc = await getDoc(studentRef);

        if (studentDoc.exists()) {
            // EXISTING STUDENT - LOGIN
            console.log('🔍 CSI: Student found in database');
            const studentData = studentDoc.data();
            
            // Simple password validation (in production, use proper hashing)
            if (studentData.profile.password !== password) {
                showError('Senha incorreta');
                resetLoginButton();
                return;
            }

            // Update last active session
            await updateStudentSession(cleanUsername, 'login');
            
            // Store authentication locally
            const authData = {
                username: cleanUsername,
                displayName: studentData.profile.displayName,
                loginTime: new Date().toISOString(),
                deviceId: generateDeviceId(),
                isAuthenticated: true
            };
            
            localStorage.setItem('studentAuth', JSON.stringify(authData));
            localStorage.setItem('studentLoggedIn', 'true'); // Keep for existing portal compatibility
            localStorage.setItem('studentUsername', studentData.profile.displayName);

            showSuccess('Login realizado com sucesso! Redirecionando...');
            
            setTimeout(() => {
                window.location.href = 'student/portal.html';
            }, 1500);

        } else {
            // NEW STUDENT - REGISTRATION
            if (!isRegistrationMode) {
                showError('Usuário não encontrado. Clique em "Criar nova conta"');
                resetLoginButton();
                return;
            }

            console.log('🔍 CSI: Creating new student profile');
            const newStudentData = await createStudentProfile(cleanUsername, password);
            
            if (newStudentData) {
                showSuccess('Conta criada com sucesso! Redirecionando...');
                
                setTimeout(() => {
                    window.location.href = 'student/portal.html';
                }, 1500);
            } else {
                showError('Erro ao criar conta. Tente novamente.');
                resetLoginButton();
            }
        }

    } catch (error) {
        console.error('❌ Student auth error:', error);
        showError('Erro de conexão. Verifique sua internet.');
        resetLoginButton();
    }
}

// Create comprehensive student profile in Firestore
async function createStudentProfile(username, password) {
    try {
        const deviceId = generateDeviceId();
        const now = serverTimestamp();
        
        const studentData = {
            profile: {
                username: username,
                displayName: username.charAt(0).toUpperCase() + username.slice(1),
                email: `${username}@academy.com`,
                password: password, // In production, hash this properly
                level: 1,
                totalXP: 0,
                currentStreak: 0,
                longestStreak: 0,
                joinDate: now,
                lastActiveDate: now,
                isActive: true,
                deviceIds: [deviceId]
            },
            
            audioLessons: createInitialLessonProgress(),
            
            achievements: {
                "first-steps": { 
                    unlocked: false, 
                    progress: 0, 
                    maxProgress: 1,
                    xpReward: 100
                },
                "perfect-score": { 
                    unlocked: false, 
                    count: 0,
                    xpReward: 25
                },
                "week-warrior": { 
                    unlocked: false, 
                    progress: 0, 
                    maxProgress: 7,
                    xpReward: 150
                },
                "listening-master": { 
                    unlocked: false, 
                    progress: 0, 
                    maxProgress: 10,
                    xpReward: 200
                }
            },
            
            sessions: {
                currentSession: {
                    deviceId: deviceId,
                    startTime: now,
                    lastActivityTime: now,
                    lessonId: null,
                    questionIndex: 0,
                    isActive: true
                },
                totalStudyTime: 0,
                sessionHistory: []
            }
        };

        const studentRef = doc(db, 'students', username);
        await setDoc(studentRef, studentData);
        
        // Store authentication locally
        const authData = {
            username: username,
            displayName: studentData.profile.displayName,
            loginTime: new Date().toISOString(),
            deviceId: deviceId,
            isAuthenticated: true
        };
        
        localStorage.setItem('studentAuth', JSON.stringify(authData));
        localStorage.setItem('studentLoggedIn', 'true'); // Keep for existing portal compatibility
        localStorage.setItem('studentUsername', studentData.profile.displayName);

        console.log('✅ CSI: Student profile created successfully');
        return studentData;

    } catch (error) {
        console.error('❌ Error creating student profile:', error);
        return null;
    }
}

// Update student session activity
async function updateStudentSession(username, action, data = {}) {
    try {
        const studentRef = doc(db, 'students', username);
        const updateData = {
            'profile.lastActiveDate': serverTimestamp(),
            'sessions.currentSession.lastActivityTime': serverTimestamp()
        };

        if (action === 'login') {
            updateData['sessions.currentSession.isActive'] = true;
            updateData['sessions.currentSession.deviceId'] = generateDeviceId();
        } else if (action === 'logout') {
            updateData['sessions.currentSession.isActive'] = false;
        }

        await updateDoc(studentRef, updateData);
        console.log('✅ CSI: Session updated for', username);

    } catch (error) {
        console.error('❌ Session update error:', error);
    }
}

// Reset login button state
function resetLoginButton() {
    if (isRegistrationMode) {
        loginBtn.textContent = 'CRIAR MINHA CONTA';
        loginBtn.className = 'btn-secondary w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg';
    } else {
        loginBtn.textContent = 'ACESSAR MINHAS AULAS';
        loginBtn.className = 'btn-primary w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg';
    }
    loginBtn.disabled = false;
}

// ========================================================================
// TEACHER AUTHENTICATION (UNCHANGED - ALREADY PERFECT)
// ========================================================================

async function handleTeacherLogin(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'teacher/dashboard.html';
    } catch (error) {
        showError('Email ou senha inválidos');
        console.error('Teacher auth error:', error);
    }
}

// ========================================================================
// MODE TOGGLE - ENHANCED VISUAL FEEDBACK
// ========================================================================

function toggleMode() {
    isRegistrationMode = !isRegistrationMode;
    
    if (isRegistrationMode) {
        // Registration Mode - Blue Button
        loginBtn.textContent = 'CRIAR MINHA CONTA';
        loginBtn.className = 'btn-secondary w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg';
        createAccountLink.textContent = '← Voltar para login';
        formTitle.textContent = 'Criar Conta de Estudante';
        showSuccess('Preencha os dados para criar sua conta');
        errorMsg.classList.add('hidden');
        
    } else {
        // Login Mode - Red Button
        loginBtn.textContent = 'ACESSAR MINHAS AULAS';
        loginBtn.className = 'btn-primary w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg';
        createAccountLink.textContent = 'Criar nova conta de estudante';
        formTitle.textContent = 'Portal do Estudante';
        
        studentUsername.value = '';
        studentPassword.value = '';
        errorMsg.classList.add('hidden');
        successMsg.classList.add('hidden');
    }
    
    studentUsername.focus();
}

// ========================================================================
// TEACHER MODAL (UNCHANGED)
// ========================================================================

function showTeacherModal() {
    teacherModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.getElementById('teacherEmail').focus();
}

function hideTeacherModal() {
    teacherModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    document.getElementById('teacherEmail').value = '';
    document.getElementById('teacherPassword').value = '';
}

// ========================================================================
// EVENT LISTENERS
// ========================================================================

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
    if (e.key === 'Enter') studentPassword.focus();
});

studentPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideTeacherModal();
});

// ========================================================================
// AUTH STATE LISTENER (TEACHER ONLY)
// ========================================================================

onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname === '/') {
        window.location.href = 'teacher/dashboard.html';
    }
});

// ========================================================================
// INITIALIZE
// ========================================================================

document.addEventListener('DOMContentLoaded', () => {
    studentUsername.focus();
    console.log('🔥 Enhanced CSI Auth System Initialized!');
    console.log('👥 Teacher Auth: Firebase (Production Ready)');
    console.log('🎓 Student Auth: Firestore (Real Database)');
});

// ========================================================================
// UTILITY EXPORTS FOR OTHER MODULES
// ========================================================================

// Get current authenticated student
export function getCurrentStudent() {
    const authData = localStorage.getItem('studentAuth');
    return authData ? JSON.parse(authData) : null;
}

// Check if student is authenticated
export function isStudentAuthenticated() {
    const currentStudent = getCurrentStudent();
    if (!currentStudent || !currentStudent.isAuthenticated) return false;
    
    // Check if login is still valid (24 hours)
    const loginTime = new Date(currentStudent.loginTime);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    
    return hoursDiff < 24;
}

// Logout student
export async function logoutStudent() {
    const currentStudent = getCurrentStudent();
    if (currentStudent) {
        await updateStudentSession(currentStudent.username, 'logout');
        localStorage.removeItem('studentAuth');
        localStorage.removeItem('studentLoggedIn');
        localStorage.removeItem('studentUsername');
    }
}
