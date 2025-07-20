// Teacher Alex English Academy - Service Worker
// Offline-first PWA for English learning

const CACHE_VERSION = 'alex-english-v1.0.0';
const CACHE_NAMES = {
  STATIC: `${CACHE_VERSION}-static`,
  DYNAMIC: `${CACHE_VERSION}-dynamic`,
  AUDIO: `${CACHE_VERSION}-audio`,
  LESSONS: `${CACHE_VERSION}-lessons`
};

// Core app shell - always cache these
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/student/portal.html',
  '/student/hub.html',
  '/student/lessons-foundation.html',
  '/student/lessons-gaming.html',
  '/teacher/dashboard.html',
  '/css/style.css',
  '/css/dashboard.css',
  '/js/firebase.js',
  '/js/auth.js',
  '/js/progress-sync.js',
  '/js/achievement-system.js',
  '/js/lesson-data.js',
  '/js/dashboard.js',
  '/manifest.json',
  // Tailwind CDN for offline
  'https://cdn.tailwindcss.com'
];

// Foundation audio files - cache for offline lessons
const FOUNDATION_AUDIO = [
  '/audio/a1-foundation/audio-01-greetings.mp3',
  '/audio/a1-foundation/audio-02-family.mp3',
  '/audio/a1-foundation/audio-03-routine.mp3',
  '/audio/a1-foundation/audio-04-food.mp3',
  '/audio/a1-foundation/audio-05-weather.mp3',
  '/audio/a1-foundation/audio-06-shopping.mp3',
  '/audio/a1-foundation/audio-07-hobbies.mp3',
  '/audio/a1-foundation/audio-08-transportation.mp3',
  '/audio/a1-foundation/audio-09-health.mp3',
  '/audio/a1-foundation/audio-10-future.mp3'
];

// Gaming audio files - cache progressively
const GAMING_AUDIO = [
  '/audio/a1-gaming/audio-01-pc-setup.mp3',
  '/audio/a1-gaming/audio-02-online-gaming.mp3',
  '/audio/a1-gaming/audio-03-game-genres.mp3',
  '/audio/a1-gaming/audio-04-esports-tournament.mp3',
  '/audio/a1-gaming/audio-05-streaming-twitch.mp3',
  '/audio/a1-gaming/audio-06-game-reviews.mp3',
  '/audio/a1-gaming/audio-07-mobile-gaming.mp3',
  '/audio/a1-gaming/audio-08-gaming-nostalgia.mp3',
  '/audio/a1-gaming/audio-09-perfect-setup.mp3',
  '/audio/a1-gaming/audio-10-virtual-reality.mp3'
];

