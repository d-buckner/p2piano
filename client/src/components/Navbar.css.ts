import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const navbar = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: vars.sizes.navbarHeight,
  padding: '0 1.5rem',
  background: vars.colors.secondary, // Ocean secondary depth
  borderBottom: `1px solid ${vars.overlays.border}`,
});

export const navbarFloating = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: vars.sizes.navbarHeight,
  padding: '0 1.5rem',
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
  fontSize: '0.95rem',
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
  fontSize: '1.2rem',
  fontFamily: vars.fonts.heading,
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
  fontSize: '0.95rem',
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
  fontSize: '1.2rem',
  fontFamily: vars.fonts.heading,
  transition: 'all 0.3s ease',
  ':hover': {
    opacity: 0.8,
    transform: 'translateY(-1px)',
  },
});

export const navLinks = style({
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
});
