const theme = {
  // Backgrounds
  bg: '#f0f2f5',           // App background — soft cool gray
  surface: '#ffffff',       // Cards, modals, content areas
  surfaceAlt: '#f7f8fa',   // Header bars, subtle sections
  
  // Primary — teal/emerald accent
  primary: '#0d9488',       // Buttons, links, active states
  primaryLight: '#ccfbf1',  // Hover backgrounds, highlights
  primaryDark: '#0f766e',   // Pressed state
  
  // Success / IN
  success: '#16a34a',       // Green — player IN, confirmations
  successLight: '#dcfce7',  // Light green background
  
  // Danger / OUT / Delete
  danger: '#ef4444',        // Red — delete, remove, OUT
  dangerLight: '#fee2e2',   // Light red background
  
  // Warning
  warning: '#f59e0b',       // Amber — invited, pending
  warningLight: '#fef3c7',  // Light amber background
  
  // Neutrals
  text: '#1e293b',          // Primary text — slate 800
  textSecondary: '#64748b', // Secondary text — slate 500
  textMuted: '#94a3b8',     // Muted/placeholder — slate 400
  border: '#e2e8f0',        // Borders — slate 200
  borderDark: '#cbd5e1',    // Heavier borders — slate 300
  
  // Navbar
  navBg: '#1e293b',         // Dark navbar
  navText: '#94a3b8',       // Navbar icons default
  navTextActive: '#ffffff', // Navbar icons active
  
  // Rank progression — unified teal gradient
  rank: {
    0: '#94a3b8',  // Unranked — slate gray
    1: '#5eead4',  // Bronze — light teal
    2: '#2dd4bf',  // Silver — teal
    3: '#14b8a6',  // Gold — vivid teal
    4: '#0d9488',  // Diamond — deep teal (matches primary)
  },
  rankDefault: '#94a3b8',
  rankAccent: '#0d9488',
};

export default theme;
