// Teacher Dashboard Logic - Student Management System
// Teacher Alex - English Academy
// FIXED: Email domain duplication and deactivation control

import { auth, db } from './firebase.js';
import { 
    onAuthStateChanged,
    signOut 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { 
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    query,
    orderBy
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

// DOM Elements
const teacherName = document.getElementById('teacherName');
const logoutBtn = document.getElementById('logoutBtn');
const addStudentBtn = document.getElementById('addStudentBtn');
const studentCreationForm = document.getElementById('studentCreationForm');
const createStudentBtn = document.getElementById('createStudentBtn');
const cancelStudentBtn = document.getElementById('cancelStudentBtn');
const managedStudentsList = document.getElementById('managedStudentsList');
const studentsLoading = document.getElementById('studentsLoading');
const studentsEmpty = document.getElementById('studentsEmpty');

// ==========================================================================
// STUDENT MANAGEMENT SYSTEM
// ==========================================================================

let managedStudents = [];

// Show/Hide student creation form
function toggleStudentForm() {
    const isHidden = studentCreationForm.classList.contains('hidden');
    
    if (isHidden) {
        studentCreationForm.classList.remove('hidden');
        document.getElementById('newStudentName').focus();
    } else {
        studentCreationForm.classList.add('hidden');
        clearStudentForm();
    }
}

// Clear student creation form
function clearStudentForm() {
    document.getElementById('newStudentName').value = '';
    document.getElementById('newStudentUsername').value = '';
    document.getElementById('newStudentPassword').value = '';
}

// Load students from Firebase
async function loadStudentsFromFirebase() {
    try {
        studentsLoading.classList.remove('hidden');
        studentsEmpty.classList.add('hidden');
        managedStudentsList.innerHTML = '';

        const studentsRef = collection(db, 'students');
        const studentsQuery = query(studentsRef, orderBy('joinDate', 'desc'));
        const querySnapshot = await getDocs(studentsQuery);
        
        managedStudents = [];
        querySnapshot.forEach((doc) => {
            const studentData = doc.data();
            managedStudents.push({
                id: doc.id,
                name: studentData.displayName || studentData.username,
                username: studentData.username,
                status: studentData.isActive ? 'active' : 'inactive',
                level: studentData.level || 1,
                totalXP: studentData.totalXP || 0,
                completedLessons: calculateCompletedLessons(studentData),
                lastLogin: studentData.lastLoginDate,
                createdDate: studentData.joinDate?.toDate ? 
                    studentData.joinDate.toDate().toLocaleDateString('pt-BR') : 
                    'Data não disponível'
            });
        });

        studentsLoading.classList.add('hidden');
        
        if (managedStudents.length === 0) {
            studentsEmpty.classList.remove('hidden');
        } else {
            renderManagedStudents();
        }

        updateDashboardStats();
        console.log(`✅ Loaded ${managedStudents.length} students from Firebase`);

    } catch (error) {
        console.error('❌ Error loading students:', error);
        studentsLoading.innerHTML = '<div class="text-red-500">❌ Erro ao carregar estudantes</div>';
    }
}

// Calculate completed lessons from student data
function calculateCompletedLessons(studentData) {
    let completed = 0;
    
    // Count Foundation lessons
    if (studentData.audioLessons) {
        completed += Object.values(studentData.audioLessons)
            .filter(lesson => lesson.status === 'completed').length;
    }
    
    // Count Gaming lessons
    if (studentData.gamingLessons) {
        completed += Object.values(studentData.gamingLessons)
            .filter(lesson => lesson.status === 'completed').length;
    }
    
    return completed;
}

// Create new student account
async function createStudentAccount() {
    const name = document.getElementById('newStudentName').value.trim();
    const username = document.getElementById('newStudentUsername').value.trim();
    const password = document.getElementById('newStudentPassword').value;
    
    if (!name || !username || !password) {
        alert('Preencha todos os campos');
        return;
    }
    
    if (username.length < 3) {
        alert('Nome de usuário deve ter pelo menos 3 caracteres');
        return;
    }
    
    if (password.length < 4) {
        alert('Senha deve ter pelo menos 4 caracteres');
        return;
    }
    
    // Check if username already exists
    const existingStudent = managedStudents.find(s => s.username === username.toLowerCase());
    if (existingStudent) {
        alert('Nome de usuário já existe. Escolha outro.');
        return;
    }
    
    try {
        createStudentBtn.textContent = '⏳ Criando...';
        createStudentBtn.disabled = true;

        // FIXED: Clean username and smart email handling
        const cleanUsername = username.toLowerCase().trim();
        const studentRef = doc(db, 'students', cleanUsername);
        
        // FIXED: Smart email handling - don't double-add @academy.com
        const studentEmail = username.includes('@') ? username : `${cleanUsername}@academy.com`;
        
        const newStudentData = {
            username: cleanUsername,
            displayName: name,
            password: password, // In production, hash this
            email: studentEmail, // FIXED: No double domains
            level: 1,
            totalXP: 0,
            completedLessons: 0,
            currentStreak: 0,
            totalStudyTime: 0,
            joinDate: serverTimestamp(),
            lastLoginDate: null,
            isActive: true,
            deactivatedByTeacher: false, // FIXED: New field to distinguish manual vs auto-logout
            createdBy: auth.currentUser?.email || 'teacher',
            
            // Initialize lesson progress
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
            
            // Initialize gaming lessons
            gamingLessons: {
                'gaming-01': { status: 'not-started', score: 0, attempts: 0 },
                'gaming-02': { status: 'not-started', score: 0, attempts: 0 },
                'gaming-03': { status: 'not-started', score: 0, attempts: 0 },
                'gaming-04': { status: 'not-started', score: 0, attempts: 0 },
                'gaming-05': { status: 'not-started', score: 0, attempts: 0 },
                'gaming-06': { status: 'not-started', score: 0, attempts: 0 },
                'gaming-07': { status: 'not-started', score: 0, attempts: 0 },
                'gaming-08': { status: 'not-started', score: 0, attempts: 0 },
                'gaming-09': { status: 'not-started', score: 0, attempts: 0 },
                'gaming-10': { status: 'not-started', score: 0, attempts: 0 }
            },
            
            // Initialize achievements
            achievements: {
                'first-steps': { unlocked: false },
                'perfect-score': { unlocked: false, count: 0 },
                'week-warrior': { unlocked: false },
                'listening-master': { unlocked: false },
                'game-master': { unlocked: false }
            }
        };

        await setDoc(studentRef, newStudentData);
        
        // Show success modal with credentials
        showSuccessModal(cleanUsername, password);
        
        // Refresh students list
        await loadStudentsFromFirebase();
        
        // Reset form
        toggleStudentForm();
        
        console.log('✅ Student account created:', cleanUsername);

    } catch (error) {
        console.error('❌ Error creating student:', error);
        alert('Erro ao criar conta. Tente novamente.');
    } finally {
        createStudentBtn.textContent = '✅ Criar Conta';
        createStudentBtn.disabled = false;
    }
}

// Show success modal with credentials
function showSuccessModal(username, password) {
    document.getElementById('createdUsername').textContent = username;
    document.getElementById('createdPassword').textContent = password;
    document.getElementById('successModal').classList.remove('hidden');
}

// Copy credentials to clipboard
async function copyCredentials() {
    const username = document.getElementById('createdUsername').textContent;
    const password = document.getElementById('createdPassword').textContent;
    const credentials = `Credenciais Teacher Alex English Academy\n\nUsuário: ${username}\nSenha: ${password}\nURL: alex-english-academy.vercel.app\n\nBom estudo!`;
    
    try {
        await navigator.clipboard.writeText(credentials);
        document.getElementById('copyCredentialsBtn').textContent = '✅ Copiado!';
        setTimeout(() => {
            document.getElementById('copyCredentialsBtn').textContent = '📋 Copiar Credenciais';
        }, 2000);
    } catch (error) {
        alert('Erro ao copiar. Copie manualmente as credenciais.');
    }
}

// Render managed students list
function renderManagedStudents() {
    const studentsHTML = managedStudents.map(student => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">${student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                </div>
                <div>
                    <div class="font-medium text-gray-800">${student.name}</div>
                    <div class="text-gray-500 text-sm">@${student.username} • Criado em ${student.createdDate}</div>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <div class="text-center">
                    <div class="text-sm font-semibold text-gray-800">Nível ${student.level}</div>
                    <div class="text-xs text-gray-500">${student.completedLessons}/110 lições</div>
                </div>
                <div class="text-center">
                    <div class="text-sm font-semibold text-blue-600">${student.totalXP.toLocaleString()} XP</div>
                    <div class="text-xs text-gray-500">Experiência</div>
                </div>
                <span class="bg-${student.status === 'active' ? 'green' : 'red'}-100 text-${student.status === 'active' ? 'green' : 'red'}-800 px-2 py-1 rounded text-xs font-medium">
                    ${student.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
                <button onclick="toggleStudentStatus('${student.id}')" class="text-gray-400 hover:text-gray-600 text-sm">
                    ${student.status === 'active' ? '🚫' : '✅'}
                </button>
            </div>
        </div>
    `).join('');
    
    managedStudentsList.innerHTML = studentsHTML;
}

// FIXED: Toggle student status with proper deactivation flag
window.toggleStudentStatus = async function(studentId) {
    const student = managedStudents.find(s => s.id === studentId);
    if (!student) return;

    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'ativar' : 'desativar';
    
    if (confirm(`Tem certeza que deseja ${action} o aluno ${student.name}?`)) {
        try {
            const studentRef = doc(db, 'students', studentId);
            await updateDoc(studentRef, {
                isActive: newStatus === 'active',
                deactivatedByTeacher: newStatus === 'inactive' // FIXED: Set flag when teacher deactivates
            });
            
            // Update local data
            student.status = newStatus;
            renderManagedStudents();
            updateDashboardStats();
            
            console.log(`✅ Student ${action}d:`, student.name);
        } catch (error) {
            console.error('❌ Error updating student status:', error);
            alert('Erro ao atualizar status. Tente novamente.');
        }
    }
};

// Update dashboard statistics
function updateDashboardStats() {
    document.getElementById('totalStudents').textContent = managedStudents.length;
    document.getElementById('activeStudents').textContent = managedStudents.filter(s => s.status === 'active').length;
    
    // Calculate new students this month
    const thisMonth = new Date().getMonth();
    const newThisMonth = managedStudents.filter(student => {
        if (student.createdDate === 'Data não disponível') return false;
        const createdDate = new Date(student.createdDate.split('/').reverse().join('-'));
        return createdDate.getMonth() === thisMonth;
    }).length;
    document.getElementById('newStudentsThisMonth').textContent = newThisMonth;
    
    // Calculate total lessons completed
    const totalCompleted = managedStudents.reduce((sum, student) => sum + student.completedLessons, 0);
    document.getElementById('totalLessonsCompleted').textContent = totalCompleted;
}

// ==========================================================================
// QUICK ACTIONS
// ==========================================================================

// View student portal
function viewPortal() {
    window.open('../student/portal.html', '_blank');
}

// Export students list
function exportStudents() {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Nome,Username,Status,Nível,XP,Lições Completadas,Data de Criação\n"
        + managedStudents.map(s => 
            `"${s.name}","${s.username}","${s.status}",${s.level},${s.totalXP},${s.completedLessons},"${s.createdDate}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `estudantes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Bulk message (placeholder)
function bulkMessage() {
    alert('Funcionalidade de mensagem em massa será implementada em breve.');
}

// Backup data (placeholder)
function backupData() {
    alert('Funcionalidade de backup será implementada em breve.');
}

// ==========================================================================
// AUTH & INITIALIZATION
// ==========================================================================

// Logout Function
async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Erro ao sair. Tente novamente.');
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Event Listeners
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (addStudentBtn) addStudentBtn.addEventListener('click', toggleStudentForm);
    if (createStudentBtn) createStudentBtn.addEventListener('click', createStudentAccount);
    if (cancelStudentBtn) cancelStudentBtn.addEventListener('click', toggleStudentForm);

    // Quick actions
    const viewPortalBtn = document.getElementById('viewPortalBtn');
    const exportStudentsBtn = document.getElementById('exportStudentsBtn');
    const bulkMessageBtn = document.getElementById('bulkMessageBtn');
    const backupDataBtn = document.getElementById('backupDataBtn');
    
    if (viewPortalBtn) viewPortalBtn.addEventListener('click', viewPortal);
    if (exportStudentsBtn) exportStudentsBtn.addEventListener('click', exportStudents);
    if (bulkMessageBtn) bulkMessageBtn.addEventListener('click', bulkMessage);
    if (backupDataBtn) backupDataBtn.addEventListener('click', backupData);

    // Success modal
    const copyCredentialsBtn = document.getElementById('copyCredentialsBtn');
    const closeSuccessModal = document.getElementById('closeSuccessModal');
    
    if (copyCredentialsBtn) copyCredentialsBtn.addEventListener('click', copyCredentials);
    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', () => {
            document.getElementById('successModal').classList.add('hidden');
        });
    }

    // Add visual feedback to quick action buttons
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.add('success-glow');
            setTimeout(() => {
                this.classList.remove('success-glow');
            }, 600);
        });
    });
});

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '../index.html';
        return;
    }
    
    if (teacherName) {
        teacherName.textContent = user.email;
    }
    
    loadStudentsFromFirebase();
    
    console.log('👨‍🏫 Teacher Dashboard initialized for:', user.email);
});

console.log('🎯 Teacher Dashboard with Student Management loaded (Email & Deactivation FIXED)!');
