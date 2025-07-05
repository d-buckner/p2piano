import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  fontFamily: vars.fonts.heading,
});

// Hide on mobile devices (below 550px)
export const hideOnMobile = style({
  '@media': {
    'screen and (max-width: 550px)': {
      display: 'none',
    },
  },
});

// Hide on tablet and below (below 768px)
export const hideOnTablet = style({
  '@media': {
    'screen and (max-width: 768px)': {
      display: 'none',
    },
  },
});

// Show only on mobile (below 550px)
export const showOnlyMobile = style({
  display: 'none',
  '@media': {
    'screen and (max-width: 550px)': {
      display: 'block',
    },
  },
});

// Show only on desktop (above 1024px)
export const showOnlyDesktop = style({
  display: 'none',
  '@media': {
    'screen and (min-width: 1024px)': {
      display: 'block',
    },
  },
});
