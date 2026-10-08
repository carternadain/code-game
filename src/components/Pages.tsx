import { useRef, useState } from 'react'
import { ALL_LESSONS, REALMS, findQuiz, nextLesson } from '../content'
import { SESSION_MINUTES, useGame } from '../game/GameContext'
import { ACHIEVEMENTS, addDays, dueReviews, initialProgress, levelFor, liveStreak, scheduleReview, titleFor, today, type Progress } from '../game/progress'
import type { Lesson, Realm, Step } from '../types'
import { RealmTile } from './RealmTile'
import { Icon, type IconName } from './Icon'
import { Quiz } from './Steps'

const realmDone = (realm: Realm, p: Progress) => realm.lessons.filter((l) => p.completed[l.id]).length
const FREEZE_COST = 50

const STEP_META: Record<Step['kind'], [IconName, string]> = {
  concept: ['book', 'read'],
  visual: ['eye', 'watch'],
  quiz: ['quiz', 'quiz'],
  code: ['code', 'code'],
  explain: ['pen', 'explain'],
}

function StepMix({ lesson }: { lesson: Lesson }) {
  const counts = new Map<Step['kind'], number>()
  lesson.steps.forEach((s) => counts.set(s.kind, (counts.get(s.kind) ?? 0) + 1))
  return (
    <span className="step-mix">
      {[...counts].map(([kind, n]) => (
        <span key={kind} title={`${n} ${STEP_META[kind][1]}`}>
          <Icon name={STEP_META[kind][0]} size={14} />
          {n}
        </span>
      ))}
    </span>
  )
}

// ---------------------------------------------------------------- Home

