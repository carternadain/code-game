import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { levelFor, load, newAchievements, save, titleFor, today, touchStreak, type Progress } from './progress'

export interface Toast {
  id: number
  icon: string
  text: string
  kind: 'xp' | 'achievement' | 'level' | 'info'
}

interface Game {
  p: Progress
  /** Apply a change to progress. XP/achievement/level-up toasts are handled for you. */
  update: (fn: (p: Progress) => Progress) => void
  /** Add XP (with combo bonus if `combo`), counts as activity for the streak. */
  award: (xp: number, reason: string, opts?: { combo?: boolean; gems?: number }) => void
  breakCombo: () => void
  toasts: Toast[]
  toast: (t: Omit<Toast, 'id'>) => void
  session: { endsAt: number | null; start: () => void; stop: () => void }
}

const Ctx = createContext<Game | null>(null)

export const SESSION_MINUTES = 25

export function GameProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Progress>(load)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const nextId = useRef(1)
  const pRef = useRef(p)
  useEffect(() => {
    pRef.current = p
  }, [p])

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = nextId.current++
    setToasts((ts) => [...ts, { ...t, id }])
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3200)
  }, [])

  useEffect(() => save(p), [p])

  const update = useCallback((fn: (p: Progress) => Progress) => setP(fn), [])

  // Achievements and level-ups are detected after each change commits (not inside the state
  // updater, which React may run twice), so each one is announced exactly once.
  const shownLevel = useRef(levelFor(p.xp))
  const announced = useRef(new Set<string>())
  useEffect(() => {
    const unlocked = newAchievements(p).filter((a) => !announced.current.has(a.id))
    if (unlocked.length) {
      unlocked.forEach((a) => announced.current.add(a.id))
      unlocked.forEach((a) => toast({ icon: a.icon, text: `Achievement: ${a.name} (+10 gems)`, kind: 'achievement' }))
      // eslint-disable-next-line react/set-state-in-effect -- awarding is a consequence of the committed state
      setP((prev) => ({ ...prev, achievements: [...prev.achievements, ...unlocked.map((a) => a.id)], gems: prev.gems + 10 * unlocked.length }))
    }
    const level = levelFor(p.xp)
    if (level > shownLevel.current) toast({ icon: '⬆️', text: `Level ${level}! You are now a ${titleFor(level)}`, kind: 'level' })
    shownLevel.current = level
  }, [p, toast])

  const award = useCallback(
    (xp: number, reason: string, opts: { combo?: boolean; gems?: number } = {}) => {
      const combo = opts.combo ? pRef.current.combo + 1 : pRef.current.combo
      const bonus = opts.combo ? Math.min(combo - 1, 5) * 2 : 0
      pRef.current = { ...pRef.current, combo }
      update((prev) => touchStreak({ ...prev, xp: prev.xp + xp + bonus, combo, gems: prev.gems + (opts.gems ?? 0) }))
      queueMicrotask(() =>
        toast({ icon: '✨', text: `+${xp + bonus} XP · ${reason}${bonus ? ` (combo +${bonus})` : ''}${opts.gems ? ` · +${opts.gems} gems` : ''}`, kind: 'xp' }),
      )
    },
    [update, toast],
  )

  const breakCombo = useCallback(() => update((prev) => (prev.combo ? { ...prev, combo: 0 } : prev)), [update])

  // Daily focus session: counts minutes toward today's goal while running.
  useEffect(() => {
    if (!endsAt) return
    const tick = setInterval(() => {
      if (document.hidden) return
      update((prev) => {
        const d = today()
        return { ...prev, minutesByDay: { ...prev.minutesByDay, [d]: (prev.minutesByDay[d] ?? 0) + 1 } }
      })
    }, 60_000)
    const done = setTimeout(() => {
      setEndsAt(null)
      award(30, 'Focus session complete', { gems: 5 })
    }, endsAt - Date.now())
    return () => {
      clearInterval(tick)
      clearTimeout(done)
    }
  }, [endsAt, update, award])

  const session = useMemo(
    () => ({
      endsAt,
      start: () => setEndsAt(Date.now() + SESSION_MINUTES * 60_000),
      stop: () => setEndsAt(null),
    }),
    [endsAt],
  )

  const value = useMemo(() => ({ p, update, award, breakCombo, toasts, toast, session }), [p, update, award, breakCombo, toasts, toast, session])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const g = useContext(Ctx)
  if (!g) throw new Error('useGame must be inside GameProvider')
  return g
}
