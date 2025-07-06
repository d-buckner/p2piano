import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const loadingContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  backgroundColor: 'black',
  color: 'white',
});

export const spinner = style({
  width: '40px',
  height: '40px',
  border: '4px solid rgba(255, 255, 255, 0.1)',
  borderTop: '4px solid white',
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
});

export const errorContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: 'black',
  color: 'white',
});

export const errorHeading = style({
  fontSize: '2rem',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: vars.spacing.md,
  fontFamily: vars.fonts.heading,
});

export const errorLink = style({
  color: 'white',
  textDecoration: 'underline',
  
  ':hover': {
    textDecoration: 'none',
  },
});

export const roomGrid = style({
  display: 'grid',
  gridTemplateAreas: '"header" "visual"',
  gridTemplateRows: `${vars.sizes.headerHeight} minmax(0, 1fr)`,
  height: '100%',
});

export const headerArea = style({
  gridArea: 'header',
});

export const visualArea = style({
  gridArea: 'visual',
});
