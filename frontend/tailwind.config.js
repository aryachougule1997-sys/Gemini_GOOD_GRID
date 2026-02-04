/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#0f0f23',
          surface: '#1a1a2e',
          primary: '#4CAF50',
          secondary: '#FF9800',
          accent: '#2196F3',
          legendary: '#ff6b35',
          epic: '#9c27b0',
          rare: '#2196f3',
          common: '#757575'
        }
      },
      fontFamily: {
        game: ['Courier New', 'monospace']
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        'pulse-glow': {
          '0%': { boxShadow: '0 0 5px rgba(76, 175, 80, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(76, 175, 80, 0.8)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}