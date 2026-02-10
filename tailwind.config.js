/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        'brand': '#60CED6',
      },
    },
  },
  plugins: [],
}