/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F8E9C7',        // Background Pastel Orange
          primary: '#2B477D',   // Primary Blue
          secondary: '#ADD8E6', // Light Blue
          accent: '#FFD166',    // Golden Yellow
          success: '#4CAF50',   // Green
          danger: '#F25F5C',    // Soft Red
          card: '#FFFFFF',      // Cards White
        }
      },
      boxShadow: {
        'card': '0 10px 30px rgba(43, 71, 125, 0.08)',
        'card-glow': '0 12px 36px rgba(43, 71, 125, 0.16)',
        'card-hover': '0 16px 40px rgba(43, 71, 125, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
