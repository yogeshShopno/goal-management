/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'primary-hover': 'var(--color-primary-hover)',
        success: 'var(--color-success)',
        'success-light': 'var(--color-success-light)',
        warning: 'var(--color-warning)',
        'warning-light': 'var(--color-warning-light)',
        danger: 'var(--color-danger)',
        'danger-light': 'var(--color-danger-light)',
        muted: 'var(--color-muted)',
        surface: 'var(--color-bg)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        'border-active': 'var(--color-border-active)',
        ink: 'var(--color-text)',
        'ink-muted': 'var(--color-text-muted)',
        'ink-light': 'var(--color-text-light)',
        'progress-track': 'var(--color-progress-track)',
        'priority-high': 'var(--color-priority-high)',
        'priority-medium': 'var(--color-priority-medium)',
        'priority-low': 'var(--color-priority-low)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
    },
  },
  plugins: [],
};
