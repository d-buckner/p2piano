import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';


export const tooltipContainer = style({
  position: 'relative',
  display: 'inline-block',
  height: '100%',
});

export const tooltip = style({
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginTop: vars.spacing.xs,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  backgroundColor: vars.colors.background,
  color: vars.colors.foreground,
  fontSize: vars.fontSizes.xs,
  borderRadius: vars.radii.md,
  whiteSpace: 'nowrap',
  zIndex: 50,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${vars.overlays.border}`,
});

export const shortcut = style({
  marginLeft: vars.spacing.sm,
  color: vars.colors.muted,
});

export const tooltipArrow = style({
  position: 'absolute',
  bottom: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 0,
  height: 0,
  borderLeft: '4px solid transparent',
  borderRight: '4px solid transparent',
  borderBottom: `4px solid ${vars.colors.background}`,
});

export const tooltipTrigger = style({
  height: '100%',
  display: 'block',
});
