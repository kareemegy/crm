/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '420px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    extend: {
      // Notion-inspired neutrals + a single accent.
      colors: {
        ink: {
          // Light mode surfaces/text
          bg:      '#ffffff',
          surface: '#fafaf9',
          border:  '#ebebea',
          text:    '#202124',
          muted:   '#6b7280',
        },
        night: {
          // Dark mode surfaces/text (Notion-ish #191919)
          bg:      '#191919',
          surface: '#202020',
          raised:  '#2a2a2a',
          border:  '#2f2f2f',
          text:    '#e6e6e6',
          muted:   '#8a8a8a',
        },
        accent: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca'
        }
      },
      boxShadow: {
        'soft':  '0 1px 2px rgba(15, 15, 15, 0.04), 0 1px 3px rgba(15, 15, 15, 0.06)',
        'popup': '0 10px 30px rgba(15, 15, 15, 0.10), 0 4px 10px rgba(15, 15, 15, 0.06)'
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: 0 },  '100%': { opacity: 1 } },
        scaleIn:  { '0%': { opacity: 0, transform: 'scale(0.97)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        slideUp:  { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } }
      },
      animation: {
        'fade-in':  'fadeIn  180ms ease-out',
        'scale-in': 'scaleIn 180ms ease-out',
        'slide-up': 'slideUp 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'pulse-dot':'pulseDot 1.6s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
