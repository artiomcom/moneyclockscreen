export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        r80: '4px',
        'r80-sm': '2px'
      },
      colors: {
        /* Magic Patterns, как в исходнике (bg-deep + grid-bg) */
        deep: '#060a13',
        'mp-deep': '#060a13',
        'mp-base': '#0a0e17',
        'mp-card': '#0d1320',
        'mp-elevated': '#111827',
        'neon-green': '#00ff88',
        'neon-cyan': '#00d4ff',
        'neon-amber': '#ffb800',
        'mp-text': '#e8ecf4',
        'mp-muted': '#7a8ba7',
        'mp-faint': '#4a5568'
      },
      fontFamily: {
        arcade: ['"VT323"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      }
    }
  }
};
