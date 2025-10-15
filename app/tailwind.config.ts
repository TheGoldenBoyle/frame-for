import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
      },
    },
  },
  plugins: [],
}
export default config
