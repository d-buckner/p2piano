import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const roomNav = style({
  width: '100%',
  height: vars.sizes.headerHeight,
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  padding: `0 ${vars.spacing.md}`,
  backgroundColor: vars.colors.secondary,
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  gridTemplateAreas: '"left center right"',
  alignItems: 'center',
  color: 'white',
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

export const roomId = style({
  fontWeight: 'bold',
});
