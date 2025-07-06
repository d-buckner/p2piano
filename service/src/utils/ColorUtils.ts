const colors = [
  '#4fb477ff',
  '#ff7a00',
  '#5dadec',
  '#c287e8ff',
  '#f0b67fff',
];

export function getNextColor(usedColors: string[]): string {
  const usedColorSet = new Set(usedColors);
  const availableColors = colors.filter(c => !usedColorSet.has(c));
  if (availableColors.length === 0) {
    return colors[Math.floor(Math.random() * colors.length)]!;
  }
  return availableColors[Math.floor(availableColors.length / 2)]!;
}