/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './assets/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'wp-admin': '#f0f0f1',
        'wp-primary': '#2271b1',
        'wp-secondary': '#135e96',
        'wp-accent': '#72aee6',
      },
    },
  },
  plugins: [],
}; 