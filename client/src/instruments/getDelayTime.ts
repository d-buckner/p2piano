// takes delay in ms and converts to tonejs time string
export default function getDelayTime(delay: number): string {
  return `+${Math.max(delay, 0) / 1000}`;
}