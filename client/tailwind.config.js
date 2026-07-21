/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
      },
      // 整体放大基础字号（用户反馈"整体页面字体变小了"，再放大一档到舒服的尺度）
      // base 19px / sm 17px / xs 15px / lg 21px / xl 23px / 2xl 27px / 3xl 33px
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
