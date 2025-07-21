// Teacher Alex English Academy - Service Worker (FIXED Cache Error)
// FIXED: Partial response (206) cache error
const CACHE_NAME = 'alex-english-v1';

// Essential files to cache (FIXED: Relative paths)
const STATIC_FILES = [
  './',
  './index.html',
  './student/portal.html',
  './student/hub.html',
  './css/style.css',
  './js/firebase.js',
  './js/auth.js',
  './manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching essential files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Install complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Install failed:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log(`🗑️ Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// FIXED: Fetch event - handle partial responses properly
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Skip non-GET requests and external APIs
  if (event.request.method !== 'GET' || 
      event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis')) {
    return;
  }
  
  // 🔧 CRITICAL FIX: Skip audio files completely to avoid 206 errors
  if (requestUrl.pathname.includes('/audio/') || 
      requestUrl.pathname.endsWith('.mp3') ||
      requestUrl.pathname.endsWith('.wav') ||
      requestUrl.pathname.endsWith('.ogg') ||
      requestUrl.pathname.endsWith('.m4a')) {
    
    console.log('🎵 Audio file - bypassing Service Worker:', requestUrl.pathname);
    return; // Let browser handle audio files directly - NO event.respondWith()
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // FIXED: Only cache complete responses (status 200)
            // Don't cache partial responses (status 206) that cause errors
            if (fetchResponse.ok && fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone))
                .catch((error) => {
                  // FIXED: Silent fail for cache errors - don't break the app
                  console.log('⚠️ Cache failed (non-critical):', error);
                });
            }
            return fetchResponse;
          });
      })
      .catch(() => {
        // Offline fallback for HTML pages
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      })
  );
});

console.log('🎯 Service Worker: Alex English Academy PWA Ready (MP3 Cache Error FIXED)!');
