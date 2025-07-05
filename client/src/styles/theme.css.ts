import { createTheme } from '@vanilla-extract/css';


export const [themeClass, vars] = createTheme({
  colors: {
    background: '#000',
    secondary: '#424242',
    foreground: '#FFF',
    primary: '#FFF',
    muted: '#666',
    success: '#3087cf',
    successLight: '#5ba3db',
    successDark: '#047857',
    danger: '#dc2626',
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
  },
  overlays: {
    subtle: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(255, 255, 255, 0.1)',
    active: 'rgba(255, 255, 255, 0.2)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
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