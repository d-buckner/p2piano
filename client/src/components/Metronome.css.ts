import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const metronomeContainer = style({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: vars.overlays.subtle,
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.overlays.border}`,
});

export const metronomeButton = style({
  color: vars.colors.foreground,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  borderRadius: vars.radii.md,
  border: '1px solid transparent',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.fontSizes.sm,
  fontFamily: vars.fonts.body,
  transition: `background-color ${vars.transitions.fast}`,
  verticalAlign: 'top',
  
  ':hover': {
    backgroundColor: vars.colors.secondary,
  },
});

export const active = style({
  backgroundColor: vars.colors.danger,
  color: vars.colors.foreground,
});

export const bpmControl = style({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: vars.colors.secondary,
  borderRadius: vars.radii.sm,
  boxShadow: vars.overlays.insetShadow,
});

export const bpmInput = style({
  padding: vars.spacing.xs,
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.colors.foreground,
  fontSize: vars.fontSizes.sm,
  fontFamily: vars.fonts.body,
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
  backgroundColor: 'transparent',
  color: vars.colors.foreground,
  fontSize: vars.fontSizes.md,
  fontFamily: vars.fonts.body,
  cursor: 'pointer',
  transition: `all ${vars.transitions.fast}`,
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
  
  ':active': {
    backgroundColor: vars.overlays.active,
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
  fontFamily: vars.fonts.body,
  padding: `0 ${vars.spacing.xs}`,
});