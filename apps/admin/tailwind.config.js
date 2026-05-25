const baseConfig = require('@leita/tailwind-config');

module.exports = {
  ...baseConfig,
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
  ],
};
