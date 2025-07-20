/**
 * Cloud-Based Achievement System - Teacher Alex English Academy
 * Handles achievement unlocking, progress tracking, and cross-device sync
 */

import { db } from './firebase.js';
import { doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
import { getCurrentStudent } from './auth.js';
import { updateStudentStats } from './progress-sync.js';

// ========================================================================
// ACHIEVEMENT DEFINITIONS
// ========================================================================

const ACHIEVEMENTS = {
    "first-steps": {
        id: "first-steps",
        name: "First Steps",
        description: "Complete your first audio lesson",
        icon: "🌟",
        xpReward: 100,
        type: "lesson_completion",
        requirement: 1,
        color: "bg-green-500/20 text-green-300"
    },
    "perfect-score": {
        id: "perfect-score", 
        name: "Perfect Score",
        description: "Get 100% on any audio lesson",
        icon: "🎯",
        xpReward: 25,
        type: "perfect_score",
        requirement: 1,
        repeatable: true,
        color: "bg-yellow-500/20 text-yellow-300"
    },
    "week-warrior": {
        id: "week-warrior",
        name: "Week Warrior", 
        description: "Study for 7 consecutive days",
        icon: "🏆",
        xpReward: 150,
        type: "streak",
        requirement: 7,
        color: "bg-purple-500/20 text-purple-300"
    },
    "listening-master": {
        id: "listening-master",
        name: "Listening Master",
        description: "Complete all 10 audio lessons",
        icon: "🎧",
        xpReward: 200,
        type: "lesson_completion", 
        requirement: 10,
        color: "bg-blue-500/20 text-blue-300"
    },
    "speed-learner": {
        id: "speed-learner",
        name: "Speed Learner",
        description: "Complete 3 lessons in one day",
        icon: "⚡",
        xpReward: 75,
        type: "daily_completion",
        requirement: 3,
        color: "bg-orange-500/20 text-orange-300"
    },
    "accuracy-master": {
        id: "accuracy-master",
        name: "Accuracy Master",
        description: "Get 80%+ on 5 different lessons",
        icon: "🔥",
        xpReward: 120,
        type: "accuracy",
        requirement: 5,
        color: "bg-red-500/20 text-red-300"
    }
};

// ========================================================================
// ACHIEVEMENT CHECKING LOGIC
// ========================================================================

// Main function to check and process achievements after lesson completion
export async function checkAchievements(lessonData, studentData = null) {
    try {
        const currentStudent = getCurrentStudent();
        if (!currentStudent) return { newAchievements: [], totalXPFromAchievements: 0 };

        // Get current student data if not provided
        if (!studentData) {
            const studentRef = doc(db, 'students', currentStudent.username);
            const studentDoc = await getDoc(studentRef);
            
            if (!studentDoc.exists()) {
                throw new Error('Student document not found');
            }
            studentData = studentDoc.data();
        }

        const newAchievements = [];

        // Check all achievement types
        await checkFirstSteps(studentData, newAchievements);
        
        if (lessonData && lessonData.score === lessonData.totalQuestions) {
            await checkPerfectScore(studentData, newAchievements);
        }
        
        await checkListeningMaster(studentData, newAchievements);
        await checkAccuracyMaster(studentData, newAchievements);
        await checkSpeedLearner(studentData, newAchievements);
        
        // Save new achievements to Firestore
        if (newAchievements.length > 0) {
            await saveNewAchievements(newAchievements);
        }

        const totalXPFromAchievements = newAchievements.reduce(
            (total, ach) => total + ach.xpReward, 0
        );

        console.log(`🏆 Achievement check complete: ${newAchievements.length} new achievements`);
        return { newAchievements, totalXPFromAchievements };

    } catch (error) {
        console.error('❌ Error checking achievements:', error);
        return { newAchievements: [], totalXPFromAchievements: 0, error: error.message };
    }
}

// ========================================================================
// INDIVIDUAL ACHIEVEMENT CHECKS
// ========================================================================

// Check First Steps achievement
async function checkFirstSteps(studentData, newAchievements) {
    const achievement = studentData.achievements?.["first-steps"];
    
    if (achievement && achievement.unlocked) return;

    // Count completed lessons
    const audioLessons = studentData.audioLessons || {};
    const completedCount = Object.values(audioLessons).filter(
        lesson => lesson.status === 'completed'
    ).length;

    if (completedCount >= 1) {
        newAchievements.push({
            ...ACHIEVEMENTS["first-steps"],
            progress: { count: completedCount }
        });
        console.log('🌟 First Steps achievement unlocked!');
    }
}

// Check Perfect Score achievement
async function checkPerfectScore(studentData, newAchievements) {
    const achievement = studentData.achievements?.["perfect-score"];
    const currentCount = achievement?.count || 0;

    newAchievements.push({
        ...ACHIEVEMENTS["perfect-score"],
        progress: { count: currentCount + 1 }
    });
    console.log('🎯 Perfect Score achievement unlocked!');
}

// Check Listening Master achievement
async function checkListeningMaster(studentData, newAchievements) {
    const achievement = studentData.achievements?.["listening-master"];
    
    if (achievement && achievement.unlocked) return;

    const audioLessons = studentData.audioLessons || {};
    const completedCount = Object.values(audioLessons).filter(
        lesson => lesson.status === 'completed'
    ).length;

    if (completedCount >= 10) {
        newAchievements.push({
            ...ACHIEVEMENTS["listening-master"],
            progress: { count: completedCount }
        });
        console.log('🎧 Listening Master achievement unlocked!');
    }
}

// Check Accuracy Master achievement
async function checkAccuracyMaster(studentData, newAchievements) {
    const achievement = studentData.achievements?.["accuracy-master"];
    
    if (achievement && achievement.unlocked) return;

    const audioLessons = studentData.audioLessons || {};
    const highAccuracyCount = Object.values(audioLessons).filter(lesson => {
        if (lesson.status === 'completed' && lesson.score && lesson.totalQuestions) {
            const percentage = (lesson.score / lesson.totalQuestions) * 100;
            return percentage >= 80;
        }
        return false;
    }).length;

    if (highAccuracyCount >= 5) {
        newAchievements.push({
            ...ACHIEVEMENTS["accuracy-master"],
            progress: { count: highAccuracyCount }
        });
        console.log('🔥 Accuracy Master achievement unlocked!');
    }
}

// Check Speed Learner achievement (3 lessons in one day)
async function checkSpeedLearner(studentData, newAchievements) {
    const achievement = studentData.achievements?.["speed-learner"];
    
    if (achievement && achievement.unlocked) return;

    const audioLessons = studentData.audioLessons || {};
    const today = new Date().toDateString();
    
    const todayCompletions = Object.values(audioLessons).filter(lesson => {
        if (lesson.status === 'completed' && lesson.completedAt) {
            const lessonDate = lesson.completedAt.toDate ? 
                lesson.completedAt.toDate().toDateString() : 
                new Date(lesson.completedAt).toDateString();
            return lessonDate === today;
        }
        return false;
    }).length;

    if (todayCompletions >= 3) {
        newAchievements.push({
            ...ACHIEVEMENTS["speed-learner"],
            progress: { count: todayCompletions }
        });
        console.log('⚡ Speed Learner achievement unlocked!');
    }
}

// ========================================================================
// ACHIEVEMENT PERSISTENCE
// ========================================================================

// Save new achievements to Firestore
async function saveNewAchievements(newAchievements) {
    try {
        const currentStudent = getCurrentStudent();
        if (!currentStudent) return;

        const studentRef = doc(db, 'students', currentStudent.username);
        const updateData = {};
        
        newAchievements.forEach(achievement => {
            if (achievement.repeatable) {
                // For repeatable achievements, increment count
                updateData[`achievements.${achievement.id}.count`] = achievement.progress.count;
                updateData[`achievements.${achievement.id}.lastUnlockedAt`] = serverTimestamp();
            } else {
                // For one-time achievements, set as unlocked
                updateData[`achievements.${achievement.id}`] = {
                    unlocked: true,
                    unlockedAt: serverTimestamp(),
                    xpAwarded: achievement.xpReward,
                    ...achievement.progress
                };
            }
        });

        await updateDoc(studentRef, updateData);
        console.log(`✅ ${newAchievements.length} achievements saved to Firestore`);

    } catch (error) {
        console.error('❌ Error saving achievements:', error);
    }
}

// ========================================================================
// ACHIEVEMENT UI COMPONENTS
// ========================================================================

// Show achievement unlock popup
export function showAchievementPopup(achievement, callback) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    overlay.style.animation = 'fadeIn 0.3s ease-out';
    
    // Create popup
    const popup = document.createElement('div');
    popup.className = 'elegant-card rounded-2xl p-6 max-w-sm mx-auto transform';
    popup.style.animation = 'slideUp 0.4s ease-out';
    
    popup.innerHTML = `
        <div class="text-center">
            <div class="text-6xl mb-4 animate-bounce">${achievement.icon}</div>
            <h3 class="text-xl font-bold text-charcoal mb-2">🎉 Achievement Unlocked!</h3>
            <h4 class="text-lg font-semibold text-academy-red mb-2">${achievement.name}</h4>
            <p class="text-medium-gray mb-4">${achievement.description}</p>
            <div class="bg-powder-blue rounded-lg p-3 mb-4">
                <div class="text-2xl font-bold text-alex-blue">+${achievement.xpReward} XP</div>
                <div class="text-sm text-medium-gray">Experience Points Earned</div>
            </div>
            <button id="achievementContinue" class="btn-primary w-full py-3 rounded-lg font-semibold">
                🚀 Continue Learning
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';

    // Add animations
    addAnimationStyles();

    // Handle continue button
    const continueBtn = popup.querySelector('#achievementContinue');
    continueBtn.addEventListener('click', () => {
        closeAchievementPopup(overlay, popup, callback);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeAchievementPopup(overlay, popup, callback);
        }
    });

    // Auto-close after 10 seconds
    setTimeout(() => {
        if (document.body.contains(overlay)) {
            closeAchievementPopup(overlay, popup, callback);
        }
    }, 10000);
}

// Close achievement popup
function closeAchievementPopup(overlay, popup, callback) {
    overlay.style.animation = 'fadeOut 0.3s ease-out';
    popup.style.animation = 'slideDown 0.3s ease-out';
    
    setTimeout(() => {
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
        if (document.body.contains(popup)) document.body.removeChild(popup);
        document.body.style.overflow = 'auto';
        
        if (callback) callback();
    }, 300);
}

// Show lesson completion results with achievements
export function showLessonResults(lessonData, achievements, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    
    const popup = document.createElement('div');
    popup.className = 'elegant-card rounded-2xl p-6 max-w-md mx-auto';
    
    const scorePercentage = Math.round((lessonData.score / lessonData.totalQuestions) * 100);
    const isPerfect = scorePercentage === 100;
    const isGood = scorePercentage >= 80;
    
    const resultIcon = isPerfect ? '🏆' : isGood ? '🎯' : '📝';
    const resultTitle = isPerfect ? 'Perfect Score!' : isGood ? 'Great Job!' : 'Lesson Complete!';
    
    popup.innerHTML = `
        <div class="text-center">
            <div class="text-5xl mb-4">${resultIcon}</div>
            <h3 class="text-xl font-bold text-charcoal mb-4">${resultTitle}</h3>
            
            <div class="bg-bg-gray rounded-lg p-4 mb-4">
                <div class="text-3xl font-bold text-charcoal mb-1">${lessonData.score}/${lessonData.totalQuestions}</div>
                <div class="text-lg text-medium-gray mb-2">${scorePercentage}% Correct</div>
                <div class="text-academy-red font-semibold text-lg">+${lessonData.xpEarned} XP</div>
            </div>
            
            ${achievements.length > 0 ? `
                <div class="bg-powder-blue rounded-lg p-3 mb-4">
                    <div class="text-sm font-semibold text-alex-blue mb-2">🎉 New Achievements!</div>
                    <div class="space-y-1">
                        ${achievements.map(ach => `
                            <div class="flex items-center justify-between text-sm">
                                <span class="font-medium">${ach.icon} ${ach.name}</span>
                                <span class="text-academy-red font-semibold">+${ach.xpReward} XP</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="space-y-3">
                <button id="resultsReview" class="btn-secondary w-full py-3 rounded-lg font-semibold">
                    📊 Review Answers
                </button>
                <button id="resultsContinue" class="btn-primary w-full py-3 rounded-lg font-semibold">
                    ➡️ Next Lesson
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';

    // Handle buttons
    const reviewBtn = popup.querySelector('#resultsReview');
    const continueBtn = popup.querySelector('#resultsContinue');
    
    reviewBtn.addEventListener('click', () => {
        closeResultsPopup();
        if (callback) callback('review');
    });
    
    continueBtn.addEventListener('click', () => {
        closeResultsPopup();
        if (callback) callback('continue');
    });

    function closeResultsPopup() {
        document.body.removeChild(overlay);
        document.body.removeChild(popup);
        document.body.style.overflow = 'auto';
    }

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) continueBtn.click();
    });
}

