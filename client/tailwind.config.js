/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        radar: {
          bg: '#0a0d14',
          surface: '#101522',
          surfaceHover: '#161d2e',
          card: '#121826',
          cardHover: '#182133',
          border: '#1e293b',
          borderLight: '#334155',
          primary: '#4f46e5',
          primaryHover: '#6366f1',
          primaryGlow: 'rgba(99, 102, 241, 0.25)',
          cyan: '#06b6d4',
          cyanGlow: 'rgba(6, 182, 212, 0.2)',
          text: '#f8fafc',
          textMuted: '#94a3b8',
          textSubtle: '#64748b',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
