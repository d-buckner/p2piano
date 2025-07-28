import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

// Use original ocean theme colors for home page

export const container = style({
  minHeight: '100vh',
  background: '#f0f9ff',
  color: '#0c4a6e',
});

export const hero = style({
  minHeight: 'calc(100vh - 40px)',
  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(14, 165, 233, 0.3) 100%)',
  display: 'flex',
  alignItems: 'center',
  padding: '2rem',
  paddingTop: '60px',
  position: 'relative',
  overflow: 'hidden',
  ':before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 50%, rgba(2, 132, 199, 0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  '@media': {
    '(max-width: 550px)': {
      padding: '1rem',
      paddingTop: '80px',
      minHeight: 'calc(100vh - 60px)',
    },
  },
});

export const heroContent = style({
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '4rem',
  alignItems: 'center',
  position: 'relative',
  zIndex: 1,
  '@media': {
    '(max-width: 550px)': {
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
      textAlign: 'center',
    },
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '2rem',
      textAlign: 'center',
    },
  },
});

export const heroText = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  '@media': {
    '(max-width: 550px)': {
      gap: '1.5rem',
    },
  },
});

export const mainHeading = style({
  fontFamily: vars.fonts.heading,
  fontSize: 'clamp(1.75rem, 5vw, 3rem)',
  fontWeight: 700,
  lineHeight: 1.2,
  margin: 0,
  marginBottom: '0.5rem',
  color: '#0c4a6e',
  '@media': {
    '(max-width: 550px)': {
      fontSize: 'clamp(1.5rem, 6vw, 2.25rem)',
      lineHeight: 1.3,
      marginBottom: '0.75rem',
    },
  },
});

export const subHeading = style({
  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
  lineHeight: 1.6,
  color: '#0c4a6e',
  margin: 0,
  fontFamily: vars.fonts.body,
  '@media': {
    '(max-width: 550px)': {
      fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
      lineHeight: 1.7,
    },
  },
});

export const actionSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  alignItems: 'center',
  width: '100%',
});

export const ctaButton = style({
  background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
  color: 'white',
  border: 'none',
  padding: '1rem 2rem',
  borderRadius: '12px',
  fontSize: '1.2rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'all 0.3s ease',
  minWidth: '200px',
  minHeight: '48px',
  justifyContent: 'center',
  fontFamily: vars.fonts.body,
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 30px rgba(2, 132, 199, 0.25)',
  },
  ':active': {
    transform: 'translateY(0)',
    boxShadow: '0 5px 15px rgba(2, 132, 199, 0.35)',
  },
  ':disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none',
  },
  '@media': {
    '(max-width: 550px)': {
      padding: '1.25rem 2rem',
      fontSize: '1.1rem',
      minHeight: '52px',
    },
  },
});

export const orDivider = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  width: '100%',
  color: '#475569',
  ':before': {
    content: '""',
    flex: 1,
    height: '1px',
    background: 'rgba(2, 132, 199, 0.2)',
  },
  ':after': {
    content: '""',
    flex: 1,
    height: '1px',
    background: 'rgba(2, 132, 199, 0.2)',
  },
});

export const joinSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  alignItems: 'center',
});

export const joinLabel = style({
  color: '#475569',
  fontSize: '0.9rem',
  fontFamily: vars.fonts.body,
});

export const joinInputGroup = style({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
});

export const roomCodeInput = style({
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '2px solid rgba(2, 132, 199, 0.2)',
  background: '#e0f2fe',
  color: '#0c4a6e',
  fontFamily: vars.fonts.body,
  fontSize: '1.1rem',
  textAlign: 'center',
  textTransform: 'lowercase',
  width: '120px',
  minHeight: '44px',
  ':focus': {
    outline: 'none',
    borderColor: '#0284c7',
    background: '#e0f2fe',
    boxShadow: '0 0 0 2px rgba(2, 132, 199, 0.1)',
  },
  '@media': {
    '(max-width: 550px)': {
      width: '140px',
      padding: '1rem',
      fontSize: '1.2rem',
      minHeight: '48px',
    },
  },
});

