/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,ts,tsx}',
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
};
