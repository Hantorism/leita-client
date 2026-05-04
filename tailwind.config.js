module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        Pretendard: ['Pretendard', 'sans-serif'],
        JetBrain: ['JetBrain Mono', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
