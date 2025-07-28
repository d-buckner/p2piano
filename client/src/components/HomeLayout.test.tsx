import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import HomeLayout from './HomeLayout';


interface MockAProps {
  children: unknown;
}

// Mock dependencies
vi.mock('./Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar Mock</nav>,
}));

vi.mock('./Footer', () => ({
  default: () => <footer data-testid="footer">Footer Mock</footer>,
}));

// Mock router
vi.mock('@solidjs/router', () => ({
  A: (props: MockAProps) => <a {...props}>{props.children}</a>,
}));

// Mock CSS imports
vi.mock('./HomeLayout.css', () => ({
  page: 'page',
  main: 'main',
  footer: 'footer',
}));

describe('HomeLayout', () => {
  const renderHomeLayout = (children = <div>Test Content</div>) => {
    return render(() => <HomeLayout>{children}</HomeLayout>);
  };

  it('should render without crashing', () => {
    renderHomeLayout();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render navbar', () => {
    renderHomeLayout();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('should render footer', () => {
    renderHomeLayout();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render children content', () => {
    const testContent = <div>Custom Test Content</div>;
    renderHomeLayout(testContent);
    expect(screen.getByText('Custom Test Content')).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    renderHomeLayout();
    const page = document.querySelector('.page');
    const main = document.querySelector('.main');
    const footer = document.querySelector('.footer');
    
    expect(page).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });
});
