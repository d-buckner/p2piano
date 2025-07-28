import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';


export const toolbarLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
});

export const appName = style({
  fontSize: vars.fontSizes.lg,
  fontWeight: 700,
  fontFamily: vars.fonts.heading,
  margin: 0,
  paddingRight: vars.spacing.md,
  borderRight: `1px solid ${vars.overlays.border}`,
  
  '@media': {
    [`(max-width: ${vars.breakpoints.mobile})`]: {
      fontSize: vars.fontSizes.md,
      paddingRight: vars.spacing.sm,
    },
  },
});

export const controls = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
});
