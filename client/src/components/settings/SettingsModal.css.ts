import { style } from '@vanilla-extract/css';
import { vars, oceanTheme } from '../../styles/theme.css';


export const modalOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(17, 24, 39, 0.8)', // Ocean depths overlay
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
});

export const modalContent = style({
  backgroundColor: oceanTheme.secondary, // Ocean floor
  borderRadius: vars.radii.lg,
  minWidth: '400px',
  maxWidth: '500px',
  position: 'relative',
  color: vars.colors.foreground, // Light ocean foam text
  border: `1px solid ${vars.overlays.border}`,
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
});

export const modalHeader = style({
  padding: vars.spacing.lg,
  paddingBottom: vars.spacing.md,
  fontSize: '1.5rem',
  fontWeight: 'bold',
  fontFamily: vars.fonts.heading,
});

export const modalCloseButton = style({
  position: 'absolute',
  top: vars.spacing.md,
  right: vars.spacing.md,
  backgroundColor: 'transparent',
  border: 'none',
  color: vars.colors.muted,
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: vars.spacing.xs,
  borderRadius: vars.radii.sm,
  transition: vars.transitions.fast,
  
  ':hover': {
    color: vars.colors.foreground,
    backgroundColor: vars.overlays.hover,
  },
});

export const modalBody = style({
  padding: vars.spacing.lg,
  paddingTop: 0,
  display: 'flex',
  flexDirection: 'column',
});

export const fieldset = style({
  display: 'flex',
  flexDirection: 'column',
  border: 'none',
  padding: 0,
  marginBottom: vars.spacing.md,
});

export const checkboxContainer = style({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1em',
});

export const checkbox = style({
  marginRight: vars.spacing.sm,
});

export const hstack = style({
  display: 'flex',
  gap: vars.spacing.sm,
});

export const input = style({
  padding: vars.spacing.sm,
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.overlays.border}`,
  fontSize: '1rem',
  flex: 1,
  backgroundColor: vars.colors.background,
  color: vars.colors.foreground,
  
  ':focus': {
    outline: 'none',
    borderColor: vars.colors.primary,
    boxShadow: `0 0 0 2px ${vars.colors.primary}20`,
  },
});

export const label = style({
  fontFamily: vars.fonts.heading,
  fontWeight: 'bold',
  marginBottom: '0.5rem',
});

export const button = style({
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  borderRadius: vars.radii.md,
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.2s',
});

export const primaryButton = style([
  button,
  {
    backgroundColor: vars.colors.primaryDark,
    color: 'white',
    marginTop: vars.spacing.md,
    alignSelf: 'flex-end',
    width: '100%',
    fontWeight: 600,

    ':hover': {
      backgroundColor: vars.colors.primary,
    },

    ':disabled': {
      backgroundColor: vars.colors.background,
      color: vars.colors.muted,
      cursor: 'not-allowed',
    },
  },
]);

export const copyButton = style([
  button,
  {
    backgroundColor: vars.overlays.subtle,
    color: vars.colors.foreground,
    border: `1px solid ${vars.overlays.border}`,

    ':hover': {
      backgroundColor: vars.overlays.hover,
    },
  },
]);
