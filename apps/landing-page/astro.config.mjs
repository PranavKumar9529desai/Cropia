// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  prefetch: {
    defaultStrategy: 'hover', // Prefetch on hover for instant navigation
    prefetchAll: false // Only prefetch links with data-astro-prefetch
  },
  integrations: [react(), tailwind({
    applyBaseStyles: false,
  })],
});