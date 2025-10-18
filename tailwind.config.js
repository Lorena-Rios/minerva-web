/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}", 
    "./*.html"            // ou ajuste conforme sua estrutura
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'], // usa "Montserrat" como sans
        rawline: ['Rawline', 'sans-serif'] // opcional, alias dedicado
      },
    },
  },
  plugins: [],
}
