/**
 * Shared Tailwind preset — Hediyola premium wedding theme.
 *
 * Palette (PRD §3): off-white background, blush pink, soft gold, champagne,
 * olive green accents, deep charcoal/navy typography.
 * Fonts: Playfair Display (serif headers) + Inter (body).
 *
 * Consumed by both apps/web (Tailwind) and apps/mobile (NativeWind) so brand
 * tokens stay identical across platforms.
 */
/** @type {Partial<import('tailwindcss').Config>} */
module.exports = {
  theme: {
    extend: {
      colors: {
        cream: '#FBF8F4', // off-white background
        blush: {
          50: '#FDF2F4',
          100: '#FBE6EA',
          300: '#F2C2CC',
          500: '#E6A4B4', // primary blush pink
          700: '#C97D90',
        },
        gold: {
          300: '#E9D7A8',
          500: '#D4AF6A', // soft gold accent
          700: '#A9853F',
        },
        champagne: '#F3E9DC',
        olive: {
          400: '#9CA777',
          600: '#74804E', // olive green accent
        },
        ink: {
          DEFAULT: '#2B2B33', // deep charcoal typography
          soft: '#4A4A55',
          navy: '#1F2937',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(43, 43, 51, 0.08)',
        card: '0 4px 20px rgba(201, 125, 144, 0.10)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
};
