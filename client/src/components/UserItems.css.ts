import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const userItemsContainer = style({
  display: 'flex',
});

export const userItem = style({
  display: 'flex',
  alignItems: 'center',
});

export const userColorDot = style({
  borderRadius: '50%',
  width: '8px',
  height: '8px',
});

export const userName = style({
  cursor: 'pointer',
  margin: '0 4px',
  color: vars.colors.foreground,
});

export const spacer = style({
  margin: '0 4px',
});