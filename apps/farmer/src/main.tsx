import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/components/sonner";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { ThemeProvider } from "./components/theme-provider";
// import { authClient } from "./lib/auth/auth-client";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultViewTransition: true,
  context: {
    auth: null,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return <RouterProvider router={router} />;
}

import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  onRegistered(r) {
    console.log('SW Registered', r)
  },
  onRegisterError(error) {
    console.log('SW Registration Error', error)
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Toaster />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
