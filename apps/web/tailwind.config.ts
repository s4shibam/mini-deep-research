import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        soft: '0 12px 40px rgba(17, 24, 39, 0.08)'
      }
    }
  },
  plugins: []
}

export default config
