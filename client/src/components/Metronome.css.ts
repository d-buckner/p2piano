import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const metronomeContainer = style({
  display: 'flex',
  fontSize: vars.fontSizes.sm,
  alignItems: 'center',
  backgroundColor: vars.overlays.subtle,
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.overlays.border}`,
});

export const metronomeButton = style({
  width: '1.75rem',
  color: vars.colors.foreground,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  borderRadius: vars.radii.md,
  border: '1px solid transparent',
  padding: `2px ${vars.spacing.sm}`,
  margin: '1px',
  transition: `background-color ${vars.transitions.fast}`,
  
  ':hover': {
    backgroundColor: vars.colors.secondary,
  },
});

export const active = style({
  backgroundColor: vars.colors.danger,
  color: vars.colors.foreground,
  
  ':hover': {
    backgroundColor: vars.colors.danger,
  },
});

export const bpmControl = style({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: vars.colors.secondary,
  borderRadius: vars.radii.sm,
  boxShadow: vars.overlays.insetShadow,
});

export const bpmInput = style({
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.colors.foreground,
  textAlign: 'center',
  width: vars.spacing.xl,
  appearance: 'textfield',
  
  ':focus': {
    outline: 'none',
    backgroundColor: vars.overlays.subtle,
  },
  
  '::-webkit-inner-spin-button': {
    display: 'none',
  },
  '::-webkit-outer-spin-button': {
    display: 'none',
  },
});

export const bpmButton = style({
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  border: 'none',
  borderRight: `1px solid ${vars.overlays.border}`,
  borderLeft: `1px solid ${vars.overlays.border}`,
  backgroundColor: 'transparent',
  color: vars.colors.foreground,
  cursor: 'pointer',
  transition: `all ${vars.transitions.fast}`,
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
  
  ':active': {
    backgroundColor: vars.overlays.active
  },
});

export const bpmButtonMinus = style({
  borderRight: `1px solid ${vars.overlays.border}`,
});

export const bpmButtonPlus = style({
  borderLeft: `1px solid ${vars.overlays.border}`,
});

export const bpmLabel = style({
  fontSize: vars.fontSizes.xs,
  padding: `0 ${vars.spacing.xs}`,
});
