import { render } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import Home from './Home';


vi.mock('../components/HomeContent', () => ({
  default: () => <div data-testid="home-content">Mocked HomeContent</div>
}));

vi.mock('../components/HomeLayout', () => ({
  default: (props: { children: unknown }) => <div data-testid="home-layout">{props.children}</div>
}));

describe('Home', () => {
  it('should render without errors', () => {
    expect(() => render(() => <Home />)).not.toThrow();
  });

  it('should render HomeLayout component', () => {
    const { getByTestId } = render(() => <Home />);
    expect(getByTestId('home-layout')).toBeInTheDocument();
  });

  it('should render HomeContent component', () => {
    const { getByTestId } = render(() => <Home />);
    expect(getByTestId('home-content')).toBeInTheDocument();
  });
});
