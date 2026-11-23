/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Refined transportation palette: Deep Slate / Navy + Precision Fleet Blue
        brand: {
          50:  '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#38a5f6',
          500: '#0f85ea',
          600: '#0267d2', // Core Fleet Blue
          700: '#0352ab',
          800: '#07458c',
          900: '#0c3a74',
          950: '#08254d',
        },
        sidebar: {
          bg:     '#0b1324', // Deep Maritime Navy
          hover:  '#15223e',
          text:   '#8ba1c1',
          muted:  '#506788',
          border: 'rgba(255,255,255,0.08)',
        },
        surface: {
          DEFAULT: '#ffffff',
          soft:    '#f8fafc',
          muted:   '#f1f5f9',
          subtle:  '#f4f6f9',
        },
        // Operational semantics
        operational: {
          blue:   '#0267d2', // Dispatched / In-Transit
          teal:   '#0d9488', // Telemetry Sync / Verified
          emerald:'#059669', // Available / Completed
          amber:  '#d97706', // In Workshop / Maintenance
          rose:   '#dc2626', // Critical / Cancelled / Suspended
          slate:  '#475569', // Draft / Off-duty
        },
        border: {
          DEFAULT: '#e2e8f0',
          subtle:  '#edf2f7',
          card:    '#e2e8f0',
          strong:  '#cbd5e1',
          input:   '#d1d5db',
          focus:   '#0267d2',
        },
        content: {
          primary:   '#0f172a',
          secondary: '#334155',
          muted:     '#64748b',
          disabled:  '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'xs':      '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'card':    '0 1px 3px 0 rgb(15 23 42 / 0.05), 0 1px 2px -1px rgb(15 23 42 / 0.03)',
        'card-md': '0 4px 14px -2px rgb(15 23 42 / 0.07), 0 2px 6px -2px rgb(15 23 42 / 0.04)',
        'card-lg': '0 12px 32px -4px rgb(15 23 42 / 0.10), 0 4px 12px -4px rgb(15 23 42 / 0.05)',
        'navbar':  '0 1px 0 0 #e2e8f0',
        'sidebar': '4px 0 24px 0 rgb(0 0 0 / 0.22)',
        'dropdown':'0 12px 40px -4px rgb(15 23 42 / 0.12), 0 4px 16px -4px rgb(15 23 42 / 0.06)',
        'btn':     '0 1px 2px 0 rgb(2 103 210 / 0.35)',
      },
      backgroundImage: {
        'fleet-pattern': 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        'nav-active': 'linear-gradient(90deg, rgba(2, 103, 210, 0.22) 0%, rgba(2, 103, 210, 0.04) 100%)',
      },
      transitionDuration: {
        '250': '250ms',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      width: {
        'sidebar':           '260px',
        'sidebar-collapsed': '68px',
      },
    },
  },
  plugins: [],
}
