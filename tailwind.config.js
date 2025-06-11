/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,css}",
    "./src/html/**/*.html",
    "./src/javascript/**/*.js",
    "./src/input.css"
  ],
  theme: {
    extend: {
      colors: {
        mainblue: '#1B3C5F',
        secondaryblue: '#4A6FA5',
        bgblue: '#F5F7FA',
      }
    },
  },
  plugins: [],
}