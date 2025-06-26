import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const rightOverlay = style({
  zIndex: 1,
  color: vars.colors.foreground,
  backgroundColor: vars.colors.background,
  position: 'absolute',
  right: '0',
  height: '14px',
});

export const instrumentSelect = style({
  zIndex: 1,
  padding: vars.spacing.xs,
  fontSize: '0.875rem',
  backgroundColor: vars.colors.background,
  color: vars.colors.foreground,
  border: `1px solid ${vars.colors.secondary}`,
  borderRadius: vars.radii.sm,
});

export const usersList = style({
  padding: '16px',
  listStyle: 'none',
  margin: 0,
});

export const userItem = style({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

export const userColorIndicator = style({
  borderRadius: '4px',
  height: '8px',
  width: '8px',
  margin: '8px',
});