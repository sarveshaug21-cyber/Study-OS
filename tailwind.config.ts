import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#101828",
          soft: "#344054",
          muted: "#667085",
        },
        paper: {
          DEFAULT: "#F7F6F2",
          deep: "#EFEEE8",
        },
        night: {
          DEFAULT: "#0B1220",
          soft: "#111B2E",
          line: "#1F2A3D",
        },
        brand: {
          50: "#F3F1FF",
          100: "#E9E5FF",
          200: "#D6CEFF",
          300: "#B9AAFF",
          400: "#9679FF",
          500: "#7A55F2",
          600: "#6639DA",
          700: "#552DB7",
          800: "#472894",
          900: "#3C2577",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
        display: [
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px -12px rgba(16, 24, 40, 0.12)",
        lift: "0 2px 4px rgba(16, 24, 40, 0.04), 0 24px 48px -24px rgba(16, 24, 40, 0.28)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
