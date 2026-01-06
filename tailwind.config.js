/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.05) inset',
        'glass-lg': '0 24px 48px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
        'glow-purple': '0 0 30px rgba(168,85,247,0.4)',
        'glow-green': '0 0 30px rgba(16,185,129,0.4)',
        'glow-red': '0 0 30px rgba(239,68,68,0.4)',
      },
    },
  },
  plugins: [],
}
