import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import Footer from './Footer';

// Mock CSS imports
vi.mock('./Footer.css', () => ({
  footer: 'footer',
  link: 'link',
}));

describe('Footer', () => {
  it('should render without crashing', () => {
    render(() => <Footer />);
    expect(screen.getByText(/open to the public 7 days a week/)).toBeInTheDocument();
  });

  it('should display the main footer text', () => {
    render(() => <Footer />);
    expect(screen.getByText(/open to the public 7 days a week/)).toBeInTheDocument();
    expect(screen.getByText(/made by/)).toBeInTheDocument();
  });

  it('should render d-buckner link', () => {
    render(() => <Footer />);
    const link = screen.getByRole('link', { name: 'd-buckner' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('https://d-buckner.org');
  });

  it('should have proper CSS classes', () => {
    render(() => <Footer />);
    const footerElement = document.querySelector('.footer');
    const linkElement = document.querySelector('.link');
    
    expect(footerElement).toBeInTheDocument();
    expect(linkElement).toBeInTheDocument();
  });

  it('should have external link attributes', () => {
    render(() => <Footer />);
    const link = screen.getByRole('link', { name: 'd-buckner' });
    
    // The link should point to external site
    expect(link.getAttribute('href')).toBe('https://d-buckner.org');
  });
});
