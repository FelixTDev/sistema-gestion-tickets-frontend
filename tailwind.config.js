/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ink-900': '#06243a',
        'ink-800': '#0b4963',
        ink: '#102a43',
        muted: '#526875',
        turq: '#078f98',
        'turq-dark': '#067179',
        green: '#8bc63e',
        'green-dark': '#6ba22a',
        surface: '#f4f7f8',
        line: '#e2e9ec',
        danger: '#c62828',
        warn: '#c47a00',
        info: '#0b4963',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'gnb-fade': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'gnb-pop': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(10px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'gnb-shimmer': {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'gnb-blink': {
          '0%, 80%, 100%': { opacity: '0.25', transform: 'translateY(0)' },
          '40%': { opacity: '1', transform: 'translateY(-3px)' },
        },
      },
      animation: {
        'gnb-fade': 'gnb-fade 0.4s ease both',
        'gnb-pop': 'gnb-pop 0.22s ease both',
        'gnb-shimmer': 'gnb-shimmer 1.4s infinite linear',
        'gnb-blink': 'gnb-blink 1.2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