export function Today() {
  const { p, update } = useGame()
  const next = nextLesson(p.completed)
  const due = dueReviews(p)
  const minutes = p.minutesByDay[today()] ?? 0
  const streak = liveStreak(p)
  const level = levelFor(p.xp)
  const lessonsDone = Object.keys(p.completed).length
  const goalPct = Math.min(100, (minutes / SESSION_MINUTES) * 100)

  return (
    <div className="page">
      <div className="home-head">
        <div>
          <p className="eyebrow">{greeting()}</p>
          <h1>{streak ? `Day ${streak}. Keep the chain going.` : 'Start your streak today.'}</h1>
        </div>
        <p className="muted">
          Level {level} {titleFor(level)} · {lessonsDone} of {ALL_LESSONS.length} lessons done
        </p>
      </div>

      <div className="home-grid">
        <section className="panel continue" aria-labelledby="continue-h">
          {next ? (
            <>
              <p className="eyebrow" id="continue-h">
                {p.stepProgress[next.lesson.id] != null ? 'Pick up where you left off' : 'Up next'}
              </p>
              <div className="continue-body">
                <RealmTile realm={next.realm} size="lg" />
                <div className="continue-text">
                  <span className="muted">
                    {next.realm.name} · {next.realm.topic}
                  </span>
                  <h2>{next.lesson.title}</h2>
                  <div className="row-meta">
                    <span>
                      <Icon name="clock" size={14} /> ~{next.lesson.minutes} min
                    </span>
                    <StepMix lesson={next.lesson} />
                    {next.lesson.boss && <span className="boss-tag">Boss</span>}
                  </div>
                </div>
              </div>
              <div className="continue-foot">
                <div className="realm-progress">
                  <span className="meter wide">
                    <span style={{ width: `${(realmDone(next.realm, p) / next.realm.lessons.length) * 100}%`, background: next.realm.color }} />
                  </span>
                  <span className="muted small tnum">
                    {realmDone(next.realm, p)}/{next.realm.lessons.length} in this realm
                  </span>
                </div>
                <a className="btn primary big" href={`#/lesson/${next.lesson.id}`}>
                  {p.stepProgress[next.lesson.id] != null ? 'Resume lesson' : 'Start lesson'} <Icon name="arrowRight" />
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">All caught up</p>
              <h2>You've finished every lesson built so far.</h2>
              <a className="btn" href="#/roadmap">
                See what's coming
              </a>
            </>
          )}
        </section>

        <section className="panel goal" aria-labelledby="goal-h">
          <p className="eyebrow" id="goal-h">
            Today's goal
          </p>
          <div className="goal-body">
            <div className="ring" style={{ ['--pct' as string]: goalPct }}>
              <span className="ring-num tnum">{minutes}</span>
              <span className="ring-unit">of {SESSION_MINUTES} min</span>
            </div>
            <WeekStrip p={p} />
          </div>
          <p className="muted small">Start the Focus timer in the top bar. Every minute counts toward today, and finishing pays +30 XP.</p>
        </section>
      </div>

      <div className="side-quests">
        <a className={`quest-row ${due.length ? '' : 'is-idle'}`} href={due.length ? '#/review' : undefined}>
          <Icon name="brain" size={22} />
          <span>
            <strong>{due.length ? `${due.length} question${due.length === 1 ? '' : 's'} to review` : 'No reviews due'}</strong>
            <span className="muted small">Spaced repetition: questions come back after 1, 3, 7, then 17 days.</span>
          </span>
          {due.length > 0 && <Icon name="arrowRight" />}
        </a>
        <div className="quest-row">
          <Icon name="snow" size={22} />
          <span>
            <strong>Streak freezes: {p.freezes}/2</strong>
            <span className="muted small">A freeze covers one missed day. Costs {FREEZE_COST} gems.</span>
          </span>
          <button
            className="btn small"
            disabled={p.gems < FREEZE_COST || p.freezes >= 2}
            onClick={() => update((prev) => ({ ...prev, gems: prev.gems - FREEZE_COST, freezes: prev.freezes + 1 }))}
          >
            Buy
          </button>
        </div>
      </div>

      <h2 className="section-title">Your path</h2>
      <ol className="path-list">
        {REALMS.map((r) => {
          const n = realmDone(r, p)
          return (
            <li key={r.id}>
              <a href={`#/realm/${r.id}`} className="path-row">
                <RealmTile realm={r} size="sm" />
                <span className="path-name">
                  <strong>{r.name}</strong>
                  <span className="muted small">{r.topic}</span>
                </span>
                <span className="muted small hide-sm">{r.when}</span>
                <span className="meter" title={`${n} of ${r.lessons.length} lessons`}>
                  <span style={{ width: `${(n / r.lessons.length) * 100}%`, background: r.color }} />
                </span>
                <span className="small tnum">
                  {n}/{r.lessons.length}
                </span>
              </a>
            </li>
          )
        })}
      </ol>

      <aside className="rules">
        <h3>House rules</h3>
        <ul>
          <li>
            <strong>No AI in the arena.</strong> Ask Claude to explain a concept after you've tried. Never ask it to write the challenge.
          </li>
          <li>
            <strong>Type it, don't paste it.</strong> If you reveal a solution, reset and retype it from memory.
          </li>
          <li>
            <strong>Explain it back.</strong> The explain steps are where you find out if you really get it.
          </li>
          <li>
            <strong>Show up daily.</strong> 25 focused minutes every day beats a 4-hour Sunday binge.
          </li>
        </ul>
      </aside>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function WeekStrip({ p }: { p: Progress }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6))
  const active = new Set([...Object.values(p.completed).map((c) => c.day), ...Object.keys(p.minutesByDay), p.lastActiveDay])
  return (
    <div className="week" aria-label="Activity this week">
      {days.map((d) => {
        const [y, m, dd] = d.split('-').map(Number)
        const label = new Date(y, m - 1, dd).toLocaleDateString(undefined, { weekday: 'narrow' })
        return (
          <span key={d} className={`day ${active.has(d) ? 'on' : ''} ${d === today() ? 'today' : ''}`} title={d}>
            <span className="day-dot">{active.has(d) ? <Icon name="flame" size={14} /> : null}</span>
            {label}
          </span>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------- Learn (catalog)

export function WorldMap() {
  const { p } = useGame()
  const total = ALL_LESSONS.length
  const done = ALL_LESSONS.filter((x) => p.completed[x.lesson.id]).length
  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">Learn</p>
        <h1>Pick a realm</h1>
        <p className="muted measure">
          {done} of {total} lessons cleared. Realms are listed in the suggested order, but all of them are open, so follow your curiosity.
        </p>
      </div>
      <div className="catalog">
        {REALMS.map((r) => {
          const n = realmDone(r, p)
          const complete = n === r.lessons.length
          return (
            <a key={r.id} className="course-card" href={`#/realm/${r.id}`}>
              <div className="course-top">
                <RealmTile realm={r} />
                <span className="when">{r.when}</span>
              </div>
              <h3>{r.name}</h3>
              <p className="course-topic">{r.topic}</p>
              <p className="course-blurb">{r.blurb}</p>
              <div className="course-foot">
                <span className="meter wide">
                  <span style={{ width: `${(n / r.lessons.length) * 100}%`, background: r.color }} />
                </span>
                <span className="small tnum">{complete ? 'Complete' : `${n}/${r.lessons.length} lessons`}</span>
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
  const n = realmDone(realm, p)
  const minutes = realm.lessons.reduce((s, l) => s + l.minutes, 0)
  return (
    <div className="page">
      <a href="#/map" className="back-link">
        <Icon name="arrowLeft" size={16} /> All realms
      </a>
      <div className="realm-head">
        <RealmTile realm={realm} size="lg" />
        <div>
          <p className="eyebrow">
            {realm.when} · {realm.topic}
          </p>
          <h1>{realm.name}</h1>
          <p className="muted measure">{realm.blurb}</p>
          <div className="row-meta">
            <span className="tnum">
              {n}/{realm.lessons.length} lessons done
            </span>
            <span className="tnum">~{minutes} min total</span>
            <span>{realm.comingSoon.length} more on the roadmap</span>
          </div>
        </div>
      </div>

      <ol className="syllabus">
        {realm.lessons.map((l, i) => {
          const done = !!p.completed[l.id]
          const started = p.stepProgress[l.id] != null
          return (
            <li key={l.id} className={`syl-row ${done ? 'is-done' : ''} ${l.boss ? 'is-boss' : ''}`}>
              <span className="syl-num tnum">{done ? <Icon name="check" size={16} /> : l.boss ? <Icon name="dragon" size={18} /> : i + 1}</span>
              <span className="syl-main">
                <strong>
                  {l.title.replace(/^BOSS: /, '')} {l.boss && <span className="boss-tag">Boss</span>}
                </strong>
                <span className="row-meta">
                  <span>~{l.minutes} min</span>
                  <StepMix lesson={l} />
                  {started && !done && <span className="pill">In progress</span>}
                </span>
              </span>
              <a className={`btn ${done ? '' : 'primary'} small`} href={`#/lesson/${l.id}`}>
                {done ? 'Replay' : started ? 'Resume' : 'Start'}
              </a>
            </li>
          )
        })}
        {realm.comingSoon.map((title) => (
          <li key={title} className="syl-row is-locked">
            <span className="syl-num">
              <Icon name="lock" size={14} />
            </span>
            <span className="syl-main">
              <strong>{title}</strong>
              <span className="muted small">Coming soon</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ---------------------------------------------------------------- Review (spaced repetition)

export function Review() {
  const { p, update, award, breakCombo } = useGame()
  const [queue] = useState(() =>
    dueReviews(p)
      .slice(0, 10)
      .map((c) => c.id)
      .filter((id) => findQuiz(id)),
  )
  const [i, setI] = useState(0)
  const [answered, setAnswered] = useState(false)
  const cardId = queue[i]
  const found = cardId ? findQuiz(cardId) : undefined

  if (!found) {
    return (
      <div className="page center-page">
        <Icon name="brain" size={56} className="hero-icon" />
        <h1>{queue.length ? 'Review complete' : 'Nothing to review yet'}</h1>
        <p className="muted measure">
          {queue.length
            ? 'Nice. The questions you missed will come back tomorrow.'
            : 'Quiz questions from finished lessons show up here on a 1, 3, 7, 17-day schedule.'}
        </p>
        <a className="btn primary" href="#/">
          Back home
        </a>
      </div>
    )
  }
  return (
    <div className="page reader">
      <div className="reader-top">
        <span className="eyebrow">
          Review {i + 1} of {queue.length}
        </span>
        <span className="muted small">
          From {found.realm.name}: {found.lesson.title}
        </span>
      </div>
      <div className="reader-card" key={cardId}>
        <Quiz
          step={found.quiz}
          onAnswer={(firstTry) => {
            setAnswered(true)
            update((prev) => scheduleReview(prev, cardId, firstTry))
            if (firstTry) award(10, 'Remembered', { combo: true })
            else breakCombo()
          }}
        />
      </div>
      <div className="reader-foot">
        <button
          className="btn primary big"
          disabled={!answered}
          onClick={() => {
            setAnswered(false)
            setI(i + 1)
          }}
        >
          Next <Icon name="arrowRight" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Profile

export function Profile() {
  const { p, update, toast } = useGame()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)
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
        toast({ icon: '⚠️', text: "That file isn't a CodeQuest save. Pick a .json file you exported here.", kind: 'info' })
      }
    })
  }

  const stats: [string, string | number][] = [
    ['Level', `${level} · ${titleFor(level)}`],
    ['Total XP', p.xp],
    ['Lessons', `${lessonsDone}/${ALL_LESSONS.length}`],
    ['Best streak', `${p.bestStreak} days`],
    ['Challenges passed', p.stats.codePasses],
    ['Passed with no hints', p.stats.noHintPasses],
    ['Bosses beaten', p.stats.bossesBeaten],
    ['Focus minutes', totalMinutes],
  ]

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">Profile</p>
        <h1>Your progress</h1>
      </div>
      <dl className="stat-grid">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className="tnum">{value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="section-title">Activity, last 20 weeks</h2>
      <Heatmap p={p} />

      <h2 className="section-title">Achievements</h2>
      <div className="badges">
        {ACHIEVEMENTS.map((a) => {
          const got = p.achievements.includes(a.id)
          return (
            <div key={a.id} className={`badge-card ${got ? 'got' : ''}`}>
              <span className="badge-icon">{got ? a.icon : <Icon name="lock" size={18} />}</span>
              <strong>{a.name}</strong>
              <span className="muted small">{a.desc}</span>
            </div>
          )
        })}
      </div>

      <h2 className="section-title">Journal ({journal.length})</h2>
      {journal.length === 0 && <p className="muted">Your "explain it back" answers collect here. Re-reading them is a good review.</p>}
      <div className="journal">
        {journal.map(([key, text]) => {
          const [lessonId] = key.split('#')
          const found = ALL_LESSONS.find((x) => x.lesson.id === lessonId)
          return (
            <article key={key} className="journal-entry">
              <span className="eyebrow">{found?.lesson.title}</span>
              <p>{text}</p>
            </article>
          )
        })}
      </div>

      <h2 className="section-title">Save data</h2>
      <p className="muted small measure">Progress is saved in this browser only. Export it to back it up or move it to another device.</p>
      <div className="toolbar">
        <button className="btn" onClick={exportProgress}>
          Export progress
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          Import progress
        </button>
        <input
          id="import-file"
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => e.target.files?.[0] && importProgress(e.target.files[0])}
        />
        <span className="spacer" />
        {confirmReset ? (
          <>
            <span className="small">Delete all progress? This can't be undone.</span>
            <button className="btn danger" onClick={() => (update(() => initialProgress()), setConfirmReset(false))}>
              Yes, reset
            </button>
            <button className="btn" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button className="btn danger" onClick={() => setConfirmReset(true)}>
            Reset progress
          </button>
        )}
      </div>
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
    <div className="heatmap-wrap">
      <div className="heatmap">
        {cells.map((d) => {
          const v = activity[d] ?? 0
          const lvl = v === 0 ? 0 : v < 10 ? 1 : v < 20 ? 2 : v < 30 ? 3 : 4
          return <span key={d} className={`hm l${lvl}`} title={`${d}: ${v ? 'active' : 'no activity'}`} />
        })}
      </div>
    </div>
  )
}
