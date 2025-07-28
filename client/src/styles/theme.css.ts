import { createTheme } from '@vanilla-extract/css';

// Ocean Professional Theme Colors (raw values)
export const oceanTheme = {
  background: '#0a1419',        // Deep ocean depths
  secondary: '#142028',         // Ocean floor
  foreground: '#f0f9ff',        // Foam white
  primary: '#0ea5e9',           // Bright ocean accent
  primaryLight: '#38bdf8',      // Light ocean accent
  primaryDark: '#0284c7',       // Deep ocean blue
  muted: '#cbd5e0',             // Improved contrast muted text
  success: '#10b981',           // Success green
  successLight: '#34d399',      // Light success
  successDark: '#059669',       // Dark success
  danger: '#dc2626',            // Danger red
};

export const [themeClass, vars] = createTheme({
  colors: {
    // Ocean Professional Theme - Room interface (dark)
    background: oceanTheme.background,
    secondary: oceanTheme.secondary,
    foreground: oceanTheme.foreground,
    primary: oceanTheme.primary,
    primaryLight: oceanTheme.primaryLight,
    primaryDark: oceanTheme.primaryDark,
    muted: oceanTheme.muted,
    success: oceanTheme.success,
    successLight: oceanTheme.successLight,
    successDark: oceanTheme.successDark,
    danger: oceanTheme.danger,
  },
  fonts: {
    body: 'Ysabeau, sans-serif',
    heading: 'Ysabeau Office, sans-serif',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  radii: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
  },
  sizes: {
    headerHeight: '2.25rem',
    navbarHeight: '40px',
  },
  overlays: {
    subtle: 'rgba(2, 132, 199, 0.1)',      // Ocean blue tint
    border: 'rgba(156, 163, 175, 0.2)',    // Ocean mist border
    hover: 'rgba(2, 132, 199, 0.15)',      // Ocean blue hover
    active: 'rgba(2, 132, 199, 0.25)',     // Ocean blue active
    borderHover: 'rgba(156, 163, 175, 0.3)', // Brighter mist on hover
    insetShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
  },
  transitions: {
    fast: '0.2s ease',
  },
  breakpoints: {
    mobile: '550px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
});
