import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const page = style({
  display: 'grid',
  gridTemplateAreas: '"header" "main" "footer"',
  gridTemplateRows: '60px minmax(0, 1fr) auto',
  minHeight: '100vh',
  backgroundColor: vars.colors.background,
  color: vars.colors.foreground,
});

export const header = style({
  gridArea: 'header',
});

export const main = style({
  gridArea: 'main',
});

export const footer = style({
  gridArea: 'footer',
});
