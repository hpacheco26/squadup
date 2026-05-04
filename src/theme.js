const theme = {
  // Backgrounds
  bg: 'var(--c-bg)',
  surface: 'var(--c-surface)',
  surfaceAlt: 'var(--c-surface-alt)',

  // Primary
  primary: 'var(--c-primary)',
  primaryLight: 'var(--c-primary-light)',
  primaryDark: 'var(--c-primary-dark)',
  primaryShadow: 'var(--c-primary-a15)',

  // Success / IN
  success: 'var(--c-success)',
  successLight: 'var(--c-success-light)',
  successShadow: 'var(--c-success-a15)',

  // Danger / OUT / Delete
  danger: 'var(--c-danger)',
  dangerLight: 'var(--c-danger-light)',

  // Warning
  warning: 'var(--c-warning)',
  warningLight: 'var(--c-warning-light)',

  // Text
  text: 'var(--c-text)',
  textSecondary: 'var(--c-text-secondary)',
  textMuted: 'var(--c-text-muted)',

  // Borders
  border: 'var(--c-border)',
  borderDark: 'var(--c-border-strong)',

  // Navbar (always dark in both modes)
  navBg: 'var(--c-nav-bg)',
  navText: '#94a3b8',
  navTextActive: '#ffffff',

  // Rank progression — distinct tiers (vivid colours work on both modes)
  rank: {
    0: '#c0c0c0',
    1: '#14b8a6',
    2: '#3b82f6',
    3: '#9b59b6',
    4: '#f0c832',
  },
  rankDefault: '#c0c0c0',
  rankAccent: '#f0c832',
};

export default theme;
