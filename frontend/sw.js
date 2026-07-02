// Service Worker configuration

import { CacheFirst, ExpirationPlugin, NetworkFirst, NetworkOnly, Serwist, StaleWhileRevalidate } from 'serwist';

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    precacheOptions: {
        cleanupOutdatedCaches: true,
    },
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
        {
            matcher: ({ url }) => url.pathname.startsWith('/api/'),
            handler: new NetworkOnly(),
        },
        {
            matcher: ({ request, url }) => request.mode === 'navigate' || url.pathname.endsWith('.html'),
            handler: new NetworkFirst({
                cacheName: 'elinks-pages-v2',
                networkTimeoutSeconds: 2,
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 5,
                        maxAgeSeconds: 60 * 60,
                    }),
                ],
            }),
        },
        {
            matcher: ({ request }) => request.destination === 'script' || request.destination === 'style',
            handler: new StaleWhileRevalidate({
                cacheName: 'elinks-static-v2',
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 80,
                        maxAgeSeconds: 14 * 24 * 60 * 60,
                    }),
                ],
            }),
        },
        {
            matcher: ({ request }) => request.destination === 'image',
            handler: new CacheFirst({
                cacheName: 'elinks-images-v2',
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 80,
                        maxAgeSeconds: 30 * 24 * 60 * 60,
                    }),
                ],
            }),
        },
        {
            matcher: ({ request }) => request.destination === 'font',
            handler: new CacheFirst({
                cacheName: 'elinks-fonts-v2',
                plugins: [new ExpirationPlugin({ maxEntries: 12, maxAgeSeconds: 365 * 24 * 60 * 60 })],
            }),
        },
    ],
});

serwist.addEventListeners();
