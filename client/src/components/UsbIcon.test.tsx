import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import UsbIcon from './UsbIcon';


describe('UsbIcon', () => {
  it('should display a USB icon for user recognition', () => {
    const { container } = render(() => <UsbIcon />);
    const svg = container.querySelector('svg');
    
    // Icon should be visible to users
    expect(svg).toBeInTheDocument();
  });

  it('should support custom sizing for different UI contexts', () => {
    const { container: container1 } = render(() => <UsbIcon />);
    const { container: container2 } = render(() => <UsbIcon width={24} height={32} />);
    
    const defaultIcon = container1.querySelector('svg');
    const customIcon = container2.querySelector('svg');
    
    // Default size
    expect(defaultIcon).toHaveAttribute('width', '16');
    expect(defaultIcon).toHaveAttribute('height', '16');
    
    // Custom size
    expect(customIcon).toHaveAttribute('width', '24');
    expect(customIcon).toHaveAttribute('height', '32');
  });

  it('should support string-based sizing for CSS units', () => {
    const { container } = render(() => <UsbIcon width="20px" height="20px" />);
    const svg = container.querySelector('svg');
    
    // Should accept CSS units for flexible styling
    expect(svg).toHaveAttribute('width', '20px');
    expect(svg).toHaveAttribute('height', '20px');
  });

  it('should respect current color for theming', () => {
    const { container } = render(() => <UsbIcon />);
    const svg = container.querySelector('svg');
    
    // Icon should inherit color from parent for consistent theming
    expect(svg).toHaveStyle({ fill: 'currentColor' });
  });

  it('should render actual icon content', () => {
    const { container } = render(() => <UsbIcon />);
    const path = container.querySelector('path');
    
    // Icon should contain actual graphics, not be empty
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('d');
    expect(path!.getAttribute('d')).not.toBe('');
  });
});