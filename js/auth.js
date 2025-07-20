// Enhanced Auth Logic - Teacher Alex English Academy
// CSI ENHANCED: Real Student Firestore Authentication + Safe DOM Access

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

// ========================================================================
// SAFE DOM ELEMENT ACCESS
// ========================================================================

function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`⚠️ Element with ID '${id}' not found`);
    }
    return element;
}

// DOM Elements - Safe Access
const loginBtn = safeGetElement('loginBtn');
const createAccountLink = safeGetElement('createAccountLink');
const studentUsername = safeGetElement('studentUsername');
const studentPassword = safeGetElement('studentPassword');
const teacherAccessBtn = safeGetElement('teacherAccessBtn');
const teacherModal = safeGetElement('teacherModal');
const closeTeacherModal = safeGetElement('closeTeacherModal');
const teacherForm = safeGetElement('teacherForm');
const errorMsg = safeGetElement('errorMsg');
const successMsg = safeGetElement('successMsg');
const formTitle = safeGetElement('formTitle');

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

function showError(message) {
    if (!errorMsg || !successMsg) return;
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    successMsg.classList.add('hidden');
    setTimeout(() => errorMsg.classList.add('hidden'), 5000);
}

function showSuccess(message) {
    if (!successMsg || !errorMsg) return;
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
        if (loginBtn) {
            loginBtn.textContent = '🔍 Verificando...';
            loginBtn.disabled = true;
        }

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
    if (!loginBtn) return;
    
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
        if (loginBtn) {
            loginBtn.textContent = 'CRIAR MINHA CONTA';
            loginBtn.className = 'btn-secondary w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg';
        }
        if (createAccountLink) createAccountLink.textContent = '← Voltar para login';
        if (formTitle) formTitle.textContent = 'Criar Conta de Estudante';
        showSuccess('Preencha os dados para criar sua conta');
        if (errorMsg) errorMsg.classList.add('hidden');
        
    } else {
        // Login Mode - Red Button
        if (loginBtn) {
            loginBtn.textContent = 'ACESSAR MINHAS AULAS';
            loginBtn.className = 'btn-primary w-full text-white font-bold py-4 rounded-xl text-lg shadow-lg';
        }
        if (createAccountLink) createAccountLink.textContent = 'Criar nova conta de estudante';
        if (formTitle) formTitle.textContent = 'Portal do Estudante';
        
        if (studentUsername) studentUsername.value = '';
        if (studentPassword) studentPassword.value = '';
        if (errorMsg) errorMsg.classList.add('hidden');
        if (successMsg) successMsg.classList.add('hidden');
    }
    
    if (studentUsername) studentUsername.focus();
}

// ========================================================================
// TEACHER MODAL (SAFE ACCESS)
// ========================================================================

function showTeacherModal() {
    if (!teacherModal) return;
    teacherModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    const teacherEmail = safeGetElement('teacherEmail');
    if (teacherEmail) teacherEmail.focus();
}

function hideTeacherModal() {
    if (!teacherModal) return;
    teacherModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    const teacherEmail = safeGetElement('teacherEmail');
    const teacherPassword = safeGetElement('teacherPassword');
    if (teacherEmail) teacherEmail.value = '';
    if (teacherPassword) teacherPassword.value = '';
}

// ========================================================================
// SAFE EVENT LISTENERS
// ========================================================================

function initializeEventListeners() {
    // Login button
    if (loginBtn) {
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (studentUsername && studentPassword) {
                await handleStudentAuth(studentUsername.value.trim(), studentPassword.value);
            }
        });
    }

    // Create account link
    if (createAccountLink) {
        createAccountLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMode();
        });
    }

    // Teacher access
    if (teacherAccessBtn) {
        teacherAccessBtn.addEventListener('click', showTeacherModal);
    }

    // Teacher modal close
    if (closeTeacherModal) {
        closeTeacherModal.addEventListener('click', hideTeacherModal);
    }

    // Teacher modal background click
    if (teacherModal) {
        teacherModal.addEventListener('click', (e) => {
            if (e.target === teacherModal) hideTeacherModal();
        });
    }

    // Teacher form
    if (teacherForm) {
        teacherForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const teacherEmail = safeGetElement('teacherEmail');
            const teacherPassword = safeGetElement('teacherPassword');
            if (teacherEmail && teacherPassword) {
                await handleTeacherLogin(teacherEmail.value, teacherPassword.value);
            }
        });
    }

    // Enhanced Keyboard Navigation
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

    // Global escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideTeacherModal();
    });

    console.log('✅ Event listeners initialized safely');
}

// ========================================================================
// AUTH STATE LISTENER (TEACHER ONLY)
// ========================================================================

onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname === '/') {
        window.location.href = 'teacher/dashboard.html';
    }
});

// ========================================================================
// SAFE INITIALIZE
// ========================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 Enhanced CSI Auth System Initializing...');
    
    // Initialize event listeners safely
    initializeEventListeners();
    
    // Focus on username if available
    if (studentUsername) {
        studentUsername.focus();
    }
    
    console.log('✅ Enhanced CSI Auth System Initialized!');
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
