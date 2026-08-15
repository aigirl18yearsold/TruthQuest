 /** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#101B3D",
        "navy-soft": "#1C2B5C",
        blue: "#3B6FF2",
        "blue-soft": "#EAF1FE",
        mist: "#F2F5FC",
        paper: "#FFFFFF",
        "paper-dim": "#E6EBF5",
        slate: "#57607A",
        "slate-light": "#8D97AE",
        mint: "#1FAE72",
        "mint-soft": "#E4F8EC",
        amber: "#E7A23A",
        "amber-soft": "#FBF0DA",
        rose: "#E14C5C",
        "rose-soft": "#FCE6E9",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
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