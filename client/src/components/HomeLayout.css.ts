import { style } from '@vanilla-extract/css';


export const page = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  position: 'relative',
});

export const main = style({
  position: 'relative',
});

export const footer = style({
  marginTop: 'auto',
});
