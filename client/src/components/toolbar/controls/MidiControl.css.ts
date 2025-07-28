import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';


export const midiControl = style({
  display: 'flex',
  alignItems: 'center',
});

export const midiButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  padding: `0 ${vars.spacing.sm}`,
  height: '24px',
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.overlays.border}`,
  backgroundColor: vars.overlays.subtle,
  color: vars.colors.muted,
  fontSize: vars.fontSizes.xs,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const active = style({
  backgroundColor: vars.colors.primaryDark,
  color: vars.colors.foreground,
  
  ':hover': {
    backgroundColor: vars.colors.primary,
  },
});

export const chevron = style({
  transition: 'transform 0.2s ease',
});

export const chevronRotated = style({
  transform: 'rotate(180deg)',
});

export const dropdownContent = style({
  padding: vars.spacing.sm,
  minWidth: '224px',
});

export const dropdownTitle = style({
  fontSize: vars.fontSizes.xs,
  fontWeight: 600,
  marginBottom: vars.spacing.sm,
  padding: `0 ${vars.spacing.sm}`,
  color: vars.colors.muted,
});

export const deviceList = style({
  display: 'flex',
  flexDirection: 'column',
});

export const deviceItem = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.colors.foreground,
  fontSize: vars.fontSizes.xs,
  borderRadius: vars.radii.sm,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  textAlign: 'left',
  width: '100%',
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const selected = style({
  backgroundColor: vars.overlays.active,
});

export const checkmark = style({
  color: vars.colors.success,
});

export const divider = style({
  height: '1px',
  backgroundColor: vars.overlays.border,
  margin: `${vars.spacing.sm} 0`,
});

export const disconnectButton = style({
  display: 'block',
  width: '100%',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.colors.danger,
  fontSize: vars.fontSizes.xs,
  borderRadius: vars.radii.sm,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  textAlign: 'left',
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});
