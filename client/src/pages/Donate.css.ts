import { style } from '@vanilla-extract/css';


export const donateContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '32px',
});

export const donateContent = style({
  maxWidth: '768px',
});

export const donateHeading = style({
  padding: '16px 0',
  textAlign: 'center',
  fontSize: '2rem',
  fontWeight: 'bold',
});

export const donateText = style({
  fontSize: '1.125rem',
  lineHeight: '1.6',
});

export const donateLink = style({
  textDecoration: 'underline',
  color: 'inherit',
  
  ':hover': {
    textDecoration: 'none',
  },
});