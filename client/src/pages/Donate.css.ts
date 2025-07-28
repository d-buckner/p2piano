import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const container = style({
  fontFamily: vars.fonts.body,
  lineHeight: 1.6,
  color: '#0c4a6e',
  background: '#f0f9ff',
  minHeight: '100vh',
});

// Hero Section
export const hero = style({
  background: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)',
  color: '#0c4a6e',
  minHeight: '60vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  paddingTop: '60px',
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
  color: '#475569',
  lineHeight: 1.7,
  marginBottom: '2rem',
});

export const highlight = style({
  color: '#0c4a6e',
  fontWeight: 700,
  textDecoration: 'underline',
  textDecorationColor: 'rgba(12, 74, 110, 0.3)',
  textUnderlineOffset: '4px',
});

// Content Section
export const content = style({
  padding: '6rem 2rem',
  background: 'white',
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
  color: '#0c4a6e',
  fontWeight: 600,
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
  background: '#f0f9ff',
  padding: '2.5rem',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(2, 132, 199, 0.08)',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(2, 132, 199, 0.1)',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  ':hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 40px rgba(2, 132, 199, 0.15)',
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
  color: '#0c4a6e',
});

export const donationText = style({
  color: '#475569',
  lineHeight: 1.6,
  marginBottom: '2rem',
  flex: 1,
});

export const donationButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
  color: 'white',
  padding: '0.875rem 1.75rem',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(2, 132, 199, 0.25)',
  border: 'none',
  cursor: 'pointer',
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(2, 132, 199, 0.35)',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
  },
});

export const githubButton = style({
  background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
  boxShadow: '0 4px 15px rgba(71, 85, 105, 0.25)',
  ':hover': {
    boxShadow: '0 8px 25px rgba(71, 85, 105, 0.35)',
  },
});

// Philosophy Section
export const philosophy = style({
  padding: '6rem 2rem',
  background: '#e0f2fe',
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
