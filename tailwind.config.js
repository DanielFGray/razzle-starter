const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./src/**/*.tsx'],
  mode: 'jit',
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...colors,
        gray: colors.trueGray,
      },
      animation: {
        'spin-xslow': 'spin 15s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@danielfgray/tw-heropatterns'),
  ],
}
