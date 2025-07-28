import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const inviteButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  padding: `0 ${vars.spacing.sm}`,
  height: '24px',
  borderRadius: vars.radii.md,
  border: 'none',
  backgroundColor: vars.colors.primary,
  color: vars.colors.foreground,
  fontSize: vars.fontSizes.xs,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  
  ':hover': {
    backgroundColor: vars.colors.primaryDark,
  },
});

export const modalContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
});

export const modalDescription = style({
  color: vars.colors.muted,
  fontSize: vars.fontSizes.sm,
  margin: 0,
});

export const linkContainer = style({
  display: 'flex',
  gap: vars.spacing.sm,
});

export const linkInput = style({
  flex: 1,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.radii.sm,
  backgroundColor: vars.colors.background,
  color: vars.colors.foreground,
  border: `1px solid ${vars.overlays.border}`,
  fontSize: vars.fontSizes.sm,
  fontFamily: 'monospace',
});

export const copyButton = style({
  padding: `${vars.spacing.xs} ${vars.spacing.md}`,
  borderRadius: vars.radii.sm,
  border: 'none',
  backgroundColor: vars.colors.primary,
  color: vars.colors.foreground,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  
  ':hover': {
    backgroundColor: vars.colors.primaryLight,
  },
});

export const copied = style({
  backgroundColor: vars.colors.success,
});

export const copiedMessage = style({
  color: vars.colors.success,
  fontSize: vars.fontSizes.xs,
  margin: 0,
});