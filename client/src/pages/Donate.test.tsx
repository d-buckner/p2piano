import { render } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import Donate from './Donate';


vi.mock('../components/PageLayout', () => ({
  default: (props: { children: unknown }) => <div data-testid="page-layout">{props.children}</div>
}));

describe('Donate', () => {
  it('should render without errors', () => {
    expect(() => render(() => <Donate />)).not.toThrow();
  });

  it('should wrap content in PageLayout', () => {
    const { getByTestId } = render(() => <Donate />);
    expect(getByTestId('page-layout')).toBeInTheDocument();
  });
});
