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
        brand: {
          primary: "#FF5A5F",
          black: "#222222",      // Deep Text
          dark: "#484848",       // Body Text
          muted: "#717171",      // Muted Text
          border: "#EBEBEB",     // Borders
          hover: "#F2F2F2",      // Hover Surface
          bg: "#F7F7F7",         // App Background
          surface: "#FFFFFF",    // Cards
          success: "#008A05",
          warning: "#FFB400",
          error: "#D93025",
          data: "#484848",       // Adjusted to fit the mature theme
          "data-light": "#F2F2F2", // Muted light bg
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "salary-lg": ["40px", { lineHeight: "1.1", fontWeight: "700" }],
        "salary-md": ["32px", { lineHeight: "1.1", fontWeight: "700" }],
        h1: ["36px", { lineHeight: "1.1", fontWeight: "700" }],
        h2: ["28px", { lineHeight: "1.2", fontWeight: "700" }],
        h3: ["22px", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        label: ["13px", { lineHeight: "1.4", fontWeight: "500" }],
        meta: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 2px 6px rgba(0,0,0,0.08)", // Subtle, less dramatic
        "input-focus": "0 0 0 3px rgba(255,90,95,0.15)", // Uses the coral primary
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
