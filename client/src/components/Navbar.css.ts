import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const navbar = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '2em',
  padding: '0 1em',
});

export const link = style({
  color: vars.colors.foreground,
  textDecoration: 'none',
  ':hover': {
    opacity: 0.8,
  },
});