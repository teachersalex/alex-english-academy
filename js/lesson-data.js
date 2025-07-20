/**
 * Audio Lesson Content Data - Teacher Alex English Academy
 * Complete content for all 10 A1 Foundation audio lessons with questions
 */

export const AUDIO_LESSONS = {
    "audio-01": {
        id: "audio-01",
        title: "Basic Greetings",
        description: "Learn essential greeting phrases and introductions",
        audioPath: "../audio/a1-foundation/audio-01-greetings.mp3",
        duration: 35,
        level: "A1",
        order: 1,
        questions: [
            {
                id: 1,
                question: "What is the woman's name?",
                options: ["Sara", "Sarah", "Sandra", "Samantha"],
                correct: 1,
                explanation: "The woman clearly states 'My name is Sarah' at the beginning."
            },
            {
                id: 2,
                question: "Where is she from?",
                options: ["Brazil", "USA", "Canada", "Mexico"],
                correct: 2,
                explanation: "She says 'I am from Canada' in her introduction."
            },
            {
                id: 3,
                question: "What is her job?",
                options: ["Teacher", "Nurse", "Doctor", "Engineer"],
                correct: 1,
                explanation: "She mentions 'I work in a hospital. I am a nurse.'"
            },
            {
                id: 4,
                question: "How old is she?",
                options: ["23", "24", "25", "26"],
                correct: 2,
                explanation: "She states 'I am 25 years old' in her introduction."
            },
            {
                id: 5,
                question: "What does she say at the end?",
                options: ["Goodbye", "See you later", "Have a great day", "Take care"],
                correct: 2,
                explanation: "She ends with 'Have a great day!' as her farewell."
            }
        ]
    },

    "audio-02": {
        id: "audio-02", 
        title: "Family Introduction",
        description: "Learn to talk about family members and relationships",
        audioPath: "../audio/a1-foundation/audio-02-family.mp3",
        duration: 38,
        level: "A1",
        order: 2,
        questions: [
            {
                id: 1,
                question: "How many people are in the family?",
                options: ["3", "4", "5", "6"],
                correct: 1,
                explanation: "The family consists of mother, father, speaker, and sister = 4 people."
            },
            {
                id: 2,
                question: "What does the mother like?",
                options: ["Reading", "Cooking", "Dancing", "Shopping"],
                correct: 1,
                explanation: "The speaker mentions 'My mother likes cooking.'"
            },
            {
                id: 3,
                question: "How old is the sister?",
                options: ["18", "20", "22", "25"],
                correct: 1,
                explanation: "The sister is described as '20 years old.'"
            },
            {
                id: 4,
                question: "Where does the father work?",
                options: ["Hospital", "School", "Bank", "Restaurant"],
                correct: 2,
                explanation: "The father 'works in a bank' according to the audio."
            },
            {
                id: 5,
                question: "Where do they live?",
                options: ["Small apartment", "Big house", "Small house", "Big apartment"],
                correct: 1,
                explanation: "They 'live together in a big house.'"
            }
        ]
    },

    "audio-03": {
        id: "audio-03",
        title: "Daily Routine", 
        description: "Learn to describe daily activities and time expressions",
        audioPath: "../audio/a1-foundation/audio-03-routine.mp3",
        duration: 40,
        level: "A1",
        order: 3,
        questions: [
            {
                id: 1,
                question: "What time does he wake up?",
                options: ["6 o'clock", "7 o'clock", "8 o'clock", "9 o'clock"],
                correct: 1,
                explanation: "He wakes up 'at seven o'clock every morning.'"
            },
            {
                id: 2,
                question: "How does he go to work?",
                options: ["By car", "By bus", "Walking", "By bike"],
                correct: 1,
                explanation: "He goes 'to work by bus' at eight-thirty."
            },
            {
                id: 3,
                question: "What time does he go to bed?",
                options: ["9 o'clock", "10 o'clock", "11 o'clock", "12 o'clock"],
                correct: 1,
                explanation: "He goes 'to bed at ten o'clock.'"
            },
            {
                id: 4,
                question: "What does he eat for breakfast?",
                options: ["Cereal", "Eggs", "Bread with butter", "Fruit"],
                correct: 2,
                explanation: "He eats 'bread with butter' for breakfast."
            },
            {
                id: 5,
                question: "What time does he start work?",
                options: ["8 o'clock", "9 o'clock", "8:30", "9:30"],
                correct: 1,
                explanation: "He works 'from nine to five,' so starts at 9 o'clock."
            }
        ]
    },

    "audio-04": {
        id: "audio-04",
        title: "Food and Drinks",
        description: "Learn vocabulary for food, drinks, and restaurant experiences",
        audioPath: "../audio/a1-foundation/audio-04-food.mp3", 
        duration: 36,
        level: "A1",
        order: 4,
        questions: [
            {
                id: 1,
                question: "What is his favorite drink?",
                options: ["Coffee", "Tea", "Orange juice", "Water"],
                correct: 2,
                explanation: "His 'favorite drink is orange juice.'"
            },
            {
                id: 2,
                question: "What dessert does he want?",
                options: ["Ice cream", "Chocolate cake", "Apple pie", "Cookies"],
                correct: 1,
                explanation: "For dessert, he wants 'chocolate cake.'"
            },
            {
                id: 3,
                question: "When does he come to the restaurant?",
                options: ["Every day", "Every weekend", "Every month", "Every week"],
                correct: 1,
                explanation: "He comes 'here every weekend with my friends.'"
            },
            {
                id: 4,
                question: "What food does he like?",
                options: ["Pizza only", "Hamburgers only", "Pizza and hamburgers", "Salad"],
                correct: 2,
                explanation: "He likes 'pizza and hamburgers.'"
            },
            {
                id: 5,
                question: "How is the food at the restaurant?",
                options: ["Expensive", "Delicious", "Bad", "Cold"],
                correct: 1,
                explanation: "The food is 'delicious and not expensive.'"
            }
        ]
    },

    "audio-05": {
        id: "audio-05",
        title: "Weather and Clothes",
        description: "Learn to describe weather conditions and clothing",
        audioPath: "../audio/a1-foundation/audio-05-weather.mp3",
        duration: 37,
        level: "A1", 
        order: 5,
        questions: [
            {
                id: 1,
                question: "What is the weather like today?",
                options: ["Cold and rainy", "Sunny and warm", "Cloudy", "Windy"],
                correct: 1,
                explanation: "Today is 'sunny and warm.'"
            },
            {
                id: 2,
                question: "What did he wear yesterday?",
                options: ["T-shirt and shorts", "Jacket and boots", "Jeans and sweater", "Dress"],
                correct: 1,
                explanation: "Yesterday was cold and rainy, so he 'wore a jacket and boots.'"
            },
            {
                id: 3,
                question: "Why does he love summer?",
                options: ["No school", "Nice weather", "Long days", "Vacation time"],
                correct: 1,
                explanation: "He loves summer 'because the weather is nice.'"
            },
            {
                id: 4,
                question: "What is he wearing today?",
                options: ["Jacket and boots", "Blue t-shirt and white shorts", "Jeans and sweater", "Black pants"],
                correct: 1,
                explanation: "Today he is wearing 'a blue t-shirt and white shorts.'"
            },
            {
                id: 5,
                question: "What will tomorrow's weather be like?",
                options: ["Sunny", "Rainy", "Cloudy", "Hot"],
                correct: 2,
                explanation: "Tomorrow 'will be cloudy.'"
            }
        ]
    },

    "audio-06": {
        id: "audio-06",
        title: "Shopping",
        description: "Learn shopping vocabulary and store information",
        audioPath: "../audio/a1-foundation/audio-06-shopping.mp3",
        duration: 39,
        level: "A1",
        order: 6,
        questions: [
            {
                id: 1,
                question: "What fruits does he want to buy?",
                options: ["Apples and oranges only", "Bananas only", "Apples, bananas, and oranges", "Only oranges"],
                correct: 2,
                explanation: "He wants to buy 'apples, bananas, and oranges.'"
            },
            {
                id: 2,
                question: "When does the supermarket close?",
                options: ["9 at night", "10 at night", "11 at night", "8 at night"],
                correct: 1,
                explanation: "The supermarket 'closes at ten at night.'"
            },
            {
                id: 3,
                question: "How does he pay?",
                options: ["Cash", "Credit card", "Check", "Debit card"],
                correct: 1,
                explanation: "He pays 'with my credit card.'"
            },
            {
                id: 4,
                question: "What other things does he need to buy?",
                options: ["Milk and eggs", "Bread only", "Milk, eggs, and bread", "Just milk"],
                correct: 2,
                explanation: "He also needs 'milk, eggs, and bread.'"
            },
            {
                id: 5,
                question: "How long does shopping take?",
                options: ["20 minutes", "30 minutes", "40 minutes", "1 hour"],
                correct: 1,
                explanation: "Shopping for food 'takes about thirty minutes.'"
            }
        ]
    },

    "audio-07": {
        id: "audio-07",
        title: "Hobbies and Free Time",
        description: "Learn to talk about hobbies and leisure activities",
        audioPath: "../audio/a1-foundation/audio-07-hobbies.mp3",
        duration: 35,
        level: "A1",
        order: 7,
        questions: [
            {
                id: 1,
                question: "What instrument does he play?",
                options: ["Piano", "Guitar", "Drums", "Violin"],
                correct: 1,
                explanation: "He plays 'guitar on weekends.'"
            },
            {
                id: 2,
                question: "When does he play this instrument?",
                options: ["Every day", "Weekdays", "Weekends", "Sometimes"],
                correct: 2,
                explanation: "He plays guitar 'on weekends.'"
            },
            {
                id: 3,
                question: "What is his favorite hobby?",
                options: ["Reading", "Photography", "Singing", "Dancing"],
                correct: 1,
                explanation: "His 'favorite hobby is photography.'"
            },
            {
                id: 4,
                question: "What does he not like doing?",
                options: ["Singing", "Dancing", "Reading", "Playing guitar"],
                correct: 1,
                explanation: "He doesn't 'like dancing, but I love singing.'"
            },
            {
                id: 5,
                question: "What does he take pictures of?",
                options: ["People", "Buildings", "Nature and animals", "Cars"],
                correct: 2,
                explanation: "He takes 'pictures of nature and animals.'"
            }
        ]
    },

    "audio-08": {
        id: "audio-08",
        title: "Transportation",
        description: "Learn about different ways to travel and get around",
        audioPath: "../audio/a1-foundation/audio-08-transportation.mp3",
        duration: 38,
        level: "A1",
        order: 8,
        questions: [
            {
                id: 1,
                question: "How does he usually go to work?",
                options: ["By car", "Walking", "By bus", "By bike"],
                correct: 1,
                explanation: "He 'usually walk[s] to work because it's very close.'"
            },
            {
                id: 2,
                question: "When does he drive his car?",
                options: ["Every day", "When it rains", "On weekends", "Never"],
                correct: 2,
                explanation: "On weekends, he drives 'my car to visit my parents.'"
            },
            {
                id: 3,
                question: "Why doesn't he like the subway?",
                options: ["Too expensive", "Too crowded", "Too slow", "Too far"],
                correct: 1,
                explanation: "He doesn't like the subway 'because it's too crowded.'"
            },
            {
                id: 4,
                question: "Where does he live?",
                options: ["Countryside", "City center", "Suburbs", "Near the park"],
                correct: 1,
                explanation: "He lives 'in the city center.'"
            },
            {
                id: 5,
                question: "Where is the bus stop?",
                options: ["Near his work", "In front of his building", "At the corner", "Far from home"],
                correct: 1,
                explanation: "The bus stop is 'in front of my building.'"
            }
        ]
    },

    "audio-09": {
        id: "audio-09",
        title: "Health and Body",
        description: "Learn vocabulary about health, exercise, and body care",
        audioPath: "../audio/a1-foundation/audio-09-health.mp3",
        duration: 40,
        level: "A1",
        order: 9,
        questions: [
            {
                id: 1,
                question: "How often does he exercise?",
                options: ["Every day", "Three times a week", "Once a week", "Never"],
                correct: 1,
                explanation: "He exercises 'three times a week at the gym.'"
            },
            {
                id: 2,
                question: "How many glasses of water does he drink?",
                options: ["6", "7", "8", "10"],
                correct: 2,
                explanation: "He drinks water 'every day - about eight glasses.'"
            },
            {
                id: 3,
                question: "How many hours does he sleep?",
                options: ["7 hours", "8 hours", "9 hours", "6 hours"],
                correct: 1,
                explanation: "He sleeps 'eight hours every night.'"
            },
            {
                id: 4,
                question: "How often does he brush his teeth?",
                options: ["Once a day", "Twice a day", "Three times a day", "Never"],
                correct: 1,
                explanation: "He brushes 'my teeth twice a day.'"
            },
            {
                id: 5,
                question: "What doesn't he do?",
                options: ["Exercise", "Eat vegetables", "Smoke and drink alcohol", "Sleep"],
                correct: 2,
                explanation: "He doesn't 'smoke and I don't drink alcohol.'"
            }
        ]
    },

    "audio-10": {
        id: "audio-10",
        title: "Future Plans",
        description: "Learn to talk about future plans and aspirations",
        audioPath: "../audio/a1-foundation/audio-10-future.mp3",
        duration: 37,
        level: "A1",
        order: 10,
        questions: [
            {
                id: 1,
                question: "Where will he travel next month?",
                options: ["Asia", "Europe", "America", "Africa"],
                correct: 1,
                explanation: "Next month, he 'will travel to Europe.'"
            },
            {
                id: 2,
                question: "How long will he stay?",
                options: ["One week", "Two weeks", "Three weeks", "One month"],
                correct: 1,
                explanation: "He 'will stay for two weeks.'"
            },
            {
                id: 3,
                question: "What will he do after his trip?",
                options: ["Study more", "Start a new job", "Buy a house", "Move cities"],
                correct: 1,
                explanation: "After his trip, he 'will start a new job.'"
            },
            {
                id: 4,
                question: "Which countries will he visit?",
                options: ["France and Italy", "Italy and Spain", "France, Italy, and Spain", "Only France"],
                correct: 2,
                explanation: "He will visit 'France, Italy, and Spain.'"
            },
            {
                id: 5,
                question: "What languages is he learning?",
                options: ["Spanish", "French", "French and Italian", "Italian"],
                correct: 2,
                explanation: "He is learning 'some French and Italian phrases.'"
            }
        ]
    }
};

