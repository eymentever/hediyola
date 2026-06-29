/**
 * Shared Tailwind preset — Hediyola premium wedding theme.
 *
 * Palette (PRD §3): Sleek & Simple Luxury Theme.
 * Background: Alabaster / Silk Off-white.
 * Primary: Sleek Zinc/Charcoal (replacing the pink blush for a premium look).
 * Accent: Polished Champagne Gold.
 *
 * Consumed by both apps/web (Tailwind) and apps/mobile (NativeWind) so brand
 * tokens stay identical across platforms.
 */
/** @type {Partial<import('tailwindcss').Config>} */
module.exports = {
  theme: {
    extend: {
      colors: {
        cream: '#FAF9F6', // Alabaster/Silk background
        blush: {
          50: '#F4F4F5',  // Neutral light gray
          100: '#E4E4E7', // Neutral gray
          300: '#71717A', // Slate gray
          500: '#18181B', // Sleek Zinc-900 / Primary Brand Charcoal
          700: '#09090B', // Pitch Black
        },
        gold: {
          300: '#E2D4C0', // Soft Champagne
          500: '#C5A880', // Polished Gold Accent
          700: '#A3865F', // Deep Bronze
        },
        champagne: '#F4F3EF',
        olive: {
          400: '#D4D4D8',
          600: '#52525B',
        },
        ink: {
          DEFAULT: '#111111', // Deep Charcoal
          soft: '#555555',    // Soft Charcoal
          navy: '#09090B',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',  // Sleeker, smaller borders
        '2xl': '1rem',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.03)', // Subtle, modern minimal shadows
        card: '0 2px 12px rgba(0, 0, 0, 0.02)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
      },
    },
  },
};
