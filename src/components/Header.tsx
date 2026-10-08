import { useEffect, useState } from 'react'
import { SESSION_MINUTES, useGame } from '../game/GameContext'
import { levelFor, liveStreak, titleFor, xpForLevel } from '../game/progress'

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
      <button className="btn session" onClick={session.start} title="Start a focused learning session">
        ⏱ Start {SESSION_MINUTES}-min session
      </button>
    )
  }
  const left = Math.max(0, session.endsAt - now)
  const m = Math.floor(left / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return (
    <button className="btn session running" onClick={session.stop} title="Stop session">
      ⏱ {m}:{String(s).padStart(2, '0')}
    </button>
  )
}

export function Header({ route }: { route: string }) {
  const { p } = useGame()
  const level = levelFor(p.xp)
  const from = xpForLevel(level)
  const to = xpForLevel(level + 1)
  const pct = ((p.xp - from) / (to - from)) * 100
  const streak = liveStreak(p)

  const link = (href: string, label: string) => (
    <a href={href} className={route.startsWith(href.slice(1)) || (href === '#/' && route === '/') ? 'active' : ''}>
      {label}
    </a>
  )

  return (
    <header className="header">
      <a className="logo" href="#/">
        <span className="logo-mark">{'</>'}</span> CodeQuest
      </a>
      <nav>
        {link('#/', 'Today')}
        {link('#/map', 'World Map')}
        {link('#/roadmap', 'Roadmap')}
        {link('#/profile', 'Profile')}
      </nav>
      <div className="hud">
        <div className="level" title={`${p.xp} XP total · ${to - p.xp} XP to level ${level + 1}`}>
          <span className="level-num">Lv {level}</span>
          <div className="level-info">
            <span className="level-title">{titleFor(level)}</span>
            <div className="xpbar">
              <div className="xpfill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        <span className={`chip ${streak ? 'fire' : ''}`} title={`Best: ${p.bestStreak} days · Freezes: ${p.freezes}`}>
          🔥 {streak}
        </span>
        <span className="chip" title="Gems: earn by finishing lessons, spend on streak freezes">
          💎 {p.gems}
        </span>
        {p.combo > 1 && <span className="chip combo">⚡ x{p.combo}</span>}
        <SessionTimer />
      </div>
    </header>
  )
}
