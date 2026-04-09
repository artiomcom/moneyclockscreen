export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        r80: '4px',
        'r80-sm': '2px'
      },
      fontFamily: {
        arcade: ['"VT323"', 'ui-monospace', 'monospace']
      }
    }
  }
};