// ========================================================================
// INSTALL EVENT - Cache Core Assets
// ========================================================================
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installing Alex English Academy PWA');
  
  event.waitUntil(
    Promise.all([
      // Cache static app shell
      caches.open(CACHE_NAMES.STATIC).then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache Foundation audio (priority for existing students)
      caches.open(CACHE_NAMES.AUDIO).then((cache) => {
        console.log('🎧 Caching Foundation audio files');
        return cache.addAll(FOUNDATION_AUDIO.slice(0, 3)); // Cache first 3 lessons immediately
      })
    ]).then(() => {
      console.log('✅ Service Worker: Install complete');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// ========================================================================
// ACTIVATE EVENT - Clean Old Caches
// ========================================================================
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activating');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => !Object.values(CACHE_NAMES).includes(cacheName))
            .map(cacheName => {
              console.log(`🗑️ Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Take control of all tabs
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker: Activation complete');
      
      // Background cache remaining audio files
      cacheRemainingAudio();
    })
  );
});

// ========================================================================
// FETCH EVENT - Smart Caching Strategies
// ========================================================================
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Firebase and external APIs
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('gstatic') ||
      url.hostname.includes('googleapis')) {
    return;
  }
  
  event.respondWith(handleFetchRequest(request));
});

// ========================================================================
// FETCH HANDLING STRATEGIES
// ========================================================================
async function handleFetchRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Audio files - Cache First (offline lessons)
    if (url.pathname.includes('/audio/')) {
      return await cacheFirstStrategy(request, CACHE_NAMES.AUDIO);
    }
    
    // Strategy 2: Static assets - Cache First  
    if (isStaticAsset(url.pathname)) {
      return await cacheFirstStrategy(request, CACHE_NAMES.STATIC);
    }
    
    // Strategy 3: Lesson pages - Network First (fresh content)
    if (isLessonPage(url.pathname)) {
      return await networkFirstStrategy(request, CACHE_NAMES.LESSONS);
    }
    
    // Strategy 4: Everything else - Network First with fallback
    return await networkFirstStrategy(request, CACHE_NAMES.DYNAMIC);
    
  } catch (error) {
    console.error('🚨 Fetch error:', error);
    return await getOfflineFallback(url.pathname);
  }
}

// ========================================================================
// CACHING STRATEGIES
// ========================================================================

// Cache First - Great for audio and static assets
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log(`💾 Cache hit: ${request.url}`);
    return cachedResponse;
  }
  
  console.log(`🌐 Fetching: ${request.url}`);
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network First - Fresh content with cache fallback
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log(`🌐 Network first: ${request.url}`);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log(`💾 Network failed, trying cache: ${request.url}`);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// ========================================================================
// OFFLINE FALLBACKS
// ========================================================================
async function getOfflineFallback(pathname) {
  // Offline lesson page
  if (isLessonPage(pathname)) {
    const cache = await caches.open(CACHE_NAMES.STATIC);
    return await cache.match('/student/portal.html') || new Response('Offline lesson access coming soon');
  }
  
  // Offline page for everything else
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline - Alex English</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: system-ui; 
          text-align: center; 
          padding: 2rem; 
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        }
        .container { 
          max-width: 400px; 
          margin: 0 auto; 
          background: white; 
          padding: 2rem; 
          border-radius: 1rem; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .icon { font-size: 3rem; margin-bottom: 1rem; }
        .title { color: #3b82f6; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }
        .message { color: #6b7280; margin-bottom: 2rem; }
        .button { 
          background: #3b82f6; 
          color: white; 
          padding: 0.75rem 1.5rem; 
          border-radius: 0.5rem; 
          text-decoration: none; 
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📡</div>
        <h1 class="title">You're Offline</h1>
        <p class="message">Don't worry! Your cached lessons are still available.</p>
        <a href="/student/portal.html" class="button">Access Cached Lessons</a>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// ========================================================================
// BACKGROUND AUDIO CACHING
// ========================================================================
async function cacheRemainingAudio() {
  console.log('🎧 Background: Caching remaining audio files');
  
  const audioCache = await caches.open(CACHE_NAMES.AUDIO);
  
  // Cache remaining Foundation audio
  const remainingFoundation = FOUNDATION_AUDIO.slice(3);
  for (const audioUrl of remainingFoundation) {
    try {
      const response = await fetch(audioUrl);
      if (response.ok) {
        await audioCache.put(audioUrl, response);
        console.log(`✅ Cached: ${audioUrl}`);
      }
    } catch (error) {
      console.log(`❌ Failed to cache: ${audioUrl}`);
    }
    
    // Small delay to avoid overwhelming the network
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Cache Gaming audio files
  for (const audioUrl of GAMING_AUDIO) {
    try {
      const response = await fetch(audioUrl);
      if (response.ok) {
        await audioCache.put(audioUrl, response);
        console.log(`✅ Cached gaming: ${audioUrl}`);
      }
    } catch (error) {
      console.log(`❌ Failed to cache gaming: ${audioUrl}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('🎉 Background audio caching complete!');
}

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================
function isStaticAsset(pathname) {
  return pathname.includes('.css') || 
         pathname.includes('.js') || 
         pathname.includes('.json') ||
         pathname === '/' ||
         pathname.includes('index.html');
}

function isLessonPage(pathname) {
  return pathname.includes('/student/') || 
         pathname.includes('lesson') ||
         pathname.includes('portal') ||
         pathname.includes('hub');
}

// ========================================================================
// BACKGROUND SYNC (Future: Progress sync when back online)
// ========================================================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'progress-sync') {
    console.log('🔄 Background sync: Syncing lesson progress');
    event.waitUntil(syncLessonProgress());
  }
});

async function syncLessonProgress() {
  // This will integrate with progress-sync.js for offline progress sync
  console.log('📊 Syncing offline lesson progress...');
  // Implementation would connect to your existing progress-sync.js
}

// ========================================================================
// PUSH NOTIFICATIONS (Future: Study reminders)
// ========================================================================
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Time for your English lesson!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data.url || '/student/portal.html',
      actions: [
        {
          action: 'study',
          title: 'Study Now',
          icon: '/icons/action-study.png'
        },
        {
          action: 'later',
          title: 'Remind Later',
          icon: '/icons/action-later.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Alex English Academy', options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'study') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/student/portal.html')
    );
  } else if (event.action === 'later') {
    // Schedule another notification (implementation needed)
    console.log('📅 Remind later requested');
  }
});

console.log('🎯 Service Worker: Alex English Academy PWA Ready!');