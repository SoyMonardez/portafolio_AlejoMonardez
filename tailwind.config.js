/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Display: Bodoni Moda (didona de revista). Body/UI: Inter.
        serif: ['"Bodoni Moda"', 'Didot', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        // Firma manuscrita del hero (un solo peso, uso puntual)
        script: ['"Mrs Saint Delafield"', 'cursive'],
      },
      colors: {
        // "Revista impresa en negativo": papel cálido sobre tinta.
        // Redefinimos `white` para que TODO el sitio (text-white, bg-white,
        // border-white/N) herede el papel cálido sin tocar cada clase.
        white: '#EDE9E3',
        marfil: '#FFFFFF', // escape hatch: blanco puro solo si hace falta
        brand: {
          bg: '#0a0a0a',        // tinta
          text: '#EDE9E3',      // papel
          muted: '#9C978F',     // humo
          accent: '#EDE9E3',
        }
      },
      scale: {
        '200': '2.00',
      }
    },
  },
  plugins: [],
}
