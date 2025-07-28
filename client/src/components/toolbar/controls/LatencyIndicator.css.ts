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
  color: '#10b981', // Green
});

export const fair = style({
  color: '#f59e0b', // Yellow
});

export const poor = style({
  color: vars.colors.danger,
});