import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f7ff',
          100: '#e1edff',
          200: '#b9d2ff',
          300: '#88b4ff',
          400: '#5d94ff',
          500: '#306eff',
          600: '#1851db',
          700: '#123cab',
          800: '#102c7b',
          900: '#0c1d4c'
        },
        editor: {
          background: '#f8fafc',
          surface: '#ffffff',
          accent: '#1851db',
          muted: '#1e293b',
          subtle: '#e2e8f0',
          warning: '#f97316',
          success: '#16a34a',
          danger: '#dc2626'
        }
      },
      fontFamily: {
        editorial: ['"IBM Plex Serif"', 'serif', ...defaultTheme.fontFamily.serif],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono]
      },
      boxShadow: {
        editorial: '0 25px 50px -25px rgba(15, 23, 42, 0.35)'
      },
      borderRadius: {
        editorial: '1.75rem'
      },
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite'
      },
      keyframes: {
        pulse: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.65' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: [
    plugin(({ addComponents, addUtilities }) => {
      addComponents({
        '.editor-card': {
          '@apply rounded-editorial bg-editor-surface shadow-editorial ring-1 ring-editor-subtle': {}
        },
        '.editor-toolbar': {
          '@apply flex flex-wrap items-center justify-between gap-3 border-b border-editor-subtle bg-editor-background/60 px-6 py-4 backdrop-blur': {}
        }
      });
      addUtilities({
        '.editor-grid': {
          'grid-template-columns': 'minmax(0, 1fr) 28rem'
        }
      });
    })
  ]
};

export default config;
