import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const roomNav = style({
  width: '100%',
  height: vars.sizes.headerHeight,
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  padding: `0 ${vars.spacing.md}`,
  backgroundColor: vars.colors.secondary,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'white',
});

export const navLink = style({
  color: 'white',
  textDecoration: 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  
  ':hover': {
    textDecoration: 'underline',
  },
});

export const roomId = style({
  fontWeight: 'bold',
});