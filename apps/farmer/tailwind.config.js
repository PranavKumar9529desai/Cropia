/** @type {import('tailwindcss').Config} */
import sharedConfig from "../../packages/ui/tailwind.config.ts"

export default {
  presets: [sharedConfig],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}" // Scans your UI package
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
