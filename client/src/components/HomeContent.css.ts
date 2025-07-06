import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const container = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '70%',
  padding: vars.spacing.lg,
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.spacing.md,
});

export const mainHeading = style({
  fontSize: '6rem',
  textAlign: 'center',
  margin: vars.spacing.sm,
  paddingTop: vars.spacing.lg,
});

export const subHeading = style({
  fontSize: '1.25rem',
  textAlign: 'center',
  margin: '0',
});

export const actions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  padding: vars.spacing.lg,
});

export const button = style({
  backgroundColor: vars.colors.background,
  border: '1px solid white',
  borderRadius: vars.radii.md,
  color: vars.colors.foreground,
  padding: '12px 16px',
  fontSize: '1rem',
  cursor: 'pointer',
  height: '47px',
  minWidth: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':hover': {
    backgroundColor: vars.colors.secondary,
  },
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.6,
  },
});

export const input = style({
  backgroundColor: 'transparent',
  border: '1px solid white',
  borderRadius: vars.radii.md,
  color: vars.colors.foreground,
  padding: '12px 16px',
  fontSize: '1rem',
  textAlign: 'center',
  width: '10rem',
  textTransform: 'lowercase',
  '::placeholder': {
    color: vars.colors.muted,
  },
  ':focus': {
    outline: '2px solid white',
    outlineOffset: '-2px',
  },
});

export const inputError = style({
  borderColor: '#ff6b6b',
});

export const spinner = style({
  width: '20px',
  height: '20px',
  border: '2px solid transparent',
  borderTop: '2px solid currentColor',
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
});

export const orText = style({
  color: vars.colors.foreground,
  fontSize: '1rem',
});
