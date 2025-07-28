import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';


export const roomCode = style({
  padding: `0 ${vars.spacing.sm}`,
  height: '24px',
  borderRadius: vars.radii.md,
  backgroundColor: vars.overlays.subtle,
  border: `1px solid ${vars.overlays.border}`,
  color: vars.colors.foreground,
  fontSize: vars.fontSizes.xs,
  fontFamily: 'monospace',
  display: 'flex',
  alignItems: 'center',
});
