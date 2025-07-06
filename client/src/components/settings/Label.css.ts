import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';


export const label = style({
  fontFamily: vars.fonts.heading,
  fontWeight: 'bold',
  marginBottom: vars.spacing.sm,
});
