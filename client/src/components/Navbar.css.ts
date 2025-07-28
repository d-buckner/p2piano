import { style } from '@vanilla-extract/css';


export const navbar = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '60px',
  padding: '0 2rem',
  background: '#1f2937',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
});

export const navbarFloating = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '60px',
  padding: '0 2rem',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  background: 'rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  border: 'none',
});

export const link = style({
  color: 'white',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '1.1rem',
  transition: 'all 0.3s ease',
  ':hover': {
    opacity: 0.8,
    transform: 'translateY(-1px)',
  },
});

export const brand = style({
  color: 'white',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '1.5rem',
  fontFamily: '"Courier New", monospace',
  transition: 'all 0.3s ease',
  ':hover': {
    opacity: 0.8,
    transform: 'translateY(-1px)',
  },
});

export const linkFloating = style({
  color: 'white',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '1.1rem',
  transition: 'all 0.3s ease',
  ':hover': {
    opacity: 0.8,
    transform: 'translateY(-1px)',
  },
});

export const brandFloating = style({
  color: 'white',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '1.5rem',
  fontFamily: '"Courier New", monospace',
  transition: 'all 0.3s ease',
  ':hover': {
    opacity: 0.8,
    transform: 'translateY(-1px)',
  },
});
