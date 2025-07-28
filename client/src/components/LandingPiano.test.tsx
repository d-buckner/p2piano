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
    expect(screen.getByText('Watch multiple users play together in real-time')).toBeInTheDocument();
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

  it('should have description text', () => {
    render(() => <LandingPiano />);
    expect(screen.getByText('Watch multiple users play together in real-time')).toBeInTheDocument();
  });
});
