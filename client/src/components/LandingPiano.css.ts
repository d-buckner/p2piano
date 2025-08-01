import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


const keyPress = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(3px)' },
});

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.spacing.lg,
  width: '100%',
  height: '100%',
  minHeight: '300px',
  justifyContent: 'center',
  '@media': {
    '(max-width: 550px)': {
      minHeight: '250px',
      gap: vars.spacing.md,
    },
  },
});

export const pianoContainer = style({
  background: '#1f2937',
  borderRadius: '20px',
  padding: '2rem',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  '@media': {
    '(max-width: 550px)': {
      padding: '1.5rem',
      borderRadius: '16px',
      transform: 'scale(0.9)',
    },
  },
});

export const whiteKeysContainer = style({
  display: 'flex',
  height: '120px',
  position: 'relative',
});

export const whiteKey = style({
  width: '40px',
  height: '120px',
  background: '#f9fafb',
  border: '1px solid #d1d5db',
  borderRadius: '0 0 8px 8px',
  marginRight: '1px',
  position: 'relative',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  ':hover': {
    background: '#e5e7eb',
    transform: 'translateY(1px)',
  },
  ':active': {
    background: '#d1d5db',
    transform: 'translateY(2px)',
  },
});

export const blackKeysContainer = style({
  position: 'absolute',
  top: '2rem', // Match the padding of pianoContainer
  left: '2rem', // Match the padding of pianoContainer
  right: '2rem',
  height: '75px',
  pointerEvents: 'all',
  '@media': {
    '(max-width: 550px)': {
      top: '1.5rem',
      left: '1.5rem',
      right: '1.5rem',
    },
  },
});

export const blackKey = style({
  width: '24px',
  height: '75px',
  background: '#1f2937',
  borderRadius: '0 0 4px 4px',
  position: 'absolute',
  top: '0',
  zIndex: 2,
  transition: 'all 0.2s ease',
  border: '1px solid #000',
  cursor: 'pointer',
  pointerEvents: 'all',
  ':hover': {
    background: '#374151',
    transform: 'translateY(1px)',
  },
  ':active': {
    background: '#4b5563',
    transform: 'translateY(2px)',
  },
});

export const keyActive = style({
  animation: `${keyPress} 0.6s ease`,
});

export const keyLabel = style({
  fontSize: '11px',
  fontWeight: 600,
  color: '#333',
  fontFamily: vars.fonts.heading,
  userSelect: 'none',
});

export const blackKeyLabel = style({
  fontSize: '9px',
  fontWeight: 600,
  color: 'white',
  fontFamily: vars.fonts.heading,
  userSelect: 'none',
});

export const userAvatars = style({
  display: 'flex',
  gap: vars.spacing.md,
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginTop: vars.spacing.lg,
  paddingTop: vars.spacing.md,
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
});

export const userAvatar = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.spacing.xs,
});

export const avatar = style({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: 700,
  fontSize: vars.fontSizes.md,
  fontFamily: vars.fonts.heading,
  border: '2px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  opacity: 0.6,
});

export const avatarActive = style({
  opacity: 1,
  transform: 'scale(1.1)',
  boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
});

export const userName = style({
  fontSize: vars.fontSizes.xs,
  color: 'rgba(255, 255, 255, 0.8)',
  fontWeight: 500,
  textAlign: 'center',
  fontFamily: vars.fonts.body,
});

export const description = style({
  fontSize: vars.fontSizes.sm,
  color: 'rgba(255, 255, 255, 0.7)',
  textAlign: 'center',
  fontStyle: 'italic',
  fontFamily: vars.fonts.body,
});
