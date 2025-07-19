// Teacher Dashboard Logic
// Teacher Alex - English Academy

import { auth, db } from '../js/firebase.js';
import { 
    onAuthStateChanged,
    signOut 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { 
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

// DOM Elements
const teacherName = document.getElementById('teacherName');
const logoutBtn = document.getElementById('logoutBtn');
const totalStudents = document.getElementById('totalStudents');
const totalHours = document.getElementById('totalHours');
const avgLevel = document.getElementById('avgLevel');
const activeStreaks = document.getElementById('activeStreaks');
const studentsList = document.getElementById('studentsList');

// Sample student data (will be replaced with Firebase data)
const sampleStudents = [
    {
        id: 'student1',
        name: 'João Silva',
        initials: 'JS',
        email: 'joao@email.com',
        level: 6,
        totalXP: 1250,
        timeStudied: 45 * 3600, // 45 hours in seconds
        currentStreak: 15,
        progress: 75,
        achievements: ['Week Warrior', 'Grammar Master'],
        bgColor: 'bg-blue-500',
        lastActive: new Date()
    },
    {
        id: 'student2',
        name: 'Maria Santos',
        initials: 'MS',
        email: 'maria@email.com',
        level: 4,
        totalXP: 890,
        timeStudied: 28 * 3600,
        currentStreak: 8,
        progress: 45,
        achievements: ['Vocabulary Builder'],
        bgColor: 'bg-red-500',
        lastActive: new Date()
    },
    {
        id: 'student3',
        name: 'Pedro Costa',
        initials: 'PC',
        email: 'pedro@email.com',
        level: 8,
        totalXP: 2100,
        timeStudied: 67 * 3600,
        currentStreak: 22,
        progress: 85,
        achievements: ['Conversation Expert', 'Speed Reader'],
        bgColor: 'bg-green-500',
        lastActive: new Date()
    },
    {
        id: 'student4',
        name: 'Ana Lima',
        initials: 'AL',
        email: 'ana@email.com',
        level: 3,
        totalXP: 650,
        timeStudied: 22 * 3600,
        currentStreak: 5,
        progress: 30,
        achievements: ['First Steps'],
        bgColor: 'bg-purple-500',
        lastActive: new Date()
    }
];

// Utility Functions
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
}

function getAchievementColor(achievement) {
    const colors = {
        'Week Warrior': 'bg-yellow-500/20 text-yellow-300',
        'Grammar Master': 'bg-purple-500/20 text-purple-300',
        'Vocabulary Builder': 'bg-blue-500/20 text-blue-300',
        'Conversation Expert': 'bg-purple-500/20 text-purple-300',
        'Speed Reader': 'bg-orange-500/20 text-orange-300',
        'First Steps': 'bg-green-500/20 text-green-300'
    };
    return colors[achievement] || 'bg-gray-500/20 text-gray-300';
}

function getAchievementIcon(achievement) {
    const icons = {
        'Week Warrior': '🏆',
        'Grammar Master': '🔥',
        'Vocabulary Builder': '📚',
        'Conversation Expert': '🎯',
        'Speed Reader': '🚀',
        'First Steps': '🌟'
    };
    return icons[achievement] || '⭐';
}

// Dashboard Functions
function calculateStats(students) {
    const totalStudentsCount = students.length;
    const totalHoursCount = students.reduce((sum, student) => sum + (student.timeStudied / 3600), 0);
    const avgLevelCount = students.reduce((sum, student) => sum + student.level, 0) / students.length;
    const activeStreaksCount = students.filter(student => student.currentStreak > 0).length;

    return {
        totalStudents: totalStudentsCount,
        totalHours: Math.round(totalHoursCount),
        avgLevel: avgLevelCount.toFixed(1),
        activeStreaks: activeStreaksCount
    };
}

function updateStats(students) {
    const stats = calculateStats(students);
    
    totalStudents.textContent = stats.totalStudents;
    totalHours.textContent = stats.totalHours;
    avgLevel.textContent = stats.avgLevel;
    activeStreaks.textContent = stats.activeStreaks;
}

function renderStudent(student) {
    return `
        <div class="student-card bg-white/10 rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 ${student.bgColor} rounded-full flex items-center justify-center">
                        <span class="text-white font-semibold">${student.initials}</span>
                    </div>
                    <div>
                        <div class="text-white font-medium">${student.name}</div>
                        <div class="text-blue-200 text-sm">Level ${student.level} • ${formatTime(student.timeStudied)} studied</div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="streak-counter ${student.currentStreak > 10 ? 'active' : ''} bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                        ${student.currentStreak}-day streak
                    </span>
                    <span class="xp-counter text-yellow-400">⭐ ${student.totalXP.toLocaleString()} XP</span>
                </div>
            </div>
            
            <!-- Progress Bar -->
            <div class="mb-3">
                <div class="flex justify-between text-sm text-blue-200 mb-1">
                    <span>Progress to Level ${student.level + 1}</span>
                    <span>${student.progress}%</span>
                </div>
                <div class="level-indicator w-full bg-white/20 rounded-full h-2">
                    <div class="progress-bar bg-blue-500 h-2 rounded-full" style="width: ${student.progress}%"></div>
                </div>
            </div>
            
            <!-- Achievements -->
            <div class="flex items-center space-x-2 flex-wrap">
                <span class="text-blue-200 text-sm">Recent:</span>
                ${student.achievements.map(achievement => `
                    <span class="achievement-badge ${getAchievementColor(achievement)} px-2 py-1 rounded text-xs">
                        ${getAchievementIcon(achievement)} ${achievement}
                    </span>
                `).join('')}
            </div>
        </div>
    `;
}

function renderStudents(students) {
    const studentsHTML = students.map(student => renderStudent(student)).join('');
    studentsList.innerHTML = studentsHTML;
}

// Authentication Functions
async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Event Listeners
logoutBtn.addEventListener('click', handleLogout);

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // User not logged in, redirect to landing
        window.location.href = '../index.html';
        return;
    }
    
    // User is logged in
    teacherName.textContent = user.email;
    
    // Load dashboard data
    loadDashboardData();
});

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // For now, use sample data
        // TODO: Replace with actual Firestore queries
        
        updateStats(sampleStudents);
        renderStudents(sampleStudents);
        
        console.log('📊 Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Teacher Dashboard initialized!');
    
    // Add some visual feedback to quick action buttons
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.add('success-glow');
            setTimeout(() => {
                this.classList.remove('success-glow');
            }, 600);
        });
    });
});

// Auto-refresh data every 5 minutes
setInterval(() => {
    if (auth.currentUser) {
        loadDashboardData();
        console.log('🔄 Dashboard data refreshed');
    }
}, 5 * 60 * 1000);