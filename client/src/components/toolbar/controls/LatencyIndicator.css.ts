import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';


export const latencyIndicator = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  padding: `0 ${vars.spacing.sm}`,
  height: '24px',
  borderRadius: vars.radii.md,
  backgroundColor: vars.overlays.subtle,
  border: `1px solid ${vars.overlays.border}`,
  fontSize: vars.fontSizes.xs,
});

export const latencyValue = style({
  color: vars.colors.muted,
});

export const good = style({
  color: vars.colors.success, // Dynamic theme success color
});

export const fair = style({
  color: vars.colors.primaryLight, // Dynamic theme warning-like color
});

export const poor = style({
  color: vars.colors.danger,
});