// Show detailed answer review
export function showAnswerReview(lessonData, questionsData) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    
    const popup = document.createElement('div');
    popup.className = 'elegant-card rounded-2xl p-6 max-w-2xl mx-auto max-h-96 overflow-y-auto';
    
    const answersHTML = lessonData.answers.map((userAnswer, index) => {
        const question = questionsData[index];
        const isCorrect = userAnswer === lessonData.correctAnswers[index];
        const correctAnswerText = question.options[lessonData.correctAnswers[index]];
        const userAnswerText = question.options[userAnswer];
        
        return `
            <div class="border-b border-light-gray pb-4 mb-4 last:border-b-0">
                <div class="text-sm font-medium text-charcoal mb-3">
                    ${index + 1}. ${question.question}
                </div>
                <div class="space-y-2">
                    <div class="flex items-start">
                        <span class="${isCorrect ? 'text-green-600' : 'text-red-600'} mr-2 text-lg">
                            ${isCorrect ? '✅' : '❌'}
                        </span>
                        <div>
                            <div class="${isCorrect ? 'text-green-600' : 'text-red-600'} font-medium">
                                Your answer: ${userAnswerText}
                            </div>
                            ${!isCorrect ? `
                                <div class="text-green-600 font-medium mt-1">
                                    ✅ Correct: ${correctAnswerText}
                                </div>
                            ` : ''}
                            ${question.explanation ? `
                                <div class="text-medium-gray text-sm mt-2 italic">
                                    💡 ${question.explanation}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    popup.innerHTML = `
        <div>
            <h3 class="text-lg font-bold text-charcoal mb-4 text-center">📝 Answer Review</h3>
            <div class="space-y-4 mb-6">
                ${answersHTML}
            </div>
            <button id="reviewClose" class="btn-primary w-full py-3 rounded-lg font-semibold">
                Close Review
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';

    // Handle close
    const closeBtn = popup.querySelector('#reviewClose');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(popup);
        document.body.style.overflow = 'auto';
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeBtn.click();
    });
}

// ========================================================================
// ACHIEVEMENT PROGRESS DISPLAY
// ========================================================================

// Get achievement progress for display
export async function getAchievementProgress() {
    try {
        const currentStudent = getCurrentStudent();
        if (!currentStudent) return { achievements: {} };

        const studentRef = doc(db, 'students', currentStudent.username);
        const studentDoc = await getDoc(studentRef);
        
        if (studentDoc.exists()) {
            const studentData = studentDoc.data();
            const achievements = studentData.achievements || {};
            
            // Add progress calculation for locked achievements
            const audioLessons = studentData.audioLessons || {};
            const completedCount = Object.values(audioLessons).filter(
                lesson => lesson.status === 'completed'
            ).length;

            // Update progress for listening-master if not unlocked
            if (!achievements["listening-master"]?.unlocked) {
                achievements["listening-master"] = {
                    ...achievements["listening-master"],
                    progress: completedCount,
                    maxProgress: 10
                };
            }

            // Add progress for accuracy-master
            const highAccuracyCount = Object.values(audioLessons).filter(lesson => {
                if (lesson.status === 'completed' && lesson.score && lesson.totalQuestions) {
                    return (lesson.score / lesson.totalQuestions) >= 0.8;
                }
                return false;
            }).length;

            if (!achievements["accuracy-master"]?.unlocked) {
                achievements["accuracy-master"] = {
                    ...achievements["accuracy-master"],
                    progress: highAccuracyCount,
                    maxProgress: 5
                };
            }

            return { achievements };
        }

        return { achievements: {} };

    } catch (error) {
        console.error('❌ Error getting achievement progress:', error);
        return { achievements: {}, error: error.message };
    }
}

// ========================================================================
// ANIMATION STYLES
// ========================================================================

function addAnimationStyles() {
    if (document.querySelector('#achievementAnimations')) return;
    
    const style = document.createElement('style');
    style.id = 'achievementAnimations';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(20px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

console.log('🏆 Achievement System loaded - Student success celebration ready!');