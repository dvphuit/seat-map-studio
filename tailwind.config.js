/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#3b82f6", 
        "neon-blue": "#00f0ff",
        "background-dark": "#0a0f1a",
        "slate-glass": "rgba(15, 23, 42, 0.90)", 
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "1.25rem",
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(circle, rgba(51, 65, 85, 0.3) 1px, transparent 1px)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'seat': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        'seat-selected': '0 0 0 2px #fff, 0 0 20px rgba(59, 130, 246, 0.8)',
        'grid-glow': '0 0 60px -10px rgba(59, 130, 246, 0.2)',
        'active-stage': '0 0 0 1px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.15)',
      }
    },
  },
  plugins: [],
}
