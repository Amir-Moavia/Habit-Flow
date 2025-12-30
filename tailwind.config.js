/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669', // Primary Brand Color
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        'surface': {
          DEFAULT: '#ffffff',
          'subtle': '#f8fafc', // Slate 50
          'muted': '#f1f5f9',   // Slate 100
        },
        'text': {
          'primary': '#0f172a', // Slate 900
          'secondary': '#64748b', // Slate 500
          'tertiary': '#94a3b8',  // Slate 400
        }
      }
    },
  },
  plugins: [],
}
