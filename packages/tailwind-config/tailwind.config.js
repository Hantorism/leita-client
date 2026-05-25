module.exports = {
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
