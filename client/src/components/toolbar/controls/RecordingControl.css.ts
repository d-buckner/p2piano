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
  gap: '2px',
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
  padding: `${vars.spacing.sm}`,
  border: 'none',
  backgroundColor: 'transparent',
  borderRadius: vars.radii.sm,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  textAlign: 'left',
  width: '100%',
  gap: vars.spacing.sm,
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const browseButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.overlays.border}`,
  backgroundColor: vars.overlays.subtle,
  color: vars.colors.muted,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const dropdownHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: vars.spacing.sm,
});

export const stopButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  border: 'none',
  borderRadius: vars.radii.sm,
  backgroundColor: vars.colors.danger,
  color: vars.colors.foreground,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  
  ':hover': {
    opacity: 0.8,
  },
});

export const emptyState = style({
  padding: `${vars.spacing.md} ${vars.spacing.sm}`,
  textAlign: 'center',
  fontSize: vars.fontSizes.xs,
  color: vars.colors.muted,
  fontStyle: 'italic',
});

export const playing = style({
  backgroundColor: vars.overlays.hover,
  borderLeft: `3px solid ${vars.colors.primary}`,
});

export const recordingInfo = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  flex: 1,
  gap: '2px',
});

export const recordingTitle = style({
  fontSize: vars.fontSizes.xs,
  fontWeight: 500,
  color: vars.colors.foreground,
});

export const recordingMeta = style({
  fontSize: '10px',
  color: vars.colors.muted,
  lineHeight: 1.2,
});

export const playButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  color: vars.colors.primary,
  flexShrink: 0,
});
