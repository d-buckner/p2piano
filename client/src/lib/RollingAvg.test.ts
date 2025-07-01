import { describe, it, expect } from 'vitest';
import RollingAvg from './RollingAvg';


describe('RollingAvg', () => {
  it('should initialize with correct window size', () => {
    const avg = new RollingAvg(5);
    expect(avg.avg).toBe(0);
  });

  it('should calculate average with partial buffer', () => {
    const avg = new RollingAvg(5);
    
    avg.add(10);
    expect(avg.avg).toBe(10);
    
    avg.add(20);
    expect(avg.avg).toBe(15);
    
    avg.add(30);
    expect(avg.avg).toBe(20);
  });

  it('should maintain rolling window when buffer is full', () => {
    const avg = new RollingAvg(3);
    
    // Fill the buffer
    avg.add(10);
    avg.add(20);
    avg.add(30);
    expect(avg.avg).toBe(20);
    
    // Add one more - should replace the first value (10)
    avg.add(40);
    expect(avg.avg).toBe(30); // (20 + 30 + 40) / 3
    
    // Add another - should replace the second value (20)
    avg.add(50);
    expect(avg.avg).toBe(40); // (30 + 40 + 50) / 3
  });

  it('should handle window size of 1', () => {
    const avg = new RollingAvg(1);
    
    avg.add(100);
    expect(avg.avg).toBe(100);
    
    avg.add(200);
    expect(avg.avg).toBe(200);
  });

  it('should handle negative numbers', () => {
    const avg = new RollingAvg(3);
    
    avg.add(-10);
    avg.add(-20);
    avg.add(-30);
    
    expect(avg.avg).toBe(-20);
  });

  it('should handle floating point numbers', () => {
    const avg = new RollingAvg(2);
    
    avg.add(1.5);
    avg.add(2.5);
    
    expect(avg.avg).toBeCloseTo(2.0, 1);
  });

  it('should handle zero values', () => {
    const avg = new RollingAvg(3);
    
    avg.add(0);
    avg.add(10);
    avg.add(0);
    
    expect(avg.avg).toBeCloseTo(3.33, 1);
  });
});