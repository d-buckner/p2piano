import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const settingsButton = style({
  width: '24px',
  height: '24px',
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.overlays.border}`,
  backgroundColor: vars.overlays.subtle,
  color: vars.colors.muted,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: vars.transitions.fast,
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
    color: vars.colors.foreground,
  },
});