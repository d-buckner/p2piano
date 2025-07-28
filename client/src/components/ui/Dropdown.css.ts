import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';


const slideDown = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(-10px)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

export const dropdownContainer = style({
  position: 'relative',
});

export const dropdownContent = style({
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: vars.spacing.xs,
  backgroundColor: vars.colors.secondary,
  border: `1px solid ${vars.overlays.border}`,
  borderRadius: vars.radii.md,
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  zIndex: 10,
  animation: `${slideDown} 0.2s ease-out`,
  minWidth: '200px',
});
