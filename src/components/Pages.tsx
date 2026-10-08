import { useRef, useState } from 'react'
import { ALL_LESSONS, REALMS, findQuiz, nextLesson } from '../content'
import { SESSION_MINUTES, useGame } from '../game/GameContext'
import { ACHIEVEMENTS, addDays, dueReviews, initialProgress, levelFor, liveStreak, scheduleReview, today, type Progress } from '../game/progress'
import type { Realm } from '../types'
import { Quiz } from './Steps'

const realmProgress = (realm: Realm, p: Progress) => realm.lessons.filter((l) => p.completed[l.id]).length

// ---------------------------------------------------------------- Today

export function Today() {
  const { p, update } = useGame()
  const next = nextLesson(p.completed)
  const due = dueReviews(p)
  const minutes = p.minutesByDay[today()] ?? 0
  const doneToday = Object.values(p.completed).filter((c) => c.day === today()).length
  const streak = liveStreak(p)
  const FREEZE_COST = 50

  return (
    <div className="page">
      <div className="hero-banner">
        <div>
          <h1>{greeting()}, adventurer.</h1>
          <p className="muted">{streak > 0 ? `🔥 ${streak}-day streak. Don't break the chain.` : 'Start a streak today — 20–30 minutes is all it takes.'}</p>
        </div>
        <div className="ring" style={{ ['--pct' as string]: Math.min(100, (minutes / SESSION_MINUTES) * 100) }}>
          <div className="ring-inner">
            <strong>{minutes}</strong>
            <span>/ {SESSION_MINUTES} min</span>
          </div>
        </div>
      </div>

      <h2 className="section-title">Today's quests</h2>
      <div className="quest-grid">
        <div className="card quest">
          <div className="quest-icon">🎯</div>
          <h3>Main quest</h3>
          {next ? (
            <>
              <p>
                <span style={{ color: next.realm.color }}>
                  {next.realm.icon} {next.realm.name}
                </span>
                <br />
                <strong>{next.lesson.title}</strong> · ~{next.lesson.minutes} min
              </p>
              <a className="btn primary" href={`#/lesson/${next.lesson.id}`}>
                {p.stepProgress[next.lesson.id] ? 'Resume →' : 'Start →'}
              </a>
            </>
          ) : (
            <p>You've finished every lesson built so far. Legendary. Check the Roadmap for what's next.</p>
          )}
        </div>
        <div className="card quest">
          <div className="quest-icon">🧠</div>
          <h3>Memory training</h3>
          <p>
            {due.length ? (
              <>
                <strong>{due.length}</strong> question{due.length === 1 ? '' : 's'} due for review. Spaced repetition moves knowledge into long-term memory.
              </>
            ) : (
              'No reviews due. Questions you finish come back on a 1 → 3 → 7 → 17-day schedule.'
            )}
          </p>
          <a className={`btn ${due.length ? 'primary' : 'ghost disabled'}`} href={due.length ? '#/review' : undefined}>
            Review {due.length ? `(${Math.min(due.length, 10)})` : ''}
          </a>
        </div>
        <div className="card quest">
          <div className="quest-icon">🧊</div>
          <h3>Streak freeze</h3>
          <p>
            Miss a day without losing your streak. You have <strong>{p.freezes}</strong>. Costs {FREEZE_COST} 💎.
          </p>
          <button
            className="btn ghost"
            disabled={p.gems < FREEZE_COST || p.freezes >= 2}
            onClick={() => update((prev) => ({ ...prev, gems: prev.gems - FREEZE_COST, freezes: prev.freezes + 1 }))}
          >
            Buy freeze {p.freezes >= 2 && '(max 2)'}
          </button>
        </div>
      </div>

      <h2 className="section-title">This week</h2>
      <WeekStrip p={p} />
      <p className="muted small">
        Lessons finished today: {doneToday}. Tip: start the {SESSION_MINUTES}-minute session timer at the top — it counts your focus minutes and pays +30 XP
        when it finishes.
      </p>

      <div className="card rules">
        <h3>The rules of CodeQuest</h3>
        <ul>
          <li>
            <strong>No AI in the arena.</strong> Use Claude to explain a concept <em>after</em> you've tried — never to write the challenge for you.
          </li>
          <li>
            <strong>Type it, don't paste it.</strong> If you reveal a solution, reset and retype it from memory.
          </li>
          <li>
            <strong>Explain it back.</strong> The 🧠 steps are where understanding gets proven.
          </li>
          <li>
            <strong>Show up daily.</strong> 25 focused minutes every day beats a 4-hour binge on Sunday.
          </li>
        </ul>
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function WeekStrip({ p }: { p: Progress }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6))
  const activeDays = new Set([...Object.values(p.completed).map((c) => c.day), ...Object.keys(p.minutesByDay), p.lastActiveDay])
  return (
    <div className="week">
      {days.map((d) => {
        const [y, m, dd] = d.split('-').map(Number)
        const label = new Date(y, m - 1, dd).toLocaleDateString(undefined, { weekday: 'short' })
        return (
          <div key={d} className={`day ${activeDays.has(d) ? 'on' : ''} ${d === today() ? 'today' : ''}`}>
            <span>{label}</span>
            <span className="day-dot">{activeDays.has(d) ? '🔥' : '·'}</span>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------- World map

export function WorldMap() {
  const { p } = useGame()
  const total = ALL_LESSONS.length
  const done = ALL_LESSONS.filter((x) => p.completed[x.lesson.id]).length
  return (
    <div className="page">
      <h1>World Map</h1>
      <p className="muted">
        {done}/{total} lessons cleared. Realms are ordered by the suggested path, but everything is open — follow your curiosity.
      </p>
      <div className="realm-grid">
        {REALMS.map((r) => {
          const n = realmProgress(r, p)
          const complete = n === r.lessons.length
          return (
            <a key={r.id} className={`card realm ${complete ? 'complete' : ''}`} href={`#/realm/${r.id}`} style={{ ['--realm' as string]: r.color }}>
              <div className="realm-icon">{r.icon}</div>
              <div className="realm-when">{r.when}</div>
              <h3>{r.name}</h3>
              <div className="realm-topic">{r.topic}</div>
              <div className="progress">
                <div style={{ width: `${(n / r.lessons.length) * 100}%` }} />
              </div>
              <div className="muted small">
                {n}/{r.lessons.length} lessons {complete && '· 🏆'} · {r.comingSoon.length} on the roadmap
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

export function RealmView({ realm }: { realm: Realm }) {
  const { p } = useGame()
  return (
    <div className="page">
      <a href="#/map" className="back">
        ← World Map
      </a>
      <div className="realm-header" style={{ ['--realm' as string]: realm.color }}>
        <div className="realm-icon big">{realm.icon}</div>
        <div>
          <div className="realm-when">
            {realm.when} · {realm.topic}
          </div>
          <h1>{realm.name}</h1>
          <p className="muted">{realm.blurb}</p>
        </div>
      </div>
      <div className="path">
        {realm.lessons.map((l, i) => {
          const done = !!p.completed[l.id]
          const started = p.stepProgress[l.id] != null
          return (
            <a
              key={l.id}
              href={`#/lesson/${l.id}`}
              className={`node ${done ? 'done' : ''} ${l.boss ? 'boss' : ''}`}
              style={{ marginLeft: `${Math.sin(i * 1.1) * 90 + 90}px`, ['--realm' as string]: realm.color }}
            >
              <span className="node-dot">{done ? '✔' : l.boss ? '🐉' : i + 1}</span>
              <span className="node-label">
                <strong>{l.title}</strong>
                <span className="muted small">
                  {l.steps.length} steps · ~{l.minutes} min {started && !done && '· in progress'}
                </span>
              </span>
            </a>
          )
        })}
        {realm.comingSoon.map((title, i) => (
          <div
            key={title}
            className="node locked"
            style={{ marginLeft: `${Math.sin((realm.lessons.length + i) * 1.1) * 90 + 90}px` }}
            title="On the roadmap — not built yet"
          >
            <span className="node-dot">🔒</span>
            <span className="node-label">
              <strong>{title}</strong>
              <span className="muted small">coming soon</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Review (spaced repetition)

export function Review() {
  const { p, update, award, breakCombo } = useGame()
  const [queue] = useState(() =>
    dueReviews(p)
      .slice(0, 10)
      .map((c) => c.id),
  )
  const [i, setI] = useState(0)
  const [answered, setAnswered] = useState(false)
  const cardId = queue[i]
  const found = cardId ? findQuiz(cardId) : undefined

  if (!queue.length || i >= queue.length) {
    return (
      <div className="page center-page">
        <div className="big-emoji">🧠</div>
        <h1>{queue.length ? 'Review complete!' : 'Nothing to review'}</h1>
        <p className="muted">Come back tomorrow — the questions you missed will be waiting.</p>
        <a className="btn primary" href="#/">
          Back to Today
        </a>
      </div>
    )
  }
  if (!found) {
    // The lesson content changed and this card no longer exists — drop it.
    update((prev) => ({ ...prev, review: prev.review.filter((c) => c.id !== cardId) }))
    setI(i + 1)
    return null
  }
  return (
    <div className="page lesson">
      <div className="lesson-title">
        🧠 Review {i + 1}/{queue.length} · from{' '}
        <span style={{ color: found.realm.color }}>
          {found.realm.icon} {found.lesson.title}
        </span>
      </div>
      <div className="card step-card" key={cardId}>
        <Quiz
          step={found.quiz}
          onAnswer={(firstTry) => {
            setAnswered(true)
            update((prev) => scheduleReview(prev, cardId, firstTry))
            if (firstTry) award(10, 'Remembered!', { combo: true })
            else breakCombo()
          }}
        />
      </div>
      <div className="lesson-bottom">
        <button
          className="btn primary big"
          disabled={!answered}
          onClick={() => {
            setAnswered(false)
            setI(i + 1)
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Profile

export function Profile() {
  const { p, update, toast } = useGame()
  const fileRef = useRef<HTMLInputElement>(null)
  const level = levelFor(p.xp)
  const lessonsDone = Object.keys(p.completed).length
  const totalMinutes = Object.values(p.minutesByDay).reduce((a, b) => a + b, 0)
  const journal = Object.entries(p.journal)

  function exportProgress() {
    const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `codequest-progress-${today()}.json`
    a.click()
  }

  function importProgress(file: File) {
    file.text().then((t) => {
      try {
        const data = JSON.parse(t)
        if (typeof data.xp !== 'number') throw new Error('not a progress file')
        update(() => ({ ...initialProgress(), ...data }))
        toast({ icon: '📥', text: 'Progress imported', kind: 'info' })
      } catch {
        toast({ icon: '⚠️', text: "That file isn't a CodeQuest save", kind: 'info' })
      }
    })
  }

  return (
    <div className="page">
      <h1>Your profile</h1>
      <div className="stats">
        <Stat label="Level" value={level} />
        <Stat label="Total XP" value={p.xp} />
        <Stat label="Lessons" value={`${lessonsDone}/${ALL_LESSONS.length}`} />
        <Stat label="Best streak" value={`${p.bestStreak}d`} />
        <Stat label="Challenges passed" value={p.stats.codePasses} />
        <Stat label="No-hint passes" value={p.stats.noHintPasses} />
        <Stat label="Bosses" value={p.stats.bossesBeaten} />
        <Stat label="Focus minutes" value={totalMinutes} />
      </div>

      <h2 className="section-title">Activity</h2>
      <Heatmap p={p} />

      <h2 className="section-title">Achievements</h2>
      <div className="achievements">
        {ACHIEVEMENTS.map((a) => {
          const got = p.achievements.includes(a.id)
          return (
            <div key={a.id} className={`card achievement ${got ? 'got' : ''}`} title={a.desc}>
              <div className="ach-icon">{got ? a.icon : '🔒'}</div>
              <strong>{a.name}</strong>
              <span className="muted small">{a.desc}</span>
            </div>
          )
        })}
      </div>

      <h2 className="section-title">Journal ({journal.length})</h2>
      {journal.length === 0 && <p className="muted">Your "explain it back" answers will collect here. Re-reading them is a great review.</p>}
      <div className="journal">
        {journal.map(([key, text]) => {
          const [lessonId] = key.split('#')
          const found = ALL_LESSONS.find((x) => x.lesson.id === lessonId)
          return (
            <div key={key} className="card">
              <div className="muted small">
                {found?.realm.icon} {found?.lesson.title}
              </div>
              <p>{text}</p>
            </div>
          )
        })}
      </div>

      <h2 className="section-title">Save data</h2>
      <p className="muted small">Progress is saved in this browser. Export it to back it up or move to another device.</p>
      <div className="toolbar">
        <button className="btn ghost" onClick={exportProgress}>
          📤 Export progress
        </button>
        <button className="btn ghost" onClick={() => fileRef.current?.click()}>
          📥 Import progress
        </button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importProgress(e.target.files[0])} />
        <div className="spacer" />
        <button
          className="btn danger"
          onClick={() => {
            if (confirm('Reset ALL progress? This cannot be undone.')) update(() => initialProgress())
          }}
        >
          Reset progress
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card stat">
      <strong>{value}</strong>
      <span className="muted small">{label}</span>
    </div>
  )
}

function Heatmap({ p }: { p: Progress }) {
  const weeks = 20
  const activity: Record<string, number> = { ...p.minutesByDay }
  for (const c of Object.values(p.completed)) activity[c.day] = (activity[c.day] ?? 0) + 10
  const start = addDays(today(), -(weeks * 7 - 1))
  const cells = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i))
  return (
    <div className="heatmap">
      {cells.map((d) => {
        const v = activity[d] ?? 0
        const lvl = v === 0 ? 0 : v < 10 ? 1 : v < 20 ? 2 : v < 30 ? 3 : 4
        return <div key={d} className={`hm l${lvl}`} title={`${d}: ${v ? `${v} activity` : 'no activity'}`} />
      })}
    </div>
  )
}
