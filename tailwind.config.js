/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.tsx',
    './pages/**/*.tsx',
    './utils/**/*.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      colors: {
        brand: {
          teal: '#14b8a6',    /* Teal 500 */
          dark: '#0f172a',    /* Slate 900 */
          slate: '#1e293b',   /* Slate 800 */
          light: '#f8fafc',   /* Slate 50 */
        },
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
};
