import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const midiButton = style({
  color: vars.colors.foreground,
  backgroundColor: vars.overlays.subtle,
  border: `1px solid ${vars.overlays.border}`,
  cursor: 'pointer',
  borderRadius: vars.radii.md,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.fontSizes.sm,
  fontFamily: vars.fonts.body,
  transition: `all ${vars.transitions.fast}`,
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
    borderColor: vars.overlays.borderHover,
  },
});

export const active = style({
  backgroundColor: vars.colors.foreground,
  color: vars.colors.background,
  borderColor: vars.colors.foreground,
  
  ':hover': {
    backgroundColor: vars.colors.foreground,
    borderColor: vars.colors.foreground,
  },
});