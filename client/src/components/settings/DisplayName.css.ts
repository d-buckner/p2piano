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
  border: `1px solid ${vars.colors.muted}`,
  fontSize: '1rem',
  
  ':focus': {
    outline: 'none',
    borderColor: vars.colors.background,
  },
});

export const inputError = style({
  borderColor: '#e53e3e',
  
  ':focus': {
    borderColor: '#e53e3e',
  },
});
