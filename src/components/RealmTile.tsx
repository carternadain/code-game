import type { Realm } from '../types'

/** Dark or light text, whichever reads better on a realm's color. */
function onColor(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#141a33' : '#ffffff'
}

export function RealmTile({ realm, size = 'md' }: { realm: Realm; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`tile tile-${size}`} style={{ background: realm.color, color: onColor(realm.color) }} aria-hidden="true">
      {realm.glyph}
    </span>
  )
}
