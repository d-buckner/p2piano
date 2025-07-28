import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

const pulseAnimation = keyframes({
  '0%, 100%': { 
    opacity: 1,
    transform: 'scale(1)',
  },
  '50%': { 
    opacity: 0.8,
    transform: 'scale(0.95)',
  },
});

export const recordingControl = style({
  display: 'flex',
  alignItems: 'center',
});

export const recordButton = style({
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

export const recording = style({
  backgroundColor: vars.colors.danger,
  color: vars.colors.foreground,
  animation: `${pulseAnimation} 1s ease-in-out infinite`,
  
  ':hover': {
    backgroundColor: vars.colors.danger,
  },
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

export const recordingsList = style({
  maxHeight: '128px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
});

export const recordingItem = style({
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

export const recordingDate = style({
  fontSize: vars.fontSizes.xs,
  color: vars.colors.muted,
});