import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


export const container = style({
  fontFamily: vars.fonts.body,
  lineHeight: 1.6,
  color: '#0c4a6e',
  background: vars.colors.foreground,
  minHeight: '100vh',
});

// Hero Section
export const hero = style({
  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(14, 165, 233, 0.3) 100%)',
  color: '#0c4a6e',
  minHeight: `calc(60vh - ${vars.sizes.navbarHeight})`,
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  padding: '4rem 0',
  '@media': {
    '(max-width: 550px)': {
      minHeight: `calc(50vh - ${vars.sizes.navbarHeight})`,
      padding: '3rem 0',
    },
  },
});

export const heroContent = style({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '0 2rem',
  textAlign: 'center',
  position: 'relative',
  zIndex: 1,
  '@media': {
    '(max-width: 550px)': {
      padding: '0 1rem',
    },
  },
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
  '@media': {
    '(max-width: 550px)': {
      fontSize: '1.1rem',
      lineHeight: 1.6,
    },
  },
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
  background: '#e0f2fe',
  '@media': {
    '(max-width: 550px)': {
      padding: '3rem 1rem',
    },
  },
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
  '@media': {
    '(max-width: 550px)': {
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
    },
  },
});

export const donationCard = style({
  background: vars.colors.foreground,
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
  '@media': {
    '(max-width: 550px)': {
      padding: '2rem',
    },
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
  justifyContent: 'center',
  gap: '0.5rem',
  background: '#0c4a6e',
  color: 'white',
  padding: '0.875rem 1.75rem',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(12, 74, 110, 0.25)',
  border: 'none',
  cursor: 'pointer',
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(12, 74, 110, 0.35)',
    background: '#0284c7',
  },
  '@media': {
    '(max-width: 550px)': {
      padding: '1rem 1.5rem',
      fontSize: '0.95rem',
      width: '100%',
      justifyContent: 'center',
    },
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
