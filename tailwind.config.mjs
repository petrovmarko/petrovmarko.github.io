/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#ffffff',
        surface: '#f7f7f7',
        border:  '#e6e6e6',
        accent:  '#2a7ae2',
        'accent-hover': '#1856a8',
        'text-primary': '#252a2e',
        'text-muted':   '#5e616a',
        'text-faint':   '#8a8d93',
      },
      fontFamily: {
        sans: ['"Source Sans Pro"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
      maxWidth: {
        page: '1100px',
        prose: '720px',
      },
    },
  },
  plugins: [],
};
