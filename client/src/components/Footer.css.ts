import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const footer = style({
  display: 'flex',
  justifyContent: 'center',
});

export const link = style({
  color: vars.colors.foreground,
  textDecoration: 'underline',
  ':hover': {
    opacity: 0.8,
  },
});
