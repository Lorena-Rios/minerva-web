/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./js/**/*.js",
    "./src/**/*.{html,js}",
    "./*.html"            // ou ajuste conforme sua estrutura
  ],

  safelist: [
    'bg-green-100',
    'border-green-400',
    'bg-red-100',
    'border-red-400',
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
