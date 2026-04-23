import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563EB", 50: "#EFF6FF", 500: "#3B82F6", 600: "#2563EB", 700: "#1D4ED8" },
        secondary: { DEFAULT: "#1E3A5F", light: "#2D5A8E" },
        accent: { DEFAULT: "#F59E0B", hover: "#D97706" },
        neutral: { 50: "#F9FAFB", 100: "#F3F4F6", 200: "#E5E7EB", 700: "#374151", 900: "#111827" },
      },
      fontFamily: { sans: ["Inter", "sans-serif"] },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 10px 25px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.06)",
      },
    },
  },
};

export default config;
