import type { Config } from "tailwindcss";

const config: Config = {
  // 1. ADD THIS LINE: Enables manual dark mode toggling
  darkMode: "class", 
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a5f", // Deep Navy Blue
        // Adding a dark-specific background color for convenience
        "dark-bg": "#0f172a", 
        secondary: "#64748b", // Slate Grey
        "harm-critical": "#dc2626",
        "harm-high": "#ea580c",
        "harm-medium": "#ca8a04",
        "harm-low": "#16a34a",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
};
export default config;