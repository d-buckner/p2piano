import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const footer = style({
  display: 'flex',
  justifyContent: 'center',
  padding: '1rem 2rem',
  background: vars.colors.secondary,
  borderTop: `1px solid ${vars.overlays.border}`,
  color: vars.colors.muted,
  fontSize: '0.875rem',
});

export const link = style({
  color: vars.colors.primary,
  textDecoration: 'underline',
  fontWeight: 500,
  transition: vars.transitions.fast,
  ':hover': {
    color: vars.colors.primaryLight,
    textDecoration: 'none',
  },
});
