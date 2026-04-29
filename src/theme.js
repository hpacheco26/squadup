const theme = {
  // Backgrounds
  bg: '#f0f2f5',           // App background — soft cool gray
  surface: '#ffffff',       // Cards, modals, content areas
  surfaceAlt: '#f7f8fa',   // Header bars, subtle sections
  
  // Primary — slate blue accent
  primary: '#5b7bb3',       // Buttons, links, active states
  primaryLight: '#dbe4f0',  // Hover backgrounds, highlights
  primaryDark: '#4a6694',   // Pressed state
  
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
  
  // Rank progression — distinct tiers
  rank: {
    0: '#c0c0c0',  // Novice — silver
    1: '#14b8a6',  // Amateur — turquoise green
    2: '#3b82f6',  // Intermediate — blue
    3: '#9b59b6',  // Pro — purple
    4: '#f0c832',  // Legend — gold
  },
  rankDefault: '#c0c0c0',
  rankAccent: '#f0c832',
};

export default theme;
