import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const activeUsers = style({
  display: 'flex',
  alignItems: 'center',
});

export const usersButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  padding: `0 ${vars.spacing.sm}`,
  height: '24px',
  borderRadius: vars.radii.md,
  backgroundColor: vars.overlays.subtle,
  border: `1px solid ${vars.overlays.border}`,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  color: 'inherit',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const icon = style({
  color: vars.colors.muted,
});

export const userAvatars = style({
  display: 'flex',
  alignItems: 'center',
});

export const avatar = style({
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: vars.fontSizes.xs,
  fontWeight: 600,
  color: vars.colors.foreground,
  border: `1px solid ${vars.colors.background}`,
  marginLeft: '-4px',
  
  ':first-child': {
    marginLeft: 0,
  },
});

export const dropdownContent = style({
  padding: vars.spacing.sm,
  minWidth: '280px',
  maxWidth: '320px',
});

export const dropdownTitle = style({
  fontSize: vars.fontSizes.xs,
  fontWeight: 600,
  marginBottom: vars.spacing.sm,
  padding: `0 ${vars.spacing.sm}`,
  color: vars.colors.muted,
});

export const usersList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
});

export const userItem = style({
  padding: vars.spacing.sm,
  borderRadius: vars.radii.sm,
  transition: vars.transitions.fast,
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const currentUser = style({
  backgroundColor: vars.overlays.subtle,
});

export const userInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
});

export const userAvatar = style({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: vars.fontSizes.sm,
  fontWeight: 600,
  color: vars.colors.foreground,
  flexShrink: 0,
});

export const userDetails = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.xs,
  minWidth: 0,
  flex: 1,
});

export const userName = style({
  fontSize: vars.fontSizes.sm,
  fontWeight: 500,
  color: vars.colors.foreground,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
});

export const youBadge = style({
  fontSize: vars.fontSizes.xs,
  color: vars.colors.primary,
  fontWeight: 400,
});

export const userMeta = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: vars.fontSizes.xs,
  color: vars.colors.muted,
});

export const instrumentInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
});

export const instrumentIcon = style({
  fontSize: vars.fontSizes.sm,
});

export const latencyInfo = style({
  fontFamily: 'monospace',
  fontSize: vars.fontSizes.xs,
  color: vars.colors.muted,
});