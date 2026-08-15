/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A1E',
        parchment: {
          bg: '#F9F8F6',
          card: '#FFFFFF',
          raised: '#F3F1ED',
          border: '#E8E6E1',
          text: '#1A1A1E',
          subtext: '#6E6E78',
          aiBg: '#FAF6F0',
          aiBorder: '#E6DEC6',
        },
      },
      borderRadius: {
        'parchment-control': '9px',
        'parchment-surface': '12px',
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        serif: ["'Source Serif Pro'", "Georgia", "Noto Serif SC", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        'xs': ['15px', { lineHeight: '20px' }],
        'sm': ['17px', { lineHeight: '24px' }],
        'base': ['19px', { lineHeight: '28px' }],
        'lg': ['21px', { lineHeight: '30px' }],
        'xl': ['23px', { lineHeight: '32px' }],
        '2xl': ['27px', { lineHeight: '36px' }],
        '3xl': ['33px', { lineHeight: '42px' }],
      },
    },
  },
  plugins: [],
}
