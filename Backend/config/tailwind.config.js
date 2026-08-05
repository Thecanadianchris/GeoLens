// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12141C",
        "ink-soft": "#191C27",
        card: "#1E2230",
        cream: "#F5EFE3",
        gold: "#E8A33D",
        violet: "#8B7FC0",
        coral: "#E2694B",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
};