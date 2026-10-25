/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F7F5EF',
          surface: '#E9EDE4',
          subtle: '#DCE3D7',
        },
        green: {
          primary: '#285748',
          hover: '#1e4337',
          dark: '#16332a',
          light: '#356f5c',
        },
        ink: {
          DEFAULT: '#192B2A',
          secondary: '#52605A',
          muted: '#718079',
          light: '#8E9D97',
        },
        rule: {
          DEFAULT: '#D9DCD2',
          dark: '#c4c8bc',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
