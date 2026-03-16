const CACHE = 'safrot-v3';

// الملفات الثابتة اللي بتتحفظ في الكاش
const STATIC = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './safrot.png',
    './manifest.json',
];

// ══════════════════════════════════════
// Install — احفظ الملفات الثابتة
// ══════════════════════════════════════
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(STATIC))
    );
    self.skipWaiting();
});

// ══════════════════════════════════════
// Activate — امسح الكاشات القديمة
// ══════════════════════════════════════
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE).map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// ══════════════════════════════════════
// Fetch — استراتيجية ذكية حسب نوع الطلب
// ══════════════════════════════════════
self.addEventListener('fetch', e => {
    const url = e.request.url;

    // Firebase و Google Fonts و APIs — Network First دايمًا
    if (
        url.includes('firebasedatabase') ||
        url.includes('firebaseio.com') ||
        url.includes('firebase') ||
        url.includes('googleapis.com') ||
        url.includes('gstatic.com') ||
        url.includes('api.whatsapp') ||
        url.includes('cdnjs')
    ) {
        e.respondWith(
            fetch(e.request).catch(() => {
                // لو مفيش نت وطلب صفحة → ارجع الـ index من الكاش
                if (e.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            })
        );
        return;
    }

    // الملفات الثابتة — Cache First
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;

            // مش في الكاش → اجيبه من النت واحفظه
            return fetch(e.request).then(response => {
                if (!response || response.status !== 200) return response;
                const clone = response.clone();
                caches.open(CACHE).then(cache => cache.put(e.request, clone));
                return response;
            });
        })
    );
});
