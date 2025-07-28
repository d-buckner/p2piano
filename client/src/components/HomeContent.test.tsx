import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import HomeContent from './HomeContent';

// Mock router
vi.mock('@solidjs/router', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

// Mock dependencies
vi.mock('../actions/RoomActions', () => ({
  setRoom: vi.fn(),
}));

vi.mock('../audio/AudioManager', () => ({
  default: {
    activate: vi.fn(),
  },
}));

vi.mock('../clients/RoomClient', () => ({
  createNewRoom: vi.fn().mockResolvedValue({ roomId: 'TEST1' }),
}));

vi.mock('./LandingPiano', () => ({
  default: () => <div data-testid="landing-piano">Landing Piano Mock</div>,
}));

// Mock CSS imports
vi.mock('./HomeContent.css', () => ({
  container: 'container',
  hero: 'hero',
  heroContent: 'heroContent',
  heroText: 'heroText',
  mainHeading: 'mainHeading',
  brand: 'brand',
  subHeading: 'subHeading',
  actionSection: 'actionSection',
  ctaButton: 'ctaButton',
  orDivider: 'orDivider',
  joinSection: 'joinSection',
  joinLabel: 'joinLabel',
  joinInputGroup: 'joinInputGroup',
  roomCodeInput: 'roomCodeInput',
  joinButton: 'joinButton',
  simpleFlow: 'simpleFlow',
  heroVisual: 'heroVisual',
  demoContext: 'demoContext',
  demoDescription: 'demoDescription',
  features: 'features',
  featuresContainer: 'featuresContainer',
  sectionHeading: 'sectionHeading',
  featuresGrid: 'featuresGrid',
  featureCard: 'featureCard',
  featureIcon: 'featureIcon',
  featureTitle: 'featureTitle',
  featureText: 'featureText',
  faq: 'faq',
  faqContainer: 'faqContainer',
  faqGrid: 'faqGrid',
  faqItem: 'faqItem',
  faqQuestion: 'faqQuestion',
  faqAnswer: 'faqAnswer',
  howItWorks: 'howItWorks',
  howContainer: 'howContainer',
  steps: 'steps',
  step: 'step',
  stepNumber: 'stepNumber',
  stepTitle: 'stepTitle',
  stepText: 'stepText',
  expectations: 'expectations',
  expectationsContainer: 'expectationsContainer',
  expectationsList: 'expectationsList',
  expectationItem: 'expectationItem',
  expectationIcon: 'expectationIcon',
  spinner: 'spinner',
}));

describe('HomeContent', () => {
  const renderHomeContent = () => {
    return render(() => <HomeContent />);
  };

  it('should render without crashing', () => {
    renderHomeContent();
    expect(screen.getByText('The Best Way to Play Piano Together Online')).toBeInTheDocument();
  });

  it('should render main heading and subheading', () => {
    renderHomeContent();
    expect(screen.getByText('The Best Way to Play Piano Together Online')).toBeInTheDocument();
    expect(screen.getByText(/Make music together online/)).toBeInTheDocument();
  });

  it('should render create room button', () => {
    renderHomeContent();
    expect(screen.getByText('Create New Room')).toBeInTheDocument();
  });

  it('should render room code input', () => {
    renderHomeContent();
    expect(screen.getByText('Have a room code?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('abcde')).toBeInTheDocument();
  });

  it('should render landing piano demo', () => {
    renderHomeContent();
    expect(screen.getByTestId('landing-piano')).toBeInTheDocument();
  });

  it('should render features section', () => {
    renderHomeContent();
    expect(screen.getByText('What to Expect')).toBeInTheDocument();
    expect(screen.getByText('Real-Time Synchronization')).toBeInTheDocument();
    expect(screen.getByText('High-Quality Piano Sounds')).toBeInTheDocument();
  });

  it('should render FAQ section', () => {
    renderHomeContent();
    expect(screen.getByText('Quick Questions')).toBeInTheDocument();
    expect(screen.getByText('❓ Do I need to download anything?')).toBeInTheDocument();
    expect(screen.getByText('❓ Is it really free?')).toBeInTheDocument();
  });

  it('should render how it works section', () => {
    renderHomeContent();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Create a Room')).toBeInTheDocument();
    expect(screen.getByText('Share the Code')).toBeInTheDocument();
    expect(screen.getByText('Start Playing')).toBeInTheDocument();
  });

  it('should render performance section', () => {
    renderHomeContent();
    expect(screen.getByText('Performance & Privacy')).toBeInTheDocument();
    expect(screen.getByText(/Optimized for low latency/)).toBeInTheDocument();
  });
});
