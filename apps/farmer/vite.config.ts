import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    port: 5000,
  },
  preview: {
    port: 5000,
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.ts",
      registerType: "autoUpdate",
      // If you really want the output file to be named 'site.webmanifest'
      manifestFilename: "site.webmanifest",
      devOptions: {
        enabled: true,
        type: "module",
      },

      manifest: {
        id: "/",
        name: "Cropia",
        short_name: "Cropia",
        description: "Cropia - Smart Farming Solutions for Farmers",
        start_url: "/",
        icons: [
          {
            src: "/favicon/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/favicon/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          // vital for standard display
          {
            src: "/favicon/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/pwa-screenshot-mobile.png",
            sizes: "1024x1024",
            type: "image/png",
            form_factor: "narrow",
          },
          {
            src: "/screenshots/pwa-screenshot-desktop.png",
            sizes: "1024x1024",
            type: "image/png",
            form_factor: "wide",
          },
        ],
        theme_color: "#b1e360",
        background_color: "#b1e360",
        display: "standalone",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
