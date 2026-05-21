export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        gold:    { DEFAULT: '#D4A843', dark: '#B8922E', light: '#E8C56A' },
        navy:    { DEFAULT: '#0D1B2A', card: '#152535', light: '#1E3448', border: '#243D55' },
        brand:   { bg: '#0A1520' },
      },
    },
  },
  plugins: [],
}
