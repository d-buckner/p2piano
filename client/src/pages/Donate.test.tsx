import { render } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import Donate from './Donate';


vi.mock('../components/PageLayout', () => ({
  default: (props: { children: unknown }) => <div data-testid="page-layout">{props.children}</div>
}));

describe('Donate', () => {
  it('should render the donate heading', () => {
    const { getByText } = render(() => <Donate />);
    expect(getByText('donate')).toBeInTheDocument();
  });

  it('should render the donation message', () => {
    const { getByText } = render(() => <Donate />);
    const message = getByText(/this project is provided free of charge/);
    expect(message).toBeInTheDocument();
  });

  it('should render Seattle JazzED link with correct href', () => {
    const { getByText } = render(() => <Donate />);
    const seattleJazzLink = getByText('Seattle JazzED') as HTMLAnchorElement;
    expect(seattleJazzLink).toBeInTheDocument();
    expect(seattleJazzLink.href).toBe('https://www.seattlejazzed.org/donate');
  });

  it('should render GitHub repository link with correct href', () => {
    const { getByText } = render(() => <Donate />);
    const githubLink = getByText('the github repository') as HTMLAnchorElement;
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.href).toBe('https://github.com/d-buckner/p2piano');
  });

  it('should wrap content in PageLayout', () => {
    const { getByTestId } = render(() => <Donate />);
    expect(getByTestId('page-layout')).toBeInTheDocument();
  });

  it('should have correct container structure', () => {
    const { container } = render(() => <Donate />);
    const donateContainer = container.querySelector('[class*="donateContainer"]');
    const donateContent = container.querySelector('[class*="donateContent"]');
    
    expect(donateContainer).toBeInTheDocument();
    expect(donateContent).toBeInTheDocument();
  });

  it('should have correct heading structure', () => {
    const { container } = render(() => <Donate />);
    const heading = container.querySelector('h1');
    expect(heading).toBeInTheDocument();
    expect(heading?.className).toMatch(/donateHeading/);
  });

  it('should have correct paragraph structure', () => {
    const { container } = render(() => <Donate />);
    const paragraph = container.querySelector('p');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.className).toMatch(/donateText/);
  });

  it('should have links with correct styling class', () => {
    const { container } = render(() => <Donate />);
    const links = container.querySelectorAll('a');
    
    expect(links).toHaveLength(2);
    links.forEach(link => {
      expect(link.className).toMatch(/donateLink/);
    });
  });

  it('should render complete donation text', () => {
    const { container } = render(() => <Donate />);
    const paragraph = container.querySelector('p');
    const expectedText = /if you like this project, please consider making music more accessible/;
    expect(paragraph?.textContent).toMatch(expectedText);
  });
});
