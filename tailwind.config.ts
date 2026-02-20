import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  safelist: ["grid-cols-1","grid-cols-2","grid-cols-3","grid-cols-4"],
  theme: {
    screens: {
      xs: "390px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)",
      },
      keyframes: {
        confettiFall: {
          "0%":   { transform: "translateY(-10px) rotate(0deg)", opacity: "1" },
          "60%":  { opacity: "0.8" },
          "100%": { transform: "translateY(200px) rotate(360deg)", opacity: "0" },
        },
        blobDrift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%":  { transform: "translate(30px, -20px) scale(1.05)" },
          "66%":  { transform: "translate(-20px, 10px) scale(0.97)" },
        },
      },
      animation: {
        confetti: "confettiFall 1.2s ease-in forwards",
        blob: "blobDrift 10s ease-in-out infinite",
      },
    },
  },
  plugins: [
    // no-scrollbar utility
    function({ addUtilities }: any) {
      addUtilities({
        ".no-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
      });
    },
  ],
} satisfies Config;
