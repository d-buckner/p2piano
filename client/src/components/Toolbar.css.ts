import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const toolbarButton = style({
  color: vars.colors.foreground,
  backgroundColor: 'transparent',
  height: '24px',
  marginRight: '4px',
  border: 'none',
  cursor: 'pointer',
  borderRadius: vars.radii.sm,
  padding: vars.spacing.xs,
  
  ':hover': {
    backgroundColor: vars.colors.secondary,
  },
});