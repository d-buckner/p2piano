import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const loadingContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  backgroundColor: vars.colors.background, // Ocean depths
  color: vars.colors.foreground, // Light ocean foam
});

export const spinner = style({
  width: '40px',
  height: '40px',
  border: `4px solid ${vars.colors.muted}40`, // Ocean mist with transparency
  borderTop: `4px solid ${vars.colors.primary}`, // Ocean blue accent
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
});

export const errorContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: vars.colors.background, // Ocean depths
  color: vars.colors.foreground, // Light ocean foam
});

export const errorHeading = style({
  fontSize: '2rem',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: vars.spacing.md,
  fontFamily: vars.fonts.heading,
});

export const errorLink = style({
  color: vars.colors.primary, // Ocean blue link
  textDecoration: 'underline',
  transition: vars.transitions.fast,
  
  ':hover': {
    color: vars.colors.primaryLight, // Lighter ocean blue on hover
    textDecoration: 'none',
  },
});

export const roomGrid = style({
  display: 'grid',
  gridTemplateAreas: '"header" "visual"',
  gridTemplateRows: `${vars.sizes.headerHeight} minmax(0, 1fr)`,
  height: '100%',
});

export const headerArea = style({
  gridArea: 'header',
});

export const visualArea = style({
  gridArea: 'visual',
});

// Start Playing Modal Styles
export const startModalOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
});

export const startModalContent = style({
  backgroundColor: vars.colors.background,
  padding: vars.spacing.xl,
  borderRadius: vars.radii.lg,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  maxWidth: '400px',
  width: '90%',
  textAlign: 'center',
  border: `1px solid ${vars.overlays.border}`,
});

export const pianoIcon = style({
  fontSize: '3rem',
  marginBottom: vars.spacing.md,
  display: 'block',
});

export const startModalTitle = style({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: vars.colors.foreground,
  marginBottom: vars.spacing.md,
  fontFamily: vars.fonts.heading,
});

export const startModalDescription = style({
  fontSize: '1.1rem',
  color: vars.colors.muted,
  marginBottom: vars.spacing.lg,
  lineHeight: 1.5,
});

export const iosCheck = style({
  fontSize: '0.9rem',
  color: vars.colors.muted,
  marginBottom: vars.spacing.lg,
  fontWeight: '500',
  fontStyle: 'italic',
});

export const startPlayingButton = style({
  backgroundColor: vars.colors.primary,
  color: vars.colors.background,
  border: 'none',
  padding: `${vars.spacing.md} ${vars.spacing.xl}`,
  fontSize: '1.2rem',
  fontWeight: 'bold',
  borderRadius: vars.radii.md,
  cursor: 'pointer',
  marginBottom: vars.spacing.md,
  width: '100%',
  transition: vars.transitions.fast,
  
  ':hover': {
    backgroundColor: vars.colors.primaryLight,
    transform: 'translateY(-1px)',
  },
  
  ':active': {
    transform: 'translateY(0)',
  },
});

export const backHomeButton = style({
  backgroundColor: 'transparent',
  color: vars.colors.muted,
  border: `1px solid ${vars.overlays.border}`,
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
  fontSize: '0.9rem',
  borderRadius: vars.radii.md,
  cursor: 'pointer',
  width: '100%',
  transition: vars.transitions.fast,
  
  ':hover': {
    color: vars.colors.foreground,
    borderColor: vars.colors.muted,
  },
});
