import { render } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import Home from './Home';


vi.mock('../components/HomeContent', () => ({
  default: () => <div data-testid="home-content">Mocked HomeContent</div>
}));

vi.mock('../components/PageLayout', () => ({
  default: (props: { children: any }) => <div data-testid="page-layout">{props.children}</div>
}));

describe('Home', () => {
  it('should render PageLayout component', () => {
    const { getByTestId } = render(() => <Home />);
    expect(getByTestId('page-layout')).toBeInTheDocument();
  });

  it('should render HomeContent component', () => {
    const { getByTestId } = render(() => <Home />);
    expect(getByTestId('home-content')).toBeInTheDocument();
  });

  it('should nest HomeContent inside PageLayout', () => {
    const { getByTestId } = render(() => <Home />);
    const pageLayout = getByTestId('page-layout');
    const homeContent = getByTestId('home-content');
    
    expect(pageLayout).toContainElement(homeContent);
  });

  it('should render without errors', () => {
    expect(() => render(() => <Home />)).not.toThrow();
  });
});