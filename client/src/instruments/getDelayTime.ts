// takes delay in ms and converts to tonejs time string
export default function getDelayTime(delay?: number): string | undefined {
  if (!delay) {
    return;
  }

  return `+${Math.max(delay, 0) / 1000}`;
}
