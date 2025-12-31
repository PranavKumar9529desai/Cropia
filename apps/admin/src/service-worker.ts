/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
})

cleanupOutdatedCaches()
clientsClaim()

// @ts-expect-error - __WB_MANIFEST is replaced by Vite
precacheAndRoute(self.__WB_MANIFEST)
