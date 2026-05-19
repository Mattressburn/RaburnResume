/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:           '#09090B',
        fg:           '#FAFAFA',
        accent:       '#A3E635',
        'accent-ink': '#000000',
        muted:        '#3F3F46',
        'muted-fg':   '#A1A1AA',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono:    ['"Departure Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderWidth: {
        3: '3px',
      },
    },
  },
  plugins: [],
};
