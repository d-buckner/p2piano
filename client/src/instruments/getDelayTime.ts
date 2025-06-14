// takes delay in ms and converts to tonejs time string
export default function getDelayTime(delay: number = 0): string {
  return `+${Math.max(delay, 0) / 1000}`;
}
