import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
// Shared brand preset (palette + fonts) used across web and mobile.
import preset from '@hediyola/config/tailwind';

const config: Config = {
  presets: [preset as Partial<Config>],
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    // Pull class names used by shared UI helpers, if any.
    '../../packages/shared/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Wire next/font (layout.tsx) CSS variables to the brand font families
      // so Playfair/Inter actually apply (preset declares the literal names).
      fontFamily: {
        serif: ['var(--font-playfair)', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [animate],
};

export default config;
