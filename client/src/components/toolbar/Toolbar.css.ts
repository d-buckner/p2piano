import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';


export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing.sm,
  fontFamily: vars.fonts.heading,
  height: '100%',
});

// Responsive visibility classes
export const showFromMobile = style({
  display: 'flex', // Show on all screen sizes
});

export const showFromTablet = style({
  display: 'none',
  '@media': {
    '(min-width: 768px)': {
      display: 'flex',
    },
  },
});

export const showFromDesktop = style({
  display: 'none',
  '@media': {
    '(min-width: 1024px)': {
      display: 'flex',
    },
  },
});

export const showFromLarge = style({
  display: 'none',
  '@media': {
    '(min-width: 1280px)': {
      display: 'flex',
    },
  },
});
