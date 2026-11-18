/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './src2/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cru: '#FAF3E6',
        'cru-escuro': '#EFE3CC',
        tinta: '#2B2118',
        azul: '#1B4D8C',
        amarelo: '#F4B400',
        vermelho: '#C0392B',
        verde: '#1E7A46',
        terracota: '#B5651D',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['"Work Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
