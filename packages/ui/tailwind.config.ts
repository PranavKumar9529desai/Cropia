/** @type {import('tailwindcss').Config} */
import { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const sharedConfg = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"], // Tells tailwind where your code is
  theme: {
    extend: {
      colors: {
        border: "oklch(from var(--border) l c h / <alpha-value>)",
        input: "oklch(from var(--input) l c h / <alpha-value>)",
        ring: "oklch(from var(--ring) l c h / <alpha-value>)",
        background: "oklch(from var(--background) l c h / <alpha-value>)",
        foreground: "oklch(from var(--foreground) l c h / <alpha-value>)",
        primary: {
          DEFAULT: "oklch(from var(--primary) l c h / <alpha-value>)",
          foreground:
            "oklch(from var(--primary-foreground) l c h / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(from var(--secondary) l c h / <alpha-value>)",
          foreground:
            "oklch(from var(--secondary-foreground) l c h / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(from var(--destructive) l c h / <alpha-value>)",
          foreground:
            "oklch(from var(--destructive-foreground) l c h / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(from var(--muted) l c h / <alpha-value>)",
          foreground:
            "oklch(from var(--muted-foreground) l c h / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(from var(--accent) l c h / <alpha-value>)",
          foreground:
            "oklch(from var(--accent-foreground) l c h / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(from var(--popover) l c h / <alpha-value>)",
          foreground:
            "oklch(from var(--popover-foreground) l c h / <alpha-value>)",
        },
        card: {
          DEFAULT: "oklch(from var(--card) l c h / <alpha-value>)",
          foreground:
            "oklch(from var(--card-foreground) l c h / <alpha-value>)",
        },
        sidebar: {
          DEFAULT:
            "oklch(from var(--sidebar-background) l c h / <alpha-value>)",
          foreground:
            "oklch(from var(--sidebar-foreground) l c h / <alpha-value>)",
          primary: "oklch(from var(--sidebar-primary) l c h / <alpha-value>)",
          "primary-foreground":
            "oklch(from var(--sidebar-primary-foreground) l c h / <alpha-value>)",
          accent: "oklch(from var(--sidebar-accent) l c h / <alpha-value>)",
          "accent-foreground":
            "oklch(from var(--sidebar-accent-foreground) l c h / <alpha-value>)",
          border: "oklch(from var(--sidebar-border) l c h / <alpha-value>)",
          ring: "oklch(from var(--sidebar-ring) l c h / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      fontFamily: {
        brand: ["Outfit", "sans-serif"],
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default sharedConfg;
