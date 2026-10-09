import { lazy, Suspense, useCallback, useState } from 'react'
import { useGame } from '../game/GameContext'
import { scheduleReview, today } from '../game/progress'
import type { Lesson, Realm } from '../types'
import { RealmTile } from './RealmTile'
import { Icon } from './Icon'
import { BuildsOn, WarmUp } from './Connections'
import { Concept, Explain, Quiz } from './Steps'
import { Visualizer } from './Visualizer'

// The code editor is big (it includes the TypeScript compiler), so load it only when a challenge appears.
const CodeChallenge = lazy(() => import('./CodeChallenge').then((m) => ({ default: m.CodeChallenge })))

const XP = { concept: 5, visual: 5, quizFirstTry: 15, quizLate: 5, code: 30, codeNoHint: 10, codeSolution: 5, explain: 15 }

export function LessonPlayer({ realm, lesson, onExit }: { realm: Realm; lesson: Lesson; onExit: (next: boolean) => void }) {
  const { p, update, award, breakCombo } = useGame()
  const [index, setIndex] = useState(() => Math.min(p.stepProgress[lesson.id] ?? 0, lesson.steps.length - 1))
  const [stepDone, setStepDone] = useState(false)
  const [finished, setFinished] = useState(false)
  // Fresh starts open with a warm-up (resuming mid-lesson skips it).
  const [warm, setWarm] = useState(() => p.stepProgress[lesson.id] == null && !!lesson.uses?.length)
  const step = lesson.steps[index]
  const key = `${lesson.id}#${index}`
  const markDone = useCallback(() => setStepDone(true), [])

  function next() {
    if (step.kind === 'concept') award(XP.concept, 'Read & understood')
    if (step.kind === 'visual') award(XP.visual, 'Watched it run')
    if (index + 1 < lesson.steps.length) {
      setIndex(index + 1)
      setStepDone(false)
      update((prev) => ({ ...prev, stepProgress: { ...prev.stepProgress, [lesson.id]: index + 1 } }))
      window.scrollTo({ top: 0 })
    } else finish()
  }

  function finish() {
    const first = !p.completed[lesson.id]
    setFinished(true)
    update((prev) => {
      const { [lesson.id]: _done, ...stepProgress } = prev.stepProgress
      void _done
      let nextP = {
        ...prev,
        stepProgress,
        completed: { ...prev.completed, [lesson.id]: { day: today(), perfect: true } },
        stats: { ...prev.stats, bossesBeaten: prev.stats.bossesBeaten + (lesson.boss && first ? 1 : 0) },
      }
      // Every quiz from this lesson enters spaced repetition so it sticks long-term.
      lesson.steps.forEach((s, i) => {
        const id = `${lesson.id}#${i}`
        if (s.kind === 'quiz' && !nextP.review.some((c) => c.id === id)) nextP = scheduleReview(nextP, id, true)
      })
      return nextP
    })
    if (first) award(lesson.boss ? 60 : 20, lesson.boss ? 'Boss defeated' : 'Lesson complete', { gems: lesson.boss ? 25 : 5 })
  }

  if (finished) {
    return (
      <div className="lesson-done">
        <Icon name={lesson.boss ? 'dragon' : 'trophy'} size={64} className="hero-icon" />
        <p className="eyebrow">{realm.name}</p>
        <h1>{lesson.boss ? 'Boss defeated' : 'Lesson complete'}</h1>
        <p className="muted">{lesson.title}</p>
        <dl className="done-stats">
          <div>
            <dt>Total XP</dt>
            <dd className="tnum">{p.xp}</dd>
          </div>
          <div>
            <dt>Combo</dt>
            <dd className="tnum">×{p.combo}</dd>
          </div>
          <div>
            <dt>Gems</dt>
            <dd className="tnum">{p.gems}</dd>
          </div>
        </dl>
        <div className="toolbar center">
          <button className="btn" onClick={() => onExit(false)}>
            Back to {realm.name}
          </button>
          <button className="btn primary big" onClick={() => onExit(true)}>
            Next lesson <Icon name="arrowRight" />
          </button>
        </div>
      </div>
    )
  }

  if (warm) {
    return (
      <div className="lesson">
        <LessonBar realm={realm} lesson={lesson} index={-1} onExit={onExit} />
        <div className="lesson-stage">
          <WarmUp lesson={lesson} onDone={() => setWarm(false)} />
        </div>
      </div>
    )
  }

  const canContinue = step.kind === 'concept' || stepDone
  const workspace = step.kind === 'code'
  const label = { concept: 'Read', visual: 'Watch', quiz: 'Quiz', code: 'Code challenge', explain: 'Explain it back' }[step.kind]
  const waiting = {
    concept: '',
    visual: 'Step through to the last frame to continue',
    quiz: 'Pick the right answer to continue',
    code: 'Pass all checkpoints to continue',
    explain: 'Submit your explanation to continue',
  }[step.kind]

  return (
    <div className={`lesson ${workspace ? 'is-workspace' : ''}`}>
      <LessonBar realm={realm} lesson={lesson} index={index} onExit={onExit} />

      <div className="lesson-stage" key={key}>
        {step.kind === 'concept' && (
          <div className="reader-card">
            {index === 0 && <BuildsOn lesson={lesson} />}
            <Concept step={step} />
          </div>
        )}
        {step.kind === 'visual' && (
          <div className="reader-card wide">
            <Visualizer step={step} onFinished={markDone} />
          </div>
        )}
        {step.kind === 'quiz' && (
          <div className="reader-card">
            <Quiz
              step={step}
              onAnswer={(firstTry, wrongOnce) => {
                setStepDone(true)
                if (firstTry) {
                  award(XP.quizFirstTry, 'Correct first try', { combo: true })
                  update((prev) => ({ ...prev, stats: { ...prev.stats, quizRight: prev.stats.quizRight + 1 } }))
                } else {
                  breakCombo()
                  award(XP.quizLate, 'Figured it out')
                }
                if (wrongOnce) update((prev) => scheduleReview(prev, key, false))
              }}
            />
          </div>
        )}
        {step.kind === 'code' && (
          <Suspense fallback={<p className="muted loading">Loading the code editor…</p>}>
            <CodeChallenge
              step={step}
              stepKey={key}
              onPass={({ usedHint, usedSolution }) => {
                setStepDone(true)
                if (usedSolution) {
                  breakCombo()
                  award(XP.codeSolution, 'Studied the solution')
                  return
                }
                award(XP.code + (usedHint ? 0 : XP.codeNoHint), usedHint ? 'Challenge passed' : 'Passed with no hints', { combo: !usedHint })
                update((prev) => ({
                  ...prev,
                  stats: {
                    ...prev.stats,
                    codePasses: prev.stats.codePasses + 1,
                    noHintPasses: prev.stats.noHintPasses + (usedHint ? 0 : 1),
                    langsPassed: prev.stats.langsPassed.includes(step.lang) ? prev.stats.langsPassed : [...prev.stats.langsPassed, step.lang],
                  },
                }))
              }}
            />
          </Suspense>
        )}
        {step.kind === 'explain' && (
          <div className="reader-card">
            <Explain
              step={step}
              saved={p.journal[key]}
              onSubmit={(text) => {
                setStepDone(true)
                update((prev) => ({ ...prev, journal: { ...prev.journal, [key]: text } }))
                award(XP.explain, 'Explained in your own words')
              }}
            />
          </div>
        )}
      </div>

      <div className="lesson-foot">
        <span className="foot-label">
          <span className="eyebrow">{label}</span>
          {!canContinue && <span className="muted small hide-sm">{waiting}</span>}
        </span>
        <button className="btn primary big" disabled={!canContinue} onClick={next}>
          {index + 1 === lesson.steps.length ? 'Finish lesson' : 'Continue'} <Icon name="arrowRight" />
        </button>
      </div>
    </div>
  )
}

function LessonBar({ realm, lesson, index, onExit }: { realm: Realm; lesson: Lesson; index: number; onExit: (next: boolean) => void }) {
  return (
    <div className="lesson-bar">
      <button className="icon-btn" onClick={() => onExit(false)} aria-label="Leave lesson">
        <Icon name="x" />
      </button>
      <RealmTile realm={realm} size="sm" />
      <span className="lesson-name">
        <span className="muted small">{realm.name}</span>
        <strong>
          {lesson.title.replace(/^(BOSS|Remix): /, '')} {lesson.boss && <span className="boss-tag">Boss</span>}
          {lesson.remix && <span className="boss-tag remix-tag">Remix</span>}
          {lesson.project && <span className="boss-tag project-tag">Project · part {lesson.project.part}</span>}
        </strong>
      </span>
      <span className="steps-bar" aria-label={`Step ${index + 1} of ${lesson.steps.length}`}>
        {lesson.steps.map((s, i) => (
          <span key={i} className={`seg ${i < index ? 'done' : i === index ? 'now' : ''}`} title={s.kind} />
        ))}
      </span>
      <span className="muted small tnum">{index < 0 ? 'Warm-up' : `${index + 1}/${lesson.steps.length}`}</span>
    </div>
  )
}
