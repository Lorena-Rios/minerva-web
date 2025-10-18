/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./js/**/*.js",
    "./src/**/*.{html,js}",
    "./*.html"            // ou ajuste conforme sua estrutura
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'], // usa "Montserrat" como sans
        rawline: ['Rawline', 'sans-serif'], // opcional, alias dedicado
        inter: ['Inter', 'sans-serif']
      },
    },
  },
  plugins: [],
}
