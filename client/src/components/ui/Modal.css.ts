import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const slideIn = keyframes({
  from: {
    opacity: 0,
    transform: 'translate(-50%, -48%)',
  },
  to: {
    opacity: 1,
    transform: 'translate(-50%, -50%)',
  },
});

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
  animation: `${fadeIn} 0.2s ease-out`,
});

export const modal = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: vars.colors.secondary,
  borderRadius: vars.radii.lg,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  border: `1px solid ${vars.overlays.border}`,
  width: '90%',
  maxWidth: '400px',
  animation: `${slideIn} 0.2s ease-out`,
});

export const header = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: vars.spacing.md,
  borderBottom: `1px solid ${vars.overlays.border}`,
});

export const title = style({
  fontSize: vars.fontSizes.lg,
  fontFamily: vars.fonts.heading,
  fontWeight: 600,
  color: vars.colors.foreground,
  margin: 0,
});

export const closeButton = style({
  background: 'none',
  border: 'none',
  fontSize: '24px',
  color: vars.colors.muted,
  cursor: 'pointer',
  padding: 0,
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radii.sm,
  transition: vars.transitions.fast,
  
  ':hover': {
    backgroundColor: vars.overlays.hover,
    color: vars.colors.foreground,
  },
});

export const content = style({
  padding: vars.spacing.md,
});