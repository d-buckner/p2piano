import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';


const pulseAnimation = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

export const metronomeControl = style({
  display: 'flex',
  alignItems: 'center',
});

export const metronomeContainer = style({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: vars.overlays.subtle,
  border: `1px solid ${vars.overlays.border}`,
  borderRadius: vars.radii.md,
  height: '24px',
});

export const toggleButton = style({
  height: '100%',
  padding: `0 ${vars.spacing.sm}`,
  borderRadius: `${vars.radii.md} 0 0 ${vars.radii.md}`,
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.colors.muted,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: vars.transitions.fast,
  margin: 0,
  outline: 'none',
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const active = style({
  backgroundColor: vars.colors.primary,
  color: vars.colors.foreground,
  
  ':hover': {
    backgroundColor: vars.colors.primaryLight,
  },
});

export const pulse = style({
  animation: `${pulseAnimation} 0.5s ease-in-out`,
});

export const iconWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '14px',
  height: '14px',
});

export const bpmLabel = style({
  fontSize: vars.fontSizes.xs,
  color: vars.colors.muted,
  fontWeight: 500,
});

export const bpmValue = style({
  fontFamily: 'monospace',
  minWidth: '24px',
  textAlign: 'center',
});

export const dropdownTrigger = style({
  height: '100%',
  padding: `0 ${vars.spacing.sm}`,
  borderRadius: `0 ${vars.radii.md} ${vars.radii.md} 0`,
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.colors.foreground,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  fontSize: vars.fontSizes.xs,
  borderLeft: `1px solid ${vars.overlays.border}`,
  transition: vars.transitions.fast,
  minWidth: '54px', // Reserve space for "BPM" + 3 digits + chevron
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
  },
});

export const dropdownOpen = style({
  backgroundColor: vars.overlays.active,
});

export const chevron = style({
  transition: 'transform 0.2s ease',
});

export const chevronRotated = style({
  transform: 'rotate(180deg)',
});

export const dropdownContent = style({
  padding: vars.spacing.md,
  minWidth: '224px',
});

export const dropdownTitle = style({
  fontSize: vars.fontSizes.xs,
  fontWeight: 600,
  marginBottom: vars.spacing.sm,
  color: vars.colors.muted,
});

export const control = style({
  marginBottom: vars.spacing.md,
  
  ':last-child': {
    marginBottom: 0,
  },
});

export const controlHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: vars.spacing.xs,
});

export const label = style({
  fontSize: vars.fontSizes.xs,
  color: vars.colors.muted,
});

export const value = style({
  fontSize: vars.fontSizes.xs,
  fontFamily: 'monospace',
  color: vars.colors.muted,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  backgroundColor: vars.colors.background,
  borderRadius: vars.radii.sm,
});

export const slider = style({
  width: '100%',
  height: '4px',
  borderRadius: '2px',
  backgroundColor: vars.colors.background,
  appearance: 'none',
  cursor: 'pointer',
  
  '::-webkit-slider-thumb': {
    appearance: 'none',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: vars.colors.primary,
    cursor: 'pointer',
  },
  
  '::-moz-range-thumb': {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: vars.colors.primary,
    cursor: 'pointer',
    border: 'none',
  },
});

export const sliderLabels = style({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: vars.fontSizes.xs,
  color: vars.colors.muted,
  marginTop: vars.spacing.xs,
});

export const timeSignatureGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: vars.spacing.xs,
});

export const timeSignatureButton = style({
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  fontSize: vars.fontSizes.xs,
  borderRadius: vars.radii.sm,
  border: 'none',
  backgroundColor: vars.colors.background,
  color: vars.colors.muted,
  cursor: 'pointer',
  transition: vars.transitions.fast,
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
    color: vars.colors.foreground,
  },
});

export const selected = style({
  backgroundColor: vars.colors.primary,
  color: vars.colors.foreground,
  
  ':hover': {
    backgroundColor: vars.colors.primaryLight,
    color: vars.colors.foreground,
  },
});
