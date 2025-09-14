/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wordle': {
          'green': '#6aaa64',
          'orange': '#c9b458', 
          'grey': '#787c7e',
          'light-grey': '#d3d6da',
          'dark-grey': '#3a3a3c',
        }
      },
      spacing: {
        '14': '3.5rem',
      }
    },
  },
  plugins: [],
}