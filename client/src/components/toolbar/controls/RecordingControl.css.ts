import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';


const pulseAnimation = keyframes({
  '0%, 100%': {
    opacity: 1,
  },
  '50%': {
    opacity: 0.6,
  },
});

export const recordingControl = style({
  display: 'flex',
  alignItems: 'center',
});

export const mainControl = style({
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${vars.overlays.border}`,
  borderRadius: vars.radii.md,
  backgroundColor: vars.overlays.subtle,
});

export const controlButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.colors.muted,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  borderRight: `1px solid ${vars.overlays.border}`,

  ':hover': {
    backgroundColor: vars.overlays.hover,
    color: vars.colors.foreground,
  },

  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  
  ':disabled:hover': {
    backgroundColor: 'transparent',
    color: vars.colors.muted,
  },
});

export const recordButton = style({});

export const playButton = style({});

export const infoButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  padding: `0 ${vars.spacing.sm}`,
  height: '24px',
  minWidth: '6em',
  maxWidth: '12em',
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.colors.foreground,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  fontSize: vars.fontSizes.xs,
  position: 'relative',

  ':hover': {
    backgroundColor: vars.overlays.hover,
  },

  '@media': {
    '(min-width: 768px)': {
      minWidth: '8em',
    },
    '(min-width: 1024px)': {
      minWidth: '10em',
    },
  },
});

export const recordingInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  flex: 1,
  minWidth: 0,
});

export const recordingLabel = style({
  fontWeight: 600,
  color: vars.colors.danger,
  animation: `${pulseAnimation} 1s ease-in-out infinite`,
});

export const recordingTime = style({
  fontWeight: 500,
  color: vars.colors.danger,
  fontVariantNumeric: 'tabular-nums',
  animation: `${pulseAnimation} 1s ease-in-out infinite`,
  width: '3em',
  textAlign: 'right',
});

export const currentTitle = style({
  flex: 1,
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: vars.fontSizes.xs,
});

export const currentDuration = style({
  fontSize: '10px',
  color: vars.colors.muted,
  flexShrink: 0,
  width: '35px',
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
});

export const recording = style({
  backgroundColor: vars.colors.danger,
  borderColor: vars.colors.danger,
  color: vars.colors.foreground,

  ':hover': {
    backgroundColor: vars.colors.danger,
    color: vars.colors.foreground,
  },
});

export const playing = style({
  backgroundColor: vars.colors.primary,
  borderColor: vars.colors.primary,
  color: vars.colors.foreground,

  ':hover': {
    backgroundColor: vars.colors.primary,
    color: vars.colors.foreground,
  },
});

// Dropdown styles
export const dropdownContent = style({
  padding: 0,
  minWidth: '320px',
});

export const searchContainer = style({
  padding: vars.spacing.sm,
  borderBottom: `1px solid ${vars.overlays.border}`,
});

export const searchInput = style({
  width: '100%',
  padding: vars.spacing.xs,
  border: `1px solid ${vars.overlays.border}`,
  borderRadius: vars.radii.sm,
  backgroundColor: vars.overlays.subtle,
  color: vars.colors.foreground,
  fontSize: vars.fontSizes.xs,

  ':focus': {
    outline: 'none',
    borderColor: vars.colors.primary,
  },

  '::placeholder': {
    color: vars.colors.muted,
  },
});

export const recordingsList = style({
  maxHeight: '240px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
});

export const recordingItem = style({
  display: 'flex',
  alignItems: 'stretch',
  transition: vars.transitions.fast,

  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const recordingSelect = style({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  padding: vars.spacing.sm,
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  transition: vars.transitions.fast,
});

export const recordingItemInfo = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  flex: 1,
  gap: '2px',
  minWidth: 0,
});

export const recordingItemTitle = style({
  fontSize: vars.fontSizes.xs,
  fontWeight: 500,
  color: vars.colors.foreground,
});

export const recordingMeta = style({
  fontSize: '10px',
  color: vars.colors.muted,
  lineHeight: 1.2,
});

export const editInput = style({
  width: '100%',
  padding: '2px 4px',
  border: `1px solid ${vars.colors.primary}`,
  borderRadius: vars.radii.sm,
  backgroundColor: vars.overlays.subtle,
  color: vars.colors.foreground,
  fontSize: vars.fontSizes.xs,
  fontWeight: 500,

  ':focus': {
    outline: 'none',
  },
});

export const recordingActions = style({
  display: 'flex',
  alignItems: 'center',
  padding: `0 ${vars.spacing.xs}`,
  gap: '2px',
});

export const actionButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '100%',
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.colors.muted,
  cursor: 'pointer',
  transition: vars.transitions.fast,

  ':hover': {
    backgroundColor: vars.overlays.hover,
    color: vars.colors.foreground,
  },
});

export const selected = style({
  backgroundColor: vars.overlays.hover,
  borderLeft: `3px solid ${vars.colors.primary}`,

  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const emptyState = style({
  padding: vars.spacing.md,
  textAlign: 'center',
  fontSize: vars.fontSizes.xs,
  color: vars.colors.muted,
  fontStyle: 'italic',
});
