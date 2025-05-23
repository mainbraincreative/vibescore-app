import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        light: {
          background: '#FFFFFF',
          foreground: '#1A1A1A',
          red: '#FB3A43',
          green: '#0FDD4D',
          yellow: '#FFD266',
          card: '#F9FAFB',
          border: '#E5E7EB',
        },
        dark: {
          background: '#0D0D0D',
          foreground: '#F2F2F2',
          red: '#FB3A43',
          green: '#0FDD4D',
          yellow: '#FFDA7B',
          card: '#1A1A1A',
          border: '#333333',
        },
      },
      backgroundImage: {
        'score-gradient-light': 'linear-gradient(90deg, #FB3A43 0%, #FFD266 50%, #0FDD4D 100%)',
        'score-gradient-dark': 'linear-gradient(90deg, #FB3A43 0%, #FFDA7B 50%, #0FDD4D 100%)',
      },
    },
  },
  
  plugins: [],
  darkMode: 'class',
}

export default config;
