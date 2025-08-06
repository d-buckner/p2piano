import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


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
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
  fontSize: '1rem',
  fontWeight: '600',
  borderRadius: vars.radii.md,
  cursor: 'pointer',
  width: 'auto',
  minWidth: '140px',
  transition: vars.transitions.fast,
  
  ':hover': {
    backgroundColor: vars.colors.primaryLight,
    transform: 'translateY(-1px)',
  },
  
  ':active': {
    transform: 'translateY(0)',
  },
  
  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

export const backHomeButton = style({
  backgroundColor: 'transparent',
  color: vars.colors.muted,
  border: `1px solid ${vars.overlays.border}`,
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
  fontSize: '1rem',
  fontWeight: '600',
  borderRadius: vars.radii.md,
  cursor: 'pointer',
  width: 'auto',
  minWidth: '120px',
  transition: vars.transitions.fast,
  
  ':hover': {
    color: vars.colors.foreground,
    borderColor: vars.colors.muted,
  },
});

export const inputLabel = style({
  display: 'block',
  color: vars.colors.foreground,
  marginBottom: vars.spacing.xs,
  textAlign: 'left',
});

export const displayNameInput = style({
  width: '100%',
  padding: vars.spacing.md,
  fontSize: '1rem',
  color: vars.colors.foreground,
  backgroundColor: vars.colors.background,
  border: `1px solid ${vars.overlays.border}`,
  borderRadius: vars.radii.md,
  marginBottom: vars.spacing.lg,
  transition: vars.transitions.fast,
  
  ':focus': {
    outline: 'none',
    borderColor: vars.colors.primary,
    boxShadow: `0 0 0 3px ${vars.colors.primary}20`,
  },
  
  '::placeholder': {
    color: vars.colors.muted,
  },
});

export const formSection = style({
  margin: vars.spacing.md,
});

export const buttonGroup = style({
  display: 'flex',
  flexDirection: 'row',
  gap: vars.spacing.md,
  justifyContent: 'center',
  alignItems: 'center',
});

export const contextMessage = style({
  fontSize: '1rem',
  color: vars.colors.muted,
  marginBottom: vars.spacing.lg,
  fontWeight: '500',
});

export const joiningAs = style({
  fontSize: '1rem',
  color: vars.colors.foreground,
  marginBottom: vars.spacing.lg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing.sm,
});

export const displayNameButton = style({
  background: 'none',
  border: `1px dashed ${vars.colors.primary}`,
  color: vars.colors.primary,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.radii.sm,
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '600',
  transition: vars.transitions.fast,
  
  ':hover': {
    backgroundColor: `${vars.colors.primary}10`,
    borderStyle: 'solid',
  },
});

export const inlineInput = style({
  background: vars.colors.background,
  border: `1px solid ${vars.colors.primary}`,
  color: vars.colors.foreground,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.radii.sm,
  fontSize: '1rem',
  fontWeight: '600',
  minWidth: '120px',
  textAlign: 'center',
  
  ':focus': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${vars.colors.primary}30`,
  },
});
