/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FBF7F2',
        surface: '#FFFFFF',
        'surface-alt': '#F5EEE6',
        border: '#E8DDD0',
        text: '#2A1015',
        muted: '#6B5A55',
        primary: {
          DEFAULT: '#7B1E3A',
          hover: '#5E1229',
          soft: '#F8ECEF',
        },
        gold: {
          DEFAULT: '#B8893B',
          hover: '#9A7230',
          soft: '#F7EDD8',
          text: '#8A6420',
        },
        score: {
          low: {
            bg: '#EFE7E1',
            text: '#6B5A55',
          },
        },
        dark: {
          start: '#2A1015',
          end: '#4A1527',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        luxury: '0 1px 2px rgba(42, 16, 21, 0.05)',
        'luxury-hover': '0 8px 24px rgba(123, 30, 58, 0.12)',
      },
      borderRadius: {
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
