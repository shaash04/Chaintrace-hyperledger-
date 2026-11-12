/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070D18',
          900: '#0B192C',
          800: '#112239',
          700: '#1E3E62',
          600: '#2A527A',
        },
        teal: {
          500: '#0E8388',
          600: '#0B666A',
          400: '#2E979C',
          300: '#52B2B6',
        }
      }
    },
  },
  plugins: [],
}
