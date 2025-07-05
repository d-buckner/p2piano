import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  fontFamily: vars.fonts.heading,
});
