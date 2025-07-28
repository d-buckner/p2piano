import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import LandingPiano from './LandingPiano';

// Mock the CSS imports
vi.mock('./LandingPiano.css', () => ({
  container: 'container',
  pianoContainer: 'pianoContainer',
  whiteKeysContainer: 'whiteKeysContainer',
  blackKeysContainer: 'blackKeysContainer',
  whiteKey: 'whiteKey',
  blackKey: 'blackKey',
  keyActive: 'keyActive',
  userAvatars: 'userAvatars',
  userAvatar: 'userAvatar',
  avatar: 'avatar',
  avatarActive: 'avatarActive',
  userName: 'userName',
  description: 'description',
}));

describe('LandingPiano', () => {
  it('should render without crashing', () => {
    render(() => <LandingPiano />);
    // Should render the piano component structure
    const container = document.querySelector('.container');
    expect(container).toBeInTheDocument();
  });

  it('should render piano keys', () => {
    render(() => <LandingPiano />);
    // Should have white keys container
    const container = document.querySelector('.whiteKeysContainer');
    expect(container).toBeInTheDocument();
  });

  it('should render user avatars', () => {
    render(() => <LandingPiano />);
    // Should render user names
    expect(screen.getByText('Emma')).toBeInTheDocument();
    expect(screen.getByText('Liam')).toBeInTheDocument();
    expect(screen.getByText('Sophia')).toBeInTheDocument();
  });

  it('should render user avatar initials', () => {
    render(() => <LandingPiano />);
    // Should render first letters
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('should have piano and user avatar containers', () => {
    render(() => <LandingPiano />);
    // Should have piano container
    const pianoContainer = document.querySelector('.pianoContainer');
    expect(pianoContainer).toBeInTheDocument();
    
    // Should have user avatars container
    const userAvatars = document.querySelector('.userAvatars');
    expect(userAvatars).toBeInTheDocument();
  });
});
