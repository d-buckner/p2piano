import { createTheme } from '@vanilla-extract/css';


export const [themeClass, vars] = createTheme({
  colors: {
    background: '#111827',        // Dark ocean depth
    secondary: '#1f2937',         // Lighter ocean depth
    foreground: '#f3f4f6',        // Light foam/spray
    primary: '#0284c7',           // Ocean blue primary
    primaryLight: '#0ea5e9',      // Lighter ocean blue  
    primaryDark: '#0369a1',       // Darker ocean blue
    muted: '#9ca3af',            // Ocean mist
    success: '#10b981',          // Ocean green (for active states)
    successLight: '#34d399',     // Light ocean green
    successDark: '#059669',      // Dark ocean green
    danger: '#dc2626',           // Keep red for warnings/recording
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
