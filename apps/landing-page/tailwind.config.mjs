import sharedConfig from '@repo/ui/tailwind.config.ts';

/** @type {import('tailwindcss').Config} */
export default {
    ...sharedConfig,
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        // Include shared UI components
        '../../packages/ui/src/**/*.{ts,tsx}',
    ],
};
