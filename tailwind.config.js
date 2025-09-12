/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        retro: {
          ink: '#0b0b0c',
          cream: '#f8f3e1',
          paper: '#fffdf5',
          line: '#d9cfaf',
          grid: '#e6dcb8',
          mustard:'#e6b800',
          avocado:'#2db38b',
          teal:'#1aa0a4',
          orange:'#ff7a3d',
          cherry:'#d84654',
          plum:'#6e417a',
          sky:'#4aa9d9',
          sun:'#ffbf3f',
          mint:'#55c2a1',
          brown:'#7a5130',
          navy:'#1f3a5b',
        }
      },
      fontFamily: {
        display: ['Shrikhand','system-ui','sans-serif'],
        body: ['Rubik','system-ui','sans-serif'],
      },
    },
  },
  plugins: [],
};
