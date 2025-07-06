import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import Icon from './Icon';


describe('Icon', () => {
  it('should display the requested icon for user recognition', () => {
    const { getByAltText } = render(() => <Icon name="volume-full" />);
    
    // User should see an icon they can recognize as representing volume
    expect(getByAltText('volume-full')).toBeInTheDocument();
  });

  it('should provide accessible alt text for screen readers', () => {
    const { getByAltText } = render(() => <Icon name="volume-muted" />);
    
    // Screen readers should announce meaningful text
    expect(getByAltText('volume-muted')).toBeInTheDocument();
  });

  it('should display consistently sized icons across different names', () => {
    const { container: container1 } = render(() => <Icon name="volume-low" />);
    const { container: container2 } = render(() => <Icon name="volume-high" />);
    
    const icon1 = container1.querySelector('img');
    const icon2 = container2.querySelector('img');
    
    // Icons should have consistent dimensions for visual alignment
    expect(icon1).toHaveAttribute('width', '16');
    expect(icon1).toHaveAttribute('height', '16');
    expect(icon2).toHaveAttribute('width', '16');
    expect(icon2).toHaveAttribute('height', '16');
  });

  it('should load different icons based on name parameter', () => {
    const { container: container1, unmount } = render(() => <Icon name="arrow-left" />);
    const icon1 = container1.querySelector('img');
    
    const icon1Src = icon1?.getAttribute('src');
    unmount();
    
    const { container: container2 } = render(() => <Icon name="arrow-right" />);
    const icon2 = container2.querySelector('img');
    const icon2Src = icon2?.getAttribute('src');
    
    // Different icon names should load different assets
    expect(icon1Src).not.toBe(icon2Src);
    expect(icon1Src).toContain('arrow-left');
    expect(icon2Src).toContain('arrow-right');
  });
});