// Utility Functions
export function getLessonById(lessonId) {
    return AUDIO_LESSONS[lessonId] || null;
}

export function getAllLessons() {
    return Object.values(AUDIO_LESSONS).sort((a, b) => a.order - b.order);
}

export function getNextLesson(currentLessonId) {
    const currentLesson = AUDIO_LESSONS[currentLessonId];
    if (!currentLesson) return null;
    
    const nextOrder = currentLesson.order + 1;
    return Object.values(AUDIO_LESSONS).find(lesson => lesson.order === nextOrder) || null;
}

export function getPreviousLesson(currentLessonId) {
    const currentLesson = AUDIO_LESSONS[currentLessonId];
    if (!currentLesson) return null;
    
    const previousOrder = currentLesson.order - 1;
    return Object.values(AUDIO_LESSONS).find(lesson => lesson.order === previousOrder) || null;
}

export function getTotalLessons() {
    return Object.keys(AUDIO_LESSONS).length;
}

export function getCompletedLessonsCount(audioLessonsProgress) {
    if (!audioLessonsProgress) return 0;
    
    return Object.values(audioLessonsProgress).filter(
        lesson => lesson.status === 'completed'
    ).length;
}

export function getOverallProgress(audioLessonsProgress) {
    const completedCount = getCompletedLessonsCount(audioLessonsProgress);
    const totalCount = getTotalLessons();
    return Math.round((completedCount / totalCount) * 100);
}

