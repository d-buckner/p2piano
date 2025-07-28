import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';


const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

const keyPress = keyframes({
  '0%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(3px)' },
  '100%': { transform: 'translateY(0)' },
});

const fadeInUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(20px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

export const container = style({
  fontFamily: vars.fonts.body,
  lineHeight: 1.6,
  color: '#333',
  overflowX: 'hidden',
});

// Hero Section
export const hero = style({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  height: 'calc(100vh - 40px)', // Full viewport minus new navbar height
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  '@media': {
    '(max-width: 768px)': {
      minHeight: 'calc(100vh - 40px)',
      height: 'auto',
      paddingTop: '2rem',
      paddingBottom: '2rem',
    },
  },
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 100 100\\"><defs><pattern id=\\"piano\\" x=\\"0\\" y=\\"0\\" width=\\"10\\" height=\\"10\\" patternUnits=\\"userSpaceOnUse\\"><rect width=\\"10\\" height=\\"10\\" fill=\\"none\\"/><rect x=\\"0\\" y=\\"0\\" width=\\"7\\" height=\\"10\\" fill=\\"white\\" opacity=\\"0.03\\"/><rect x=\\"7\\" y=\\"0\\" width=\\"3\\" height=\\"6\\" fill=\\"black\\" opacity=\\"0.02\\"/></pattern></defs><rect width=\\"100\\" height=\\"100\\" fill=\\"url(%23piano)\\"/></svg>")',
    backgroundRepeat: 'repeat',
    opacity: 0.1,
  },
});

export const heroContent = style({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '4rem',
  alignItems: 'center',
  position: 'relative',
  zIndex: 1,
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
      textAlign: 'center',
      gap: '2rem',
      paddingTop: '2rem',
    },
  },
});

export const heroText = style({
  display: 'flex',
  flexDirection: 'column',
});

export const mainHeading = style({
  fontFamily: vars.fonts.heading,
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: '0.75rem',
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
  '@media': {
    '(max-width: 768px)': {
      fontSize: '2rem',
    },
  },
});

export const brand = style({
  color: '#fbbf24',
  fontFamily: vars.fonts.heading,
});

export const subHeading = style({
  fontSize: '1.25rem',
  marginBottom: '2rem',
  opacity: 0.9,
  lineHeight: 1.7,
});

export const ctaButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.spacing.sm,
  alignSelf: 'center',
  background: '#fbbf24',
  color: '#1f2937',
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  borderRadius: vars.radii.lg,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: vars.fontSizes.md,
  transition: vars.transitions.fast,
  boxShadow: '0 10px 25px rgba(251, 191, 36, 0.3)',
  border: 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 35px rgba(251, 191, 36, 0.4)',
    background: '#f59e0b',
  },
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.6,
  },
});

// Piano Mockup
export const heroVisual = style({
  position: 'relative',
  width: '100%',
  height: '400px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '@media': {
    '(max-width: 768px)': {
      height: '300px',
    },
  },
});

export const pianoMockup = style({
  background: '#1f2937',
  borderRadius: '20px',
  padding: '2rem',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
  transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)',
  transition: 'transform 0.3s ease',
  ':hover': {
    transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)',
  },
  '@media': {
    '(max-width: 768px)': {
      transform: 'none',
    },
  },
});

export const pianoKeys = style({
  display: 'flex',
  height: '120px',
  marginBottom: '1rem',
  position: 'relative',
});

export const keyContainer = style({
  position: 'relative',
  display: 'flex',
  width: 'fit-content',
  margin: '0 auto',
});

export const whiteKey = style({
  width: '40px',
  height: '120px',
  background: '#f9fafb',
  border: '1px solid #d1d5db',
  borderRadius: '0 0 8px 8px',
  marginRight: '1px',
  position: 'relative',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  ':hover': {
    background: '#f3f4f6',
    transform: 'translateY(2px)',
  },
});

export const blackKey = style({
  width: '24px',
  height: '75px',
  background: '#1f2937',
  borderRadius: '0 0 4px 4px',
  position: 'absolute',
  top: 0,
  zIndex: 2,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid #000',
  ':hover': {
    background: '#374151',
    transform: 'translateY(2px)',
  },
});

export const keyActive = style({
  animation: `${keyPress} 0.6s ease`,
});

export const whiteKeyActive = style({
  background: '#3b82f6',
});

export const blackKeyActive = style({
  background: '#6366f1',
});

