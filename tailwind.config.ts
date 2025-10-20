import type { Config } from 'tailwindcss';

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
        }
      }
    }
  },
  plugins: []
};

export default config;
