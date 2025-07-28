import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';


export const fieldset = style({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '1em',
  border: 'none',
  padding: 0,
});

export const input = style({
  padding: vars.spacing.sm,
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.overlays.border}`,
  fontSize: '1rem',
  backgroundColor: vars.colors.background,
  color: vars.colors.foreground,
  
  ':focus': {
    outline: 'none',
    borderColor: vars.colors.primary,
    boxShadow: `0 0 0 2px ${vars.colors.primary}20`,
  },
});

export const inputError = style({
  borderColor: vars.colors.danger,
  
  ':focus': {
    borderColor: vars.colors.danger,
    boxShadow: `0 0 0 2px ${vars.colors.danger}20`,
  },
});
