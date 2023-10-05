/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      fontFamily: {
        jostregular: 'Jost',
        jostbold: 'JostBold',
        varela: 'Varela'
      },
      colors: {
        'primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'secondary': 'rgb(var(--color-secondary) / <alpha-value>)',
        'tertiary': 'rgb(var(--color-tertiary) / <alpha-value>)',
        'quaternary': 'rgb(var(--color-quaternary) / <alpha-value>)',
        'error': 'rgb(var(--color-error) / <alpha-value>)'
      }
    },
  },
  plugins: [],
}

