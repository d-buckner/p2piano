/**
 * Ring buffer to provide rolling average for a given window size
 */
export default class RollingAvg {
  private windowSize: number;
  private buffer: number[];
  private currentIndex: number;
  private sum: number;
  public avg: number;

  constructor(windowSize: number) {
    this.windowSize = windowSize;
    this.buffer = [];
    this.currentIndex = 0;
    this.sum = 0;
    this.avg = 0;
  }

  add(value: number) {
    this.sum += value;
    
    const lastValue = this.buffer[this.currentIndex];
    if (lastValue !== undefined) {
      this.sum -= lastValue;
    }
    
    this.buffer[this.currentIndex] = value;
    this.currentIndex = (this.currentIndex + 1) % this.windowSize;
    this.avg = this.sum / (this.buffer.length || 1);
  }
}
