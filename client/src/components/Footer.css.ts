import { style } from '@vanilla-extract/css';


export const footer = style({
  display: 'flex',
  justifyContent: 'center',
  padding: '1rem 2rem',
  background: '#f8fafc',
  borderTop: '1px solid #e5e7eb',
  color: '#6b7280',
  fontSize: '0.875rem',
});

export const link = style({
  color: '#4f46e5',
  textDecoration: 'underline',
  fontWeight: 500,
  ':hover': {
    color: '#3730a3',
    textDecoration: 'none',
  },
});
