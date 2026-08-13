/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#161B33",
        "ink-soft": "#232A4D",
        "ink-line": "#333B63",
        paper: "#F7F5EE",
        "paper-dim": "#EAE7DC",
        amber: "#E8A33D",
        "amber-dark": "#B97A1F",
        teal: "#2F9E7A",
        "teal-dark": "#1F6E54",
        red: "#D2444C",
        "red-dark": "#9E2E35",
        slate: "#6B7280",
        "slate-light": "#9CA3AF",
        cream: "#FBFAF6",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Courier New'", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};