export function calculateXPEarned(score, totalQuestions, timeSpent) {
    // Base XP calculation
    const baseXP = 50; // Base XP for attempting lesson
    const scorePercentage = (score / totalQuestions) * 100;
    
    // Bonus XP for performance
    let bonusXP = 0;
    if (scorePercentage === 100) {
        bonusXP = 25; // Perfect score bonus
    } else if (scorePercentage >= 80) {
        bonusXP = 15; // Good score bonus
    } else if (scorePercentage >= 60) {
        bonusXP = 10; // Average score bonus
    }
    
    // Time bonus (faster completion = more bonus)
    let timeBonus = 0;
    if (timeSpent < 60) { // Under 1 minute
        timeBonus = 10;
    } else if (timeSpent < 120) { // Under 2 minutes
        timeBonus = 5;
    }
    
    return baseXP + bonusXP + timeBonus;
}

export function getRequiredXPForLevel(level) {
    // XP requirements: Level 1: 0-99, Level 2: 100-249, Level 3: 250-449, etc.
    if (level <= 1) return 0;
    return 100 + ((level - 2) * 150);
}

export function calculateLevelFromXP(totalXP) {
    if (totalXP < 100) return 1;
    return Math.floor((totalXP - 100) / 150) + 2;
}

console.log('📚 Lesson Data System loaded - 10 audio lessons ready!');