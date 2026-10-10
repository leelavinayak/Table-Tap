/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0c1014',
        char: '#212529',
        mute: '#585f66',
        line: '#e7e8e9',
        soft: '#f3f4f5',
        cream: '#f8f9fa'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
