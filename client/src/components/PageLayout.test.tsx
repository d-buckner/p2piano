import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import PageLayout from './PageLayout';


interface MockAProps {
  children: unknown;
}

// Mock dependencies
vi.mock('./Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar Mock</nav>,
}));

vi.mock('./Footer', () => ({
  default: () => <footer data-testid="footer-component">Footer Mock</footer>,
}));

// Mock router
vi.mock('@solidjs/router', () => ({
  A: (props: MockAProps) => <a {...props}>{props.children}</a>,
}));

// Mock CSS imports
vi.mock('./PageLayout.css', () => ({
  page: 'page',
  header: 'header',
  main: 'main',
  footer: 'footer',
}));

describe('PageLayout', () => {
  const renderPageLayout = (children = <div>Test Content</div>) => {
    return render(() => <PageLayout>{children}</PageLayout>);
  };

  it('should render without crashing', () => {
    renderPageLayout();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer-component')).toBeInTheDocument();
  });

  it('should render navbar in header', () => {
    renderPageLayout();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('should render footer', () => {
    renderPageLayout();
    expect(screen.getByTestId('footer-component')).toBeInTheDocument();
  });

  it('should render children content in main', () => {
    const testContent = <div>Page Content</div>;
    renderPageLayout(testContent);
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('should have proper grid layout structure', () => {
    renderPageLayout();
    const page = document.querySelector('.page');
    const header = document.querySelector('.header');
    const main = document.querySelector('.main');
    const footer = document.querySelector('.footer');
    
    expect(page).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });
});
