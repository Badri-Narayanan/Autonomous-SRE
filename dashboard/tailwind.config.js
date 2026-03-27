/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0d1117',
          surface: '#161b22',
          border: '#30363d',
        },
        neon: {
          green: '#39ff14',
          dim: '#00ff41',
        },
        alert: {
          red: '#ff2d2d',
          yellow: '#ffd700',
          green: '#00e676',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
