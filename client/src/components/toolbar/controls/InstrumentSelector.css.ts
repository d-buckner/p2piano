import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const instrumentSelector = style({
  display: 'flex',
  alignItems: 'center',
});

export const selectorButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  padding: `0 ${vars.spacing.sm}`,
  height: '24px',
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.overlays.border}`,
  backgroundColor: vars.overlays.subtle,
  color: vars.colors.foreground,
  fontSize: vars.fontSizes.xs,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const open = style({
  backgroundColor: vars.overlays.active,
});

export const icon = style({
  fontSize: vars.fontSizes.sm,
});

export const chevron = style({
  transition: 'transform 0.2s ease',
});

export const chevronRotated = style({
  transform: 'rotate(180deg)',
});

export const dropdownContent = style({
  padding: vars.spacing.xs,
  minWidth: '192px',
});

export const instrumentItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  width: '100%',
  padding: `${vars.spacing.sm} ${vars.spacing.sm}`,
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.colors.foreground,
  fontSize: vars.fontSizes.xs,
  borderRadius: vars.radii.sm,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  textAlign: 'left',
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const selected = style({
  backgroundColor: vars.overlays.active,
});