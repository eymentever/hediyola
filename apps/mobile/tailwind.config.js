// NativeWind Tailwind config — shares the Hediyola brand preset with web.
const preset = require('@hediyola/config/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