export const joinButton = style({
  background: '#0284c7',
  color: 'white',
  border: '1px solid #0284c7',
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: vars.fonts.body,
  fontWeight: 500,
  transition: 'all 0.2s ease',
  minHeight: '44px',
  ':hover': {
    background: '#10b981',
    borderColor: '#10b981',
  },
  ':active': {
    transform: 'scale(0.98)',
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  '@media': {
    '(max-width: 550px)': {
      padding: '1rem 1.75rem',
      minHeight: '48px',
      fontSize: '1rem',
    },
  },
});

export const heroVisual = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const demoContext = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  alignItems: 'center',
});

export const features = style({
  padding: '4rem 2rem',
  background: '#f0f9ff', // Different from hero gradient
  '@media': {
    '(max-width: 550px)': {
      padding: '3rem 1rem',
    },
  },
});

export const featuresContainer = style({
  maxWidth: '1200px',
  margin: '0 auto',
});

export const sectionHeading = style({
  fontFamily: vars.fonts.heading,
  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
  textAlign: 'center',
  marginBottom: '3rem',
  color: '#0c4a6e',
  fontWeight: 600,
});

export const featuresGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
  '@media': {
    '(max-width: 550px)': {
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
    },
  },
});

export const featureCard = style({
  background: '#e0f2fe',
  padding: '2rem',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(2, 132, 199, 0.08)',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(2, 132, 199, 0.1)',
  ':hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 40px rgba(2, 132, 199, 0.15)',
  },
  '@media': {
    '(max-width: 550px)': {
      padding: '1.5rem',
      borderRadius: '12px',
    },
  },
});

export const featureIcon = style({
  width: '60px',
  height: '60px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.5rem',
  fontSize: '1.5rem',
});

export const featureTitle = style({
  fontFamily: vars.fonts.heading,
  fontSize: '1.25rem',
  marginBottom: '1rem',
  color: '#0c4a6e',
  fontWeight: 600,
});

export const featureText = style({
  color: '#0c4a6e',
  lineHeight: 1.6,
  margin: 0,
  fontFamily: vars.fonts.body,
});

export const faq = style({
  padding: '4rem 2rem',
  background: '#e0f2fe', // Alternates from howItWorks (background)
  '@media': {
    '(max-width: 550px)': {
      padding: '3rem 1rem',
    },
  },
});

export const faqContainer = style({
  maxWidth: '1000px',
  margin: '0 auto',
});

export const faqGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '1.5rem',
  '@media': {
    '(max-width: 550px)': {
      gridTemplateColumns: '1fr',
      gap: '1rem',
    },
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const faqItem = style({
  background: '#f0f9ff',
  padding: '1.5rem',
  borderRadius: '12px',
  border: '1px solid rgba(2, 132, 199, 0.1)',
});

export const faqQuestion = style({
  fontFamily: vars.fonts.heading,
  fontSize: '1.1rem',
  color: '#0c4a6e',
  marginBottom: '0.75rem',
  fontWeight: 600,
});

export const faqAnswer = style({
  color: '#0c4a6e',
  lineHeight: 1.5,
  margin: 0,
  fontFamily: vars.fonts.body,
});

export const howItWorks = style({
  padding: '4rem 2rem',
  background: '#e0f2fe',
});

export const howContainer = style({
  maxWidth: '1000px',
  margin: '0 auto',
});

export const steps = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const step = style({
  textAlign: 'center',
  padding: '2rem',
});

export const stepNumber = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #0284c7 0%, #10b981 100%)',
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 700,
  marginBottom: '1.5rem',
  fontFamily: vars.fonts.heading,
});

export const stepTitle = style({
  fontFamily: vars.fonts.heading,
  fontSize: '1.25rem',
  color: '#0c4a6e',
  marginBottom: '1rem',
  fontWeight: 600,
});

export const stepText = style({
  color: '#0c4a6e',
  lineHeight: 1.6,
  margin: 0,
  fontFamily: vars.fonts.body,
});

export const expectations = style({
  padding: '4rem 2rem',
  background: '#f0f9ff', // Different from howItWorks
});

export const expectationsContainer = style({
  maxWidth: '1000px',
  margin: '0 auto',
});

export const expectationsList = style({
  display: 'grid',
  gap: '1.5rem',
});

export const expectationItem = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
  padding: '1.5rem',
  background: '#e0f2fe',
  borderRadius: '12px',
  border: '1px solid rgba(2, 132, 199, 0.1)',
});

export const expectationIcon = style({
  fontSize: '1.5rem',
  flexShrink: 0,
});

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const spinner = style({
  width: '20px',
  height: '20px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTop: '2px solid white',
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
});
