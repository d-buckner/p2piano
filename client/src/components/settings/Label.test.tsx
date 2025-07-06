import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import Label from './Label';


describe('Label', () => {
  it('should render the label text', () => {
    const { getByText } = render(() => <Label label="Test Label" />);
    expect(getByText('Test Label')).toBeInTheDocument();
  });

  it('should render with the correct class', () => {
    const { container } = render(() => <Label label="Another Label" />);
    const labelElement = container.querySelector('label');
    expect(labelElement).toBeDefined();
    expect(labelElement?.className).toMatch(/label/);
  });

  it('should render different label texts', () => {
    const { getByText, unmount } = render(() => <Label label="First" />);
    expect(getByText('First')).toBeInTheDocument();
    unmount();
    
    const { getByText: getByTextSecond } = render(() => <Label label="Second" />);
    expect(getByTextSecond('Second')).toBeInTheDocument();
  });

  it('should handle empty label', () => {
    const { container } = render(() => <Label label="" />);
    const labelElement = container.querySelector('label');
    expect(labelElement).toBeDefined();
    expect(labelElement?.textContent).toBe('');
  });

  it('should handle special characters in label', () => {
    const specialLabel = 'Label with & < > " \' characters';
    const { getByText } = render(() => <Label label={specialLabel} />);
    expect(getByText(specialLabel)).toBeInTheDocument();
  });
});