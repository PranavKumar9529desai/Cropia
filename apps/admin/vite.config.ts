import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    port: 5001,
  },
  preview: {
    port: 5001,
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      registerType: "autoUpdate",
      // If you really want the output file to be named 'site.webmanifest'
      manifestFilename: "site.webmanifest",
      devOptions: {
        enabled: true,
        type: "module",
      },

      manifest: {
        name: "Cropia Admin",
        short_name: "Cropia Admin",
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
