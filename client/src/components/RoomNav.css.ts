import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const roomNav = style({
  width: '100%',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  padding: '4px 16px',
  backgroundColor: vars.colors.secondary,
  display: 'flex',
  justifyContent: 'space-between',
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