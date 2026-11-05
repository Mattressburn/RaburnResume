/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg-2)',
        line: 'var(--line)',
        line2: 'var(--line-2)',
        fg: 'var(--fg)',
        fg2: 'var(--fg-2)',
        fg3: 'var(--fg-3)',
        accent: 'var(--accent)',
        ok: 'var(--ok)',
      },
      fontFamily: {
        display: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        page: '1200px',
      },
    },
  },
  plugins: [],
};
