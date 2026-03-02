/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Base
        bg: '#FAFAF7',
        bgWarm: '#F5F3EE',
        card: '#FFFFFF',
        cardAlt: '#F8F7F4',
        cream: '#F0EDE6',

        // Typography
        ink: '#1A1A1A',
        inkSoft: '#3D3D3D',
        inkMuted: '#8A8A82',
        inkLight: '#B5B5AD',

        // Accent
        accent: '#C4785C',
        accentSoft: '#D4967E',
        accentBg: '#FDF6F3',

        // Semantic
        sage: '#7A8F7A',
        sageSoft: '#9BAF9B',
        sageBg: '#F2F5F2',
        navy: '#2C3E50',
        navySoft: '#4A6274',
        rose: '#C9928A',
        roseBg: '#FBF3F1',
        slate: '#64748B',

        // Borders & Shadows
        border: '#E8E6E0',
        borderLight: '#F0EEE8',

        // Category Colors
        catFood: '#C4785C',
        catTransport: '#4A6274',
        catEntertain: '#C9928A',
        catDaily: '#7A8F7A',
        catClothing: '#64748B',
        catComm: '#8A8A82',
        catHousing: '#2C3E50',
        catUtility: '#9BAF9B',
      },
      fontFamily: {
        serif: ['Georgia', 'Hiragino Mincho ProN', 'Noto Serif JP', 'serif'],
        sans: ['Hiragino Sans', 'Noto Sans JP', '-apple-system', 'sans-serif'],
      },
      spacing: {
        screen: 20,
        card: 24,
        section: 24,
        item: 16,
      },
      borderRadius: {
        card: 20,
        button: 16,
      },
    },
  },
  plugins: [],
};
