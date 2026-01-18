import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        'senior': '1.25rem',
        'senior-lg': '1.5rem',
        'senior-xl': '1.75rem',
        'senior-2xl': '2rem',
      },
    },
  },
  plugins: [],
}
export default config
