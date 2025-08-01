import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const roomNav = style({
  width: '100%',
  height: vars.sizes.headerHeight,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
  padding: `0 ${vars.spacing.md}`,
  backgroundColor: vars.colors.secondary,
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  gridTemplateAreas: '"left center right"',
  alignItems: 'center',
  color: 'white',
  fontFamily: vars.fonts.heading,
});

export const navLeft = style({
  gridArea: 'left',
});

export const navCenter = style({
  gridArea: 'center',
});

export const navRight = style({
  gridArea: 'right',
  justifySelf: 'end',
});

export const navLink = style({
  color: 'white',
  textDecoration: 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  
  ':hover': {
    textDecoration: 'underline',
  },
});

export const rightControls = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
});

// Responsive visibility for right controls
export const showFromMobile = style({
  display: 'flex', // Show on all screen sizes
});

export const showFromMedium = style({
  display: 'none',
  '@media': {
    '(min-width: 510px)': {
      display: 'flex',
    },
  },
});

export const showFromDesktop = style({
  display: 'none',
  '@media': {
    '(min-width: 768px)': {
      display: 'flex',
    },
  },
});
