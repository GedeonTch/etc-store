import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mode sombre
        dark: {
          bg: "#0A0A0A",
          text: "#F5F0E8",
          gold: "#C9A84C",
          card: "#111111",
          border: "#1E1E1E",
        },
        // Mode clair
        light: {
          bg: "#F5F0E8",
          text: "#0A0A0A",
          gold: "#A07830",
          card: "#FFFFFF",
          border: "#E0D8CC",
        },
        // Alias globaux
        gold: {
          DEFAULT: "#C9A84C",
          light: "#A07830",
          dark: "#C9A84C",
        },
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
