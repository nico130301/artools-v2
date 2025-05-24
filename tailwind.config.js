/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/html/**/*.html",
    "./src/html/**/*.js",
    "./src/javascript/**/*.js"
  ],
  theme: {
    extend: {
      colors:{
        mainblue: '#1B3C5F',      // Darker navy blue - for header and primary elements
        secondaryblue: '#4A6FA5', // Softer medium blue - for interactive elements
        bgblue: '#F5F7FA',  
      }
    },
  },
  plugins: [],
}