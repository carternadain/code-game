import { useEffect, useState } from 'react'
import { today, type Progress } from './progress'

/**
 * Asks the browser to treat this site's saved data as permanent, so it isn't cleared
 * automatically when the device runs low on space. Clearing site data by hand still deletes it,
 * which is why the backup file exists too.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

/** Whether the browser has granted permanent storage. */
export function usePersisted() {
  // null = still checking; false also covers browsers without the Storage API.
  const [persisted, setPersisted] = useState<boolean | null>(() => ('storage' in navigator && 'persisted' in navigator.storage ? null : false))
  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted, () => setPersisted(false))
  }, [])
  return [persisted, setPersisted] as const
}

/** Downloads the full save as a JSON file. Returns the progress with the backup date recorded. */
export function downloadBackup(p: Progress): Progress {
  const next = { ...p, lastBackup: today() }
  const blob = new Blob([JSON.stringify(next, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `codequest-progress-${today()}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  return next
}

/** True when there's real progress and no backup in the last 7 days. */
export function backupDue(p: Progress): boolean {
  if (Object.keys(p.completed).length === 0) return false
  if (!p.lastBackup) return true
  const [y, m, d] = p.lastBackup.split('-').map(Number)
  return Date.now() - new Date(y, m - 1, d).getTime() > 7 * 86_400_000
}
