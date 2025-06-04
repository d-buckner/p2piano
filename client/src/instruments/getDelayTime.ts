// takes delay in ms and converts to tonejs time string
export default function getDelayTime(delay: number): string | undefined {
  if (delay === 0) {
    return;
  }

  return `+${Math.max(delay, 0) / 1000}`;
}
