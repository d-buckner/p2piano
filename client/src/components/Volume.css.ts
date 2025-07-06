import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const volumeContainer = style({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: vars.overlays.subtle,
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.overlays.border}`,
  padding: `0 ${vars.spacing.xs}`,
  
  '@media': {
    'screen and (max-width: 550px)': {
      display: 'none',
    },
  },
});

export const muteButton = style({
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.fontSizes.sm,
  transition: `all ${vars.transitions.fast}`,
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const volumeSlider = style({
  width: '80px',
  height: '4px',
  margin: `0 ${vars.spacing.sm}`,
  borderRadius: '2px',
  outline: 'none',
  cursor: 'pointer',
  background: vars.colors.foreground,
  appearance: 'none',
  
  '::-webkit-slider-track': {
    width: '100%',
    height: '4px',
    backgroundColor: vars.colors.foreground,
    borderRadius: '2px',
  },
  
  '::-webkit-slider-thumb': {
    appearance: 'none',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: vars.colors.foreground,
    cursor: 'pointer',
  },
  
  '::-moz-range-track': {
    width: '100%',
    height: '4px',
    backgroundColor: vars.colors.foreground,
    borderRadius: '2px',
    border: 'none',
  },
  
  '::-moz-range-thumb': {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: vars.colors.foreground,
    cursor: 'pointer',
    border: 'none',
  },
});

export const volumeLabel = style({
  fontSize: vars.fontSizes.xs,
  minWidth: '1.75rem',
  textAlign: 'right',
});
