/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // The dark "desk" the documents sit on
        desk: {
          DEFAULT: '#0c0d10',
          raised: '#131419',
          hover: '#1a1b21',
        },
        // The paper itself
        paper: {
          DEFAULT: '#f6f3ec',
          edge: '#e4ded1',
          ink: '#1d1b18',
          muted: '#6f695e',
          faint: '#a8a194',
        },
        // The AI's ink: used only where the AI is acting
        ink: {
          DEFAULT: '#8b7bff',
          soft: '#b4a9ff',
          deep: '#5b47e0',
        },
      },
    },
  },
  plugins: [],
};
