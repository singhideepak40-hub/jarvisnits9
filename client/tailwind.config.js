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
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        surface: {
          bg: '#0B0F19',
          panel: '#111827',
          card: '#162032',
          hover: '#1E2A40',
          border: '#243247',
          borderSubtle: 'rgba(255, 255, 255, 0.06)'
        },
        status: {
          healthy: '#10B981',
          healthyBg: 'rgba(16, 185, 129, 0.12)',
          healthyBorder: 'rgba(16, 185, 129, 0.3)',
          warning: '#F59E0B',
          warningBg: 'rgba(245, 158, 11, 0.12)',
          warningBorder: 'rgba(245, 158, 11, 0.3)',
          critical: '#F43F5E',
          criticalBg: 'rgba(244, 63, 94, 0.12)',
          criticalBorder: 'rgba(244, 63, 94, 0.3)',
          info: '#38BDF8',
          infoBg: 'rgba(56, 189, 248, 0.12)',
          infoBorder: 'rgba(56, 189, 248, 0.3)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
