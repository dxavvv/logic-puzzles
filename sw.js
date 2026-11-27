/* Service worker: gra offline i instalacja na ekranie głównym.
   Strategia: najpierw cache, a w tle odświeżenie (stale-while-revalidate).
   Przy dodaniu nowej gry dopisz jej pliki do FILES i podbij VERSION. */
const VERSION = 'lp-v3';
const FILES = [
    './',
    'index.html',
    'style.css',
    'script.js',
    'manifest.webmanifest',
    'assets/base.css',
    'assets/mobile.css',
    'assets/common.js',
    'assets/pixel.js',
    'assets/fx.js',
    'assets/i18n.js',
    'assets/mobile.js',
    'assets/icons/icon-192.png',
    'assets/icons/icon-512.png',
    'assets/icons/apple-touch-icon.png',
    'games/architekt/index.html',
    'games/architekt/script.js',
    'games/binairo/index.html',
    'games/binairo/script.js',
    'games/chmury/index.html',
    'games/chmury/script.js',
    'games/dzialania/index.html',
    'games/dzialania/script.js',
    'games/filomino/index.html',
    'games/filomino/script.js',
    'games/hanoi/index.html',
    'games/hanoi/script.js',
    'games/hitori/index.html',
    'games/hitori/script.js',
    'games/krzyzowkaliczbowa/index.html',
    'games/krzyzowkaliczbowa/script.js',
    'games/lampki/index.html',
    'games/lampki/script.js',
    'games/lancuchsudoku/index.html',
    'games/lancuchsudoku/script.js',
    'games/latarnie/index.html',
    'games/latarnie/script.js',
    'games/lightsout/index.html',
    'games/lightsout/script.js',
    'games/lightsout/style.css',
    'games/mniejszewieksze/index.html',
    'games/mniejszewieksze/script.js',
    'games/mozaika/index.html',
    'games/mozaika/script.js',
    'games/nurikabe/index.html',
    'games/nurikabe/script.js',
    'games/obrazeklogiczny/index.html',
    'games/obrazeklogiczny/script.js',
    'games/od0do9/index.html',
    'games/od0do9/script.js',
    'games/od0do9/style.css',
    'games/parkiet/index.html',
    'games/parkiet/script.js',
    'games/piramidy/index.html',
    'games/piramidy/script.js',
    'games/sapernamorzu/index.html',
    'games/sapernamorzu/script.js',
    'games/sudoku/index.html',
    'games/sudoku/script.js',
    'games/sudoku/style.css',
    'games/sudokurenban/index.html',
    'games/sudokurenban/script.js',
    'games/tratwy/index.html',
    'games/tratwy/script.js',
    'games/ukosnedzialania/index.html',
    'games/ukosnedzialania/script.js',
    'games/wielokropka/index.html',
    'games/wielokropka/script.js',
    'games/wieze/index.html',
    'games/wieze/script.js',
    'games/wsapera/index.html',
    'games/wsapera/script.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(VERSION)
            .then(cache => Promise.all(FILES.map(f => cache.add(f).catch(() => null))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
    event.respondWith(
        caches.open(VERSION).then(cache =>
            cache.match(req, { ignoreSearch: true }).then(hit => {
                const net = fetch(req).then(res => {
                    if (res && res.ok) cache.put(req, res.clone());
                    return res;
                }).catch(() => hit);
                return hit || net;
            })
        )
    );
});
