import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#142033",
          soft: "#1c2b45",
          muted: "#3d4f6a",
        },
        teal: {
          DEFAULT: "#0F6B5C",
          dark: "#0a5246",
          soft: "#e6f4f1",
          mid: "#1a8a76",
        },
        mist: {
          DEFAULT: "#f3f6f8",
          aqua: "#e8f3f1",
          slate: "#eef1f5",
        },
        surface: {
          DEFAULT: "#ffffff",
          raised: "#fafbfc",
        },
        line: {
          DEFAULT: "#e2e8ef",
          strong: "#cdd6e1",
        },
        status: {
          received: "#b45309",
          washing: "#1d4ed8",
          ready: "#0F6B5C",
          completed: "#15803d",
          cancelled: "#64748b",
        },
      },
      fontFamily: {
        sans: ["var(--font-figtree)", "system-ui", "sans-serif"],
        display: ["var(--font-figtree)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateY(-12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.25s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
