import { lazy, Suspense, useCallback, useState } from 'react'
import { useGame } from '../game/GameContext'
import { scheduleReview, today } from '../game/progress'
import type { Lesson, Realm } from '../types'
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
    if (first) award(lesson.boss ? 60 : 20, lesson.boss ? 'BOSS DEFEATED 🐉' : 'Lesson complete', { gems: lesson.boss ? 25 : 5 })
  }

  if (finished) {
    return (
      <div className="lesson-done">
        <div className="big-emoji">{lesson.boss ? '🐉' : '🏆'}</div>
        <h1>{lesson.boss ? 'Boss defeated!' : 'Lesson complete!'}</h1>
        <p className="muted">{lesson.title}</p>
        <p>
          Combo: <strong>{p.combo}</strong> · Total XP: <strong>{p.xp}</strong> · Gems: <strong>{p.gems} 💎</strong>
        </p>
        <div className="toolbar center">
          <button className="btn ghost" onClick={() => onExit(false)}>
            Back to {realm.name}
          </button>
          <button className="btn primary" onClick={() => onExit(true)}>
            Next lesson →
          </button>
        </div>
      </div>
    )
  }

  const canContinue = step.kind === 'concept' || stepDone

  return (
    <div className="lesson">
      <div className="lesson-top">
        <button className="btn ghost small" onClick={() => onExit(false)}>
          ✕
        </button>
        <div className="steps-bar">
          {lesson.steps.map((s, i) => (
            <div key={i} className={`seg ${i < index ? 'done' : i === index ? 'now' : ''} seg-${s.kind}`} />
          ))}
        </div>
        <span className="muted small">
          {index + 1}/{lesson.steps.length}
        </span>
      </div>
      <div className="lesson-title">
        <span style={{ color: realm.color }}>
          {realm.icon} {realm.name}
        </span>{' '}
        · {lesson.title} {lesson.boss && <span className="boss-tag">BOSS</span>}
      </div>

      <div className="card step-card" key={key}>
        {step.kind === 'concept' && <Concept step={step} />}
        {step.kind === 'visual' && <Visualizer step={step} onFinished={markDone} />}
        {step.kind === 'quiz' && (
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
        )}
        {step.kind === 'code' && (
          <Suspense fallback={<p className="muted">Loading the code editor…</p>}>
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
                award(XP.code + (usedHint ? 0 : XP.codeNoHint), usedHint ? 'Challenge passed' : 'Passed with no hints 🧠', { combo: !usedHint })
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
          <Explain
            step={step}
            saved={p.journal[key]}
            onSubmit={(text) => {
              setStepDone(true)
              update((prev) => ({ ...prev, journal: { ...prev.journal, [key]: text } }))
              award(XP.explain, 'Explained in your own words')
            }}
          />
        )}
      </div>

      <div className="lesson-bottom">
        <button className="btn primary big" disabled={!canContinue} onClick={next}>
          {index + 1 === lesson.steps.length ? 'Finish lesson' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
