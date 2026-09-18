/** @type {import('tailwindcss').Config} */
module.exports = {
  important: false,
  content: [
    './app/**/*.{js,ts,jsx,tsx,scss,css}',
    // Monorepo checkout: scan live engine source (matches nothing standalone).
    '../theme-engine/src/**/*.{js,ts,jsx,tsx}',
    // Standalone (registry install): scan the engine's pre-built dist.
    './node_modules/@salla.sa/twilight-theme-engine/dist/**/*.js',
    './node_modules/@salla.sa/twilight-tailwind-theme/safe-list-css.txt',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    container: {
      center: true,
      padding: '10px',
      screens: {
        '2xl': '1280px',
      },
    },
    fontFamily: {
      sans: ['var(--font-main)', '-apple-system', 'BlinkMacSystemFont'],
      primary: 'var(--font-main)',
    },
    extend: {
      transitionTimingFunction: {
        // Motion-law tokens (app/styles/tokens.css). `elastic` stays for the
        // engine's classes; app/ must not use it.
        out: 'var(--ease-out)',
        in: 'var(--ease-in)',
        'in-out': 'var(--ease-in-out)',
        elastic: 'cubic-bezier(0.55, 0, 0.1, 1)',
      },
      gridTemplateColumns: {
        'auto-fill': 'repeat(auto-fill, 290px)',
      },
      colors: {
        // Engine classes use these names; pointing them at the token sheet
        // makes Salla's own components match the OptimalX bands.
        dark: 'var(--ox-graphite)',
        darker: '#0F0F12',
        danger: 'var(--ox-stop)',
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        // OptimalX palette and role tokens (app/styles/tokens.css). Plain var()
        // so a runtime change to --color-primary (engine applyTheme) follows.
        ox: {
          paper: 'var(--ox-paper)',
          card: 'var(--ox-card)',
          plate: 'var(--ox-plate)',
          plate2: 'var(--ox-plate-2)',
          graphite: 'var(--ox-graphite)',
          graphite2: 'var(--ox-graphite-2)',
          graphite3: 'var(--ox-graphite-3)',
          ink: 'var(--ox-ink)',
          ink2: 'var(--ox-ink-2)',
          ink3: 'var(--ox-ink-3)',
          ink4: 'var(--ox-ink-4)',
          line: 'var(--ox-line)',
          line2: 'var(--ox-line-2)',
          line3: 'var(--ox-line-3)',
          accent: 'var(--ox-accent)',
          accentSoft: 'var(--ox-accent-soft)',
          onAccent: 'var(--ox-on-accent)',
          go: 'var(--ox-go)',
          goSoft: 'var(--ox-go-soft)',
          note: 'var(--ox-note)',
          noteSoft: 'var(--ox-note-soft)',
          stop: 'var(--ox-stop)',
          stopSoft: 'var(--ox-stop-soft)',
          fg: 'var(--ox-fg)',
          fg2: 'var(--ox-fg-2)',
          fg3: 'var(--ox-fg-3)',
          bg: 'var(--ox-bg)',
          surface: 'var(--ox-surface)',
          bd: 'var(--ox-bd)',
        },
      },
      spacing: {
        3.75: '15px',
        7.5: '30px',
        58: '232px',
        62: '248px',
        100: '28rem',
        116: '464px',
        132: '528px',
        200: '800px',
      },
      borderRadius: {
        // The scaffold's `large: 22px`, `big: 40px` and `tiny: 3px` were removed
        // 2026-09-16: zero uses across app/ and the engine dist. Dead tokens
        // read as a scale to anyone new, and they were not one.
        //
        // The brand radius. `rounded` resolves here, and the content globs above
        // scan the engine's dist as well as app/ — so this one value styles our
        // markup AND Salla's own components (s-product-card, s-button-element).
        // 274 call sites at the time of writing: 78 in app/, 196 in the engine.
        // 8px rather than the scaffold's 16px: it reads considered instead of
        // friendly, and pairs with the 6px already used on small elements, so the
        // scale reads 6 / 8 / pill instead of 6 / 16 / pill.
        DEFAULT: '8px',
        sm: '6px',
        full: '9999px',
      },
      fontSize: {
        'icon-lg': '33px',
        xxs: '10px',
        xxxs: '8px',
        'title-size': '42px',
        '22px': '22px',
        // Fluid type scale, 390 to 1440, linear between (DIRECTION 3.1).
        // Line-heights are Arabic-safe: display never below 1.15, headings 1.2+.
        display: ['clamp(34px, 25.83px + 2.095vw, 56px)', { lineHeight: '1.15' }],
        h1: ['clamp(28px, 23.54px + 1.143vw, 40px)', { lineHeight: '1.2' }],
        h2: ['clamp(24px, 21.03px + 0.762vw, 32px)', { lineHeight: '1.25' }],
        h3: ['clamp(18px, 17.26px + 0.190vw, 20px)', { lineHeight: '1.4' }],
        lead: ['clamp(17px, 15.89px + 0.286vw, 20px)', { lineHeight: '1.6' }],
        body: ['clamp(15px, 14.63px + 0.095vw, 16px)', { lineHeight: '1.7' }],
        small: ['clamp(13px, 12.63px + 0.095vw, 14px)', { lineHeight: '1.6' }],
        micro: ['clamp(11.5px, 11.31px + 0.048vw, 12px)', { lineHeight: '1.5' }],
      },
      lineHeight: {
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        18: '4.5rem',
        20: '5rem',
      },
      boxShadow: {
        // Scaffold names kept for engine compatibility; values come from the
        // three-shadow sheet (raised / floating / panel). `progress` (teal,
        // unused) and `mobile` (an eight-layer shadow) were removed.
        default: 'var(--ox-shadow-1)',
        light: 'var(--ox-shadow-1)',
        dropdown: 'var(--ox-shadow-1)',
        md: 'var(--ox-shadow-2)',
        top: 'var(--ox-shadow-2)',
        huge: 'var(--ox-shadow-3)',
      },
      width: {
        18: '4.5rem',
        22: '5.5rem',
        74: '18.5rem',
        76: '19rem',
        78: '19.5rem',
      },
      height: {
        banner: '200px',
        'lg-banner': '428px',
        'full-banner': '600px',
        500: '500px',
        460: '460px',
      },
      minWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      zIndex: {
        1: '1',
        2: '2',
        '-1': '-1',
      },
      screens: {
        xxs: { min: '380px', max: '479px' },
        xs: '480px',
      },
      backgroundOpacity: {
        '05': '0.05',
      },
      transitionProperty: {
        height: 'height',
      },
      keyframes: {
        slideUpFromBottom: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0%)', opacity: '1' },
        },
        slideDownFromBottom: {
          '0%': { transform: 'translateY(0%)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
      animation: {
        slideUpFromBottom: 'slideUpFromBottom var(--dur-slow) var(--ease-out)',
        slideDownFromBottom: 'slideDownFromBottom var(--dur-slow) var(--ease-in)',
      },
    },
  },
  corePlugins: {
    outline: false,
  },
  plugins: [require('@salla.sa/twilight-tailwind-theme'), require('@tailwindcss/forms')],
};
