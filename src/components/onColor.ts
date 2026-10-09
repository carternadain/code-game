/** Dark or light text, whichever reads better on a realm's color. */
export function onColor(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#141a33' : '#ffffff'
}
