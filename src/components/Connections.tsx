import { useState } from 'react'
import { findLesson } from '../content'
import { useGame } from '../game/GameContext'
import { scheduleReview, today } from '../game/progress'
import type { Lesson, QuizStep } from '../types'
import { Icon } from './Icon'
import { Quiz } from './Steps'

/** Chips linking to the lessons this one builds on. */
export function BuildsOn({ lesson, label = 'Builds on' }: { lesson: Lesson; label?: string }) {
  const { p } = useGame()
  const prereqs = (lesson.uses ?? []).map((id) => findLesson(id)).filter((x) => !!x)
  if (!prereqs.length) return null
  return (
    <span className="builds-on">
      <span className="builds-label">
        <Icon name="link" size={13} /> {label}
      </span>
      {prereqs.map(({ lesson: l, realm }) => (
        <a key={l.id} href={`#/lesson/${l.id}`} className={`chip ${p.completed[l.id] ? 'is-done' : ''}`} style={{ ['--chip' as string]: realm.color }}>
          {p.completed[l.id] && <Icon name="check" size={12} />}
          {l.title.replace(/^(BOSS|Remix): /, '')}
        </a>
      ))}
    </span>
  )
}

/** Same lesson + same day → same questions, so leaving and coming back doesn't reroll them. */
function seeded(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

/** Up to `n` quiz questions from finished lessons that `lesson` builds on. */
function warmUpQuestions(lesson: Lesson, completed: Record<string, unknown>, n = 2) {
  const pool: { id: string; quiz: QuizStep; from: string }[] = []
  for (const id of lesson.uses ?? []) {
    const found = findLesson(id)
    if (!found || !completed[id]) continue
    found.lesson.steps.forEach((s, i) => {
      if (s.kind === 'quiz') pool.push({ id: `${id}#${i}`, quiz: s, from: found.lesson.title.replace(/^(BOSS|Remix): /, '') })
    })
  }
  const rand = seeded(lesson.id + today())
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, n)
}

/**
 * Shown before a lesson starts: what it builds on, plus two quick questions from those lessons.
 * Pulling old ideas back out of your head right before using them is what makes them stick.
 */
export function WarmUp({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const { p, update, award } = useGame()
  const [questions] = useState(() => warmUpQuestions(lesson, p.completed))
  const [i, setI] = useState(0)
  const [answered, setAnswered] = useState(false)
  const missing = (lesson.uses ?? []).filter((id) => !p.completed[id])
  const q = questions[i]

  return (
    <div className="reader-card warmup">
      <span className="step-kicker">
        <Icon name="flame" size={14} /> Warm-up
      </span>
      <h2>Before we start: what this lesson builds on</h2>
      <BuildsOn lesson={lesson} label="Uses" />
      {missing.length > 0 && (
        <p className="callout warn small">
          You haven't done {missing.length === 1 ? 'one of these' : `${missing.length} of these`} yet. You can still jump in, but if you get stuck, open the
          ones without a check mark first.
        </p>
      )}
      {q ? (
        <>
          <p className="muted small warmup-from">
            Quick recall {i + 1}/{questions.length} · from <strong>{q.from}</strong>
          </p>
          <Quiz
            key={q.id}
            step={q.quiz}
            onAnswer={(firstTry, wrongOnce) => {
              setAnswered(true)
              if (firstTry) award(5, 'Warm-up recall')
              if (wrongOnce) update((prev) => scheduleReview(prev, q.id, false))
            }}
          />
          <div className="toolbar">
            <button className="btn ghost" onClick={onDone}>
              Skip warm-up
            </button>
            <button
              className="btn primary"
              disabled={!answered}
              onClick={() => {
                if (i + 1 < questions.length) {
                  setI(i + 1)
                  setAnswered(false)
                } else onDone()
              }}
            >
              {i + 1 < questions.length ? 'Next question' : 'Start the lesson'} <Icon name="arrowRight" />
            </button>
          </div>
        </>
      ) : (
        <div className="toolbar">
          <button className="btn primary big" onClick={onDone}>
            Start the lesson <Icon name="arrowRight" />
          </button>
        </div>
      )}
    </div>
  )
}
