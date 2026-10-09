import type { Realm } from '../types'
import { onColor } from './onColor'

export function RealmTile({ realm, size = 'md' }: { realm: Realm; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`tile tile-${size}`} style={{ background: realm.color, color: onColor(realm.color) }} aria-hidden="true">
      {realm.glyph}
    </span>
  )
}
