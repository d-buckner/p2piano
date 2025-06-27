import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';


export const modalOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
});

export const modalContent = style({
  backgroundColor: 'white',
  borderRadius: vars.radii.lg,
  minWidth: '400px',
  maxWidth: '500px',
  position: 'relative',
  color: vars.colors.background,
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
  color: vars.colors.background,
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: vars.spacing.xs,
  borderRadius: vars.radii.sm,
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
  border: `1px solid ${vars.colors.muted}`,
  fontSize: '1rem',
  flex: 1,
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
    backgroundColor: '#151f21',
    color: 'white',
    marginTop: vars.spacing.md,
    alignSelf: 'flex-end',
    width: '100%',

    ':hover': {
      backgroundColor: '#1a252a',
    },

    ':disabled': {
      backgroundColor: vars.colors.secondary,
      cursor: 'not-allowed',
    },
  },
]);

export const copyButton = style([
  button,
  {
    backgroundColor: vars.colors.secondary,
    color: vars.colors.foreground,

    ':hover': {
      backgroundColor: vars.colors.muted,
    },
  },
]);