import { useEffect, useState } from 'react'
import { SESSION_MINUTES, useGame } from '../game/GameContext'
import { dueReviews, levelFor, liveStreak, titleFor, xpForLevel } from '../game/progress'
import { Icon } from './Icon'

type Theme = 'light' | 'dark' | null

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('code-quest:theme') as Theme) ?? null
    } catch {
      return null
    }
  })
  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme
    else delete document.documentElement.dataset.theme
    try {
      if (theme) localStorage.setItem('code-quest:theme', theme)
      else localStorage.removeItem('code-quest:theme')
    } catch {
      /* storage blocked: theme just won't be remembered */
    }
  }, [theme])
  const isDark = theme ? theme === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return { isDark, toggle: () => setTheme(isDark ? 'light' : 'dark') }
}

function SessionTimer() {
  const { session } = useGame()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!session.endsAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [session.endsAt])

  if (!session.endsAt) {
    return (
      <button className="hud-btn" onClick={session.start} title={`Start a ${SESSION_MINUTES}-minute focus session`}>
        <Icon name="clock" size={16} /> <span className="hide-sm">Focus {SESSION_MINUTES}m</span>
      </button>
    )
  }
  const left = Math.max(0, session.endsAt - now)
  const m = Math.floor(left / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return (
    <button className="hud-btn running" onClick={session.stop} title="Stop the focus session">
      <Icon name="clock" size={16} /> {m}:{String(s).padStart(2, '0')}
    </button>
  )
}

export function Header({ route }: { route: string }) {
  const { p } = useGame()
  const theme = useTheme()
  const level = levelFor(p.xp)
  const from = xpForLevel(level)
  const to = xpForLevel(level + 1)
  const pct = ((p.xp - from) / (to - from)) * 100
  const streak = liveStreak(p)
  const due = dueReviews(p).length
  const section = route.split('/')[1] ?? ''

  const tabs: [string, string, boolean][] = [
    ['#/', 'Home', section === ''],
    ['#/map', 'Learn', ['map', 'tree', 'project', 'realm', 'lesson'].includes(section)],
    ['#/review', 'Review', section === 'review'],
    ['#/explain', 'Explain', section === 'explain'],
    ['#/roadmap', 'Roadmap', section === 'roadmap'],
    ['#/profile', 'Profile', section === 'profile'],
  ]

  return (
    <header className="topbar">
      <a className="wordmark" href="#/">
        Code<span>Quest</span>
      </a>
      <nav className="tabs" aria-label="Main">
        {tabs.map(([href, label, active]) => (
          <a key={href} href={href} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>
            {label}
            {label === 'Review' && due > 0 && <span className="badge">{due}</span>}
          </a>
        ))}
      </nav>
      <div className="hud">
        <span className={`stat-chip ${streak ? 'is-hot' : ''}`} title={`Streak: ${streak} days · best ${p.bestStreak} · ${p.freezes} freezes`}>
          <Icon name="flame" size={16} /> {streak}
        </span>
        <span className="stat-chip" title="Gems: earned from lessons, spent on streak freezes">
          <Icon name="gem" size={16} /> {p.gems}
        </span>
        {p.combo > 1 && (
          <span className="stat-chip is-combo" title="Combo: first-try answers in a row">
            <Icon name="bolt" size={16} /> ×{p.combo}
          </span>
        )}
        <a className="level-chip" href="#/profile" title={`${p.xp} XP · ${to - p.xp} XP to level ${level + 1}`}>
          <span className="level-num">LV{level}</span>
          <span className="level-meta">
            <span className="level-title">{titleFor(level)}</span>
            <span className="meter">
              <span style={{ width: `${pct}%` }} />
            </span>
          </span>
        </a>
        <SessionTimer />
        <button className="hud-btn icon-only" onClick={theme.toggle} aria-label={theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          <Icon name={theme.isDark ? 'sun' : 'moon'} size={16} />
        </button>
      </div>
    </header>
  )
}
