import { createTheme } from '@vanilla-extract/css';


export const [themeClass, vars] = createTheme({
  colors: {
    background: '#000',
    secondary: '#424242',
    foreground: '#FFF',
    primary: '#FFF',
    muted: '#666',
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
});