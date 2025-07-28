import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const container = style({
  fontFamily: vars.fonts.body,
  lineHeight: 1.6,
  color: '#333',
});

// Hero Section
export const hero = style({
  background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
  color: 'white',
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
});

export const heroContent = style({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '0 2rem',
  textAlign: 'center',
  position: 'relative',
  zIndex: 1,
});

export const heroHeading = style({
  fontFamily: vars.fonts.heading,
  fontSize: '3rem',
  fontWeight: 700,
  marginBottom: '1.5rem',
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
  '@media': {
    '(max-width: 768px)': {
      fontSize: '2.25rem',
    },
  },
});

export const heroSubtext = style({
  fontSize: '1.25rem',
  opacity: 0.9,
  lineHeight: 1.7,
  marginBottom: '2rem',
});

export const highlight = style({
  color: '#fbbf24',
  fontWeight: 600,
});

// Content Section
export const content = style({
  padding: '6rem 2rem',
  background: '#f8fafc',
});

export const contentContainer = style({
  maxWidth: '1000px',
  margin: '0 auto',
});

export const sectionHeading = style({
  fontFamily: vars.fonts.heading,
  textAlign: 'center',
  fontSize: '2.5rem',
  marginBottom: '3rem',
  color: '#1f2937',
  '@media': {
    '(max-width: 768px)': {
      fontSize: '2rem',
    },
  },
});

export const donationGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
  marginBottom: '4rem',
});

export const donationCard = style({
  background: 'white',
  padding: '2.5rem',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  border: '1px solid #e5e7eb',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  ':hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
  },
});

export const donationIcon = style({
  fontSize: '3rem',
  marginBottom: '1.5rem',
  display: 'block',
});

export const donationTitle = style({
  fontFamily: vars.fonts.heading,
  fontSize: '1.5rem',
  fontWeight: 600,
  marginBottom: '1rem',
  color: '#1f2937',
});

export const donationText = style({
  color: '#6b7280',
  lineHeight: 1.6,
  marginBottom: '2rem',
  flex: 1,
});

export const donationButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: '0.875rem 1.75rem',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  border: 'none',
  cursor: 'pointer',
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
  },
});

export const githubButton = style({
  background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
  boxShadow: '0 4px 15px rgba(31, 41, 55, 0.3)',
  ':hover': {
    boxShadow: '0 8px 25px rgba(31, 41, 55, 0.4)',
  },
});

// Philosophy Section
export const philosophy = style({
  padding: '6rem 2rem',
  background: 'white',
});

export const philosophyContainer = style({
  maxWidth: '800px',
  margin: '0 auto',
  textAlign: 'center',
});

export const philosophyText = style({
  fontSize: '1.25rem',
  lineHeight: 1.8,
  color: '#4b5563',
  marginBottom: '2rem',
});

export const philosophyQuote = style({
  fontSize: '1.5rem',
  fontStyle: 'italic',
  color: '#1f2937',
  marginBottom: '1rem',
  fontWeight: 500,
});

export const philosophyAuthor = style({
  fontSize: '1rem',
  color: '#6b7280',
  fontWeight: 600,
});
