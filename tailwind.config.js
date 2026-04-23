/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./src/**/*.html",
    "./src/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Satoshi', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          navy: '#091a39',
          deep: '#002469',
          blue: '#00669e',
          sky: '#64a1d1',
          ink: '#111827',
          slate: '#374151',
          line: '#e5e7eb',
          surface: '#f1f5f9'
        }
      },
      maxWidth: {
        '7xl': '80rem',
        'screen-xl': '1280px'
      },
      boxShadow: {
        'soft': '0 1px 2px 0 rgb(15 23 42 / 0.04)'
      }
    }
  },
  plugins: []
};
