import { style } from '@vanilla-extract/css';


export const page = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  position: 'relative',
});

export const main = style({
  flex: 1,
  position: 'relative',
});

export const footer = style({
  marginTop: 'auto',
});
