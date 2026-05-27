/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', '"Bodoni Moda"', 'serif'],
        sans: ['"Inter"', '"Montserrat"', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#0a0a0a',
          text: '#f5f5f5',
          accent: '#ffffff',
        }
      },
      scale: {
        '200': '2.00',
      }
    },
  },
  plugins: [],
}
