const CACHE_NAME = 'liberty-radio-v4';
const assets = ['/', '/libertyradio.html', '/style.css', '/script.js', '/manifest.json'];
 
self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(assets)));
});
 
self.addEventListener('fetch', e => {
    // Only cache local assets, never the radio streams
    if (!e.request.url.startsWith(self.location.origin)) return;
 
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
 