export const controlsPreview = style({
  background: 'rgba(0, 0, 0, 0.3)',
  borderRadius: '12px',
  padding: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

export const controlBtn = style({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  color: 'white',
  fontSize: '1rem',
});

export const recordBtn = style({
  background: '#ef4444',
});

export const playBtn = style({
  background: '#22c55e',
});

export const userAvatars = style({
  display: 'flex',
  gap: '0.5rem',
  marginLeft: 'auto',
});

export const avatar = style({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '0.8rem',
  fontWeight: 600,
});

// Features Section
export const features = style({
  padding: '4rem 2rem',
  background: '#f8fafc',
});

export const featuresContainer = style({
  maxWidth: '1200px',
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

export const featuresGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
});

export const featureCard = style({
  background: 'white',
  padding: '2rem',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  border: '1px solid #e5e7eb',
  ':hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
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
  color: '#1f2937',
  fontWeight: 600,
});

export const featureText = style({
  color: '#6b7280',
  lineHeight: 1.6,
  margin: 0,
});

// How It Works Section
export const howItWorks = style({
  padding: '4rem 2rem',
  background: '#f8fafc',
});

export const howContainer = style({
  maxWidth: '1000px',
  margin: '0 auto',
});

export const steps = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '2rem',
});

export const step = style({
  textAlign: 'center',
  position: 'relative',
});

export const stepNumber = style({
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '1.25rem',
  margin: '0 auto 1.5rem',
});

export const stepTitle = style({
  fontFamily: vars.fonts.heading,
  fontSize: '1.25rem',
  marginBottom: '1rem',
  color: '#1f2937',
  fontWeight: 600,
});

export const stepText = style({
  color: '#6b7280',
  margin: 0,
  lineHeight: 1.6,
});

// CTA Section
export const ctaSection = style({
  background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
  color: 'white',
  padding: '6rem 2rem',
  textAlign: 'center',
});

export const ctaContainer = style({
  maxWidth: '800px',
  margin: '0 auto',
});

export const ctaHeading = style({
  fontSize: '2.5rem',
  marginBottom: '1.5rem',
  '@media': {
    '(max-width: 768px)': {
      fontSize: '2rem',
    },
  },
});

export const ctaText = style({
  fontSize: '1.25rem',
  marginBottom: '2.5rem',
  opacity: 0.9,
});

// Animations
export const fadeIn = style({
  opacity: 0,
  transform: 'translateY(20px)',
  animation: `${fadeInUp} 0.8s ease forwards`,
});

export const spinner = style({
  width: '20px',
  height: '20px',
  border: '2px solid transparent',
  borderTop: '2px solid currentColor',
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
});

// New Action Section Styles
export const actionSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.5rem',
  marginBottom: '2rem',
});

export const orDivider = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '0.9rem',
  '::before': {
    content: '""',
    height: '1px',
    width: '50px',
    background: 'rgba(255, 255, 255, 0.3)',
  },
  '::after': {
    content: '""',
    height: '1px',
    width: '50px',
    background: 'rgba(255, 255, 255, 0.3)',
  },
});

export const joinSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
});

export const joinLabel = style({
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '0.9rem',
  marginBottom: '0.5rem',
});

export const joinInputGroup = style({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
});

export const roomCodeInput = style({
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  background: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  fontFamily: vars.fonts.body,
  fontSize: '1.1rem',
  textAlign: 'center',
  textTransform: 'lowercase',
  width: '120px',
  ':focus': {
    outline: 'none',
    borderColor: '#fbbf24',
    background: 'rgba(255, 255, 255, 0.15)',
  },
  '::placeholder': {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export const joinButton = style({
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  border: 'none',
  background: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    background: 'rgba(255, 255, 255, 0.3)',
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const simpleFlow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '0.9rem',
  marginTop: '1rem',
  '@media': {
    '(max-width: 768px)': {
      flexDirection: 'column',
      gap: '0.25rem',
    },
  },
});

export const demoContext = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
});

export const demoDescription = style({
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '0.9rem',
  textAlign: 'center',
  margin: 0,
  fontStyle: 'italic',
});

// FAQ Section Styles
export const faq = style({
  padding: '4rem 2rem',
  background: 'white',
});

export const faqContainer = style({
  maxWidth: '1200px',
  margin: '0 auto',
});

export const faqGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '1.5rem',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const faqItem = style({
  background: '#f8fafc',
  padding: '1.5rem',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
});

export const faqQuestion = style({
  fontSize: '1rem',
  marginBottom: '0.5rem',
  color: '#374151',
});

export const faqAnswer = style({
  fontSize: '0.95rem',
  color: '#6b7280',
  margin: 0,
});

// Expectations Section Styles
export const expectations = style({
  padding: '4rem 2rem',
  background: 'white',
});

export const expectationsContainer = style({
  maxWidth: '800px',
  margin: '0 auto',
});

export const expectationsList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const expectationItem = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
  padding: '1rem',
  background: 'white',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
});

export const expectationIcon = style({
  fontSize: '1.2rem',
  minWidth: '24px',
  textAlign: 'center',
});

export const expectationText = style({
  color: '#374151',
  fontSize: '0.95rem',
  lineHeight: 1.5,
});
