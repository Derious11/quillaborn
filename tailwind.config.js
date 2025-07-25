module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2E7D5A",
        primaryDark: "#215C43",
        softWhite: "#F9F9F7",
        ink: "#1B1B1B",
        stone: "#D6D3D1",
        gold: "#C6A664",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Lexend", "sans-serif"],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}