/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8b6f47',
          dark: '#6b5637',
          light: '#a38b6a',
        },
        background: '#fafaf9',
        surface: '#ffffff',
        text: {
          DEFAULT: '#292524',
          muted: '#78716c',
          light: '#a8a29e',
        },
        border: {
          DEFAULT: '#e7e5e4',
          light: '#f5f5f4',
        },
      },
    },
  },
  plugins: [],
}
