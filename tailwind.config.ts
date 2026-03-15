import type { Config } from "tailwindcss";
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1300px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        technical: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        jtech: {
          brand: "#f0514e", // Main orange
          accent: "#ed6a32", // Secondary orange/gold
          gold: "#d4af37", // Gold
          blue: "#0077b6", // Blue accent
          navy: "#002855", // Deep logo blue
          green: "#86bc25", // Status green
          dark: {
            DEFAULT: "#111418", // Base dark background
            panel: "#1a1b22", // Panel background
            paper: "#1a1e24", // Lighter panel/card
            nav: "#1b1e27", // Nav background
          },
          text: {
            DEFAULT: "#eceff4", // Main light text
            brighter: "#f0f2f6", // Brightest text
            muted: "#9fa5b3", // Standard muted
            mutedLight: "#8f95a3", // Lighter muted
            mutedDark: "#a3a9b7", // Darker muted
          }
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
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
        "slide-in-left": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(-100%)", opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        "boing-enter": {
          "0%": { transform: "scale(0.6) rotateY(45deg) rotateZ(-10deg) translateX(-80px)", opacity: "0" },
          "100%": { transform: "scale(1.1) rotateY(0deg) rotateZ(0deg) translateX(0)", opacity: "1" },
        },
        "float-infinite": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "slide-up-fade": {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-left": "slide-in-left 0.4s ease-out forwards",
        "slide-out-left": "slide-out-left 0.4s ease-in forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "slide-out-right": "slide-out-right 0.4s ease-in forwards",
        "boing-enter": "boing-enter 1.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "float-infinite": "float-infinite 4s ease-in-out infinite",
        "slide-up-fade": "slide-up-fade 0.8s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar-hide")],
} satisfies Config;
