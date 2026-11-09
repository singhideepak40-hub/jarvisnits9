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
        cyber: {
          bg: '#050811',
          panel: '#090F1E',
          card: '#0D162B',
          border: '#152445',
          cyan: '#00F2FE',
          blue: '#4FACFE',
          red: '#FF2A55',
          amber: '#FF9F1C',
          green: '#00F0A0',
          purple: '#9B51E0',
          text: '#E2E8F0',
          muted: '#8A99AD'
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 242, 254, 0.45)',
        'neon-red': '0 0 20px rgba(255, 42, 85, 0.55)',
        'neon-amber': '0 0 15px rgba(255, 159, 28, 0.45)',
        'neon-green': '0 0 15px rgba(0, 240, 160, 0.45)',
        'hud-card': '0 4px 20px -2px rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(0, 242, 254, 0.15)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'ripple': 'rippleWave 2s ease-out infinite'
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        rippleWave: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1.3)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}
