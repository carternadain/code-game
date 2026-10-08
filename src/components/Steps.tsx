import { useState } from 'react'
import type { ConceptStep, ExplainStep, QuizStep } from '../types'
import { Markdown } from './Markdown'

export function Concept({ step }: { step: ConceptStep }) {
  return (
    <div className="concept">
      <h2>{step.title}</h2>
      {step.eli5 && (
        <div className="eli5">
          <span className="eli5-tag">🧸 Stupid simple</span>
          <Markdown text={step.eli5} />
        </div>
      )}
      <Markdown text={step.body} />
    </div>
  )
}

/** Answer → instant feedback → explanation. `onAnswer(firstTry)` fires once, when you get it right. */
export function Quiz({ step, onAnswer }: { step: QuizStep; onAnswer: (firstTry: boolean, wrongOnce: boolean) => void }) {
  const [picked, setPicked] = useState<number[]>([])
  const solved = picked.includes(step.answer)

  function pick(i: number) {
    if (solved || picked.includes(i)) return
    const next = [...picked, i]
    setPicked(next)
    if (i === step.answer) onAnswer(next.length === 1, next.length > 1)
  }

  return (
    <div className="quiz">
      <Markdown text={step.prompt} />
      {step.code && (
        <pre className="md-pre">
          <code>{step.code}</code>
        </pre>
      )}
      <div className="options">
        {step.options.map((o, i) => {
          const state = picked.includes(i) ? (i === step.answer ? 'right' : 'wrong') : solved ? 'dim' : ''
          return (
            <button key={i} className={`option ${state}`} onClick={() => pick(i)}>
              <span className="option-key">{String.fromCharCode(65 + i)}</span>
              <span>{o}</span>
            </button>
          )
        })}
      </div>
      {picked.length > 0 && !solved && <div className="callout warn">Not quite — try again. Wrong answers come back in your daily review.</div>}
      {solved && (
        <div className="callout ok">
          <strong>{picked.length === 1 ? 'Correct!' : 'Got it.'}</strong> <Markdown text={step.explain} />
        </div>
      )}
    </div>
  )
}

/** Feynman technique: if you can't explain it simply, you don't understand it yet. */
export function Explain({ step, saved, onSubmit }: { step: ExplainStep; saved?: string; onSubmit: (text: string) => void }) {
  const [text, setText] = useState(saved ?? '')
  const [submitted, setSubmitted] = useState(false)
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return (
    <div className="explain">
      <div className="explain-badge">🧠 Explain it back — no AI, no copy-paste</div>
      <Markdown text={step.prompt} />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Explain it like you're teaching a friend who's never coded…"
        rows={6}
        disabled={submitted}
      />
      <div className="toolbar">
        <span className="muted">
          {words} words {words < 25 && '(aim for 25+)'}
        </span>
        <div className="spacer" />
        {!submitted && (
          <button
            className="btn primary"
            disabled={words < 10}
            onClick={() => {
              setSubmitted(true)
              onSubmit(text)
            }}
          >
            Submit to journal
          </button>
        )}
      </div>
      {submitted && (
        <div className="callout ok">
          <strong>Check yourself.</strong> A strong answer mentions:
          <ul>
            {step.keyPoints.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
          Missed one? Re-read the lesson tomorrow — your answer is saved in your journal.
        </div>
      )}
    </div>
  )
}
