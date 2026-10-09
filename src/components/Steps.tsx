import { useState } from 'react'
import type { ConceptStep, ExplainStep, QuizStep } from '../types'
import { getPasscode, requestFeedback, setPasscode, type Feedback, type FeedbackResult } from '../game/feedback'
import { speechSupported, useSpeech } from '../game/speech'
import { Icon } from './Icon'
import { Markdown } from './Markdown'

export function Concept({ step }: { step: ConceptStep }) {
  return (
    <div className="concept">
      <h2>{step.title}</h2>
      {step.eli5 && (
        <div className="eli5">
          <span className="eli5-tag">Stupid simple version</span>
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
  return (
    <div className="explain">
      <span className="step-kicker">Explain it back · no AI, no copy-paste</span>
      <Markdown text={step.prompt} />
      <ExplainBox prompt={step.prompt} keyPoints={step.keyPoints} saved={saved} onFirstSubmit={onSubmit} />
    </div>
  )
}

/**
 * Type or talk an explanation, then get Claude's feedback (or the key-point checklist if
 * AI feedback isn't set up). You can revise and resubmit as many times as you like.
 */
export function ExplainBox({
  prompt,
  keyPoints,
  saved,
  onFirstSubmit,
}: {
  prompt: string
  keyPoints: string[]
  saved?: string
  onFirstSubmit?: (text: string) => void
}) {
  const [text, setText] = useState(saved ?? '')
  const [phase, setPhase] = useState<'writing' | 'loading' | 'done'>('writing')
  const [result, setResult] = useState<FeedbackResult | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [pass, setPass] = useState(getPasscode)
  const speech = useSpeech((phrase) => setText((t) => (t.trim() ? `${t.trim()} ${phrase}` : phrase)))
  const words = text.trim() ? text.trim().split(/\s+/).length : 0

  async function submit() {
    speech.stop()
    if (attempts === 0) onFirstSubmit?.(text)
    setAttempts((n) => n + 1)
    setPhase('loading')
    setResult(await requestFeedback(prompt, keyPoints, text))
    setPhase('done')
  }

  return (
    <div className="explain-box">
      <div className={`answer-wrap ${speech.listening ? 'is-listening' : ''}`}>
        <textarea
          id="explain-answer"
          value={speech.interim ? `${text} ${speech.interim}` : text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            speechSupported
              ? "Tap the mic and talk it through, or type. Explain it like you're teaching a friend who has never coded…"
              : "Explain it like you're teaching a friend who has never coded…"
          }
          rows={6}
          readOnly={phase === 'loading' || speech.listening}
        />
        {speech.listening && (
          <span className="listening-tag">
            <span className="rec-dot" /> Listening… speak naturally, filler words are fine
          </span>
        )}
      </div>
      {speech.error && <div className="callout warn small">{speech.error}</div>}
      <div className="toolbar">
        {speechSupported && (
          <button className={`btn ${speech.listening ? 'danger' : ''}`} onClick={speech.listening ? speech.stop : speech.start} disabled={phase === 'loading'}>
            <Icon name="mic" size={16} /> {speech.listening ? 'Stop recording' : text ? 'Keep talking' : 'Talk it through'}
          </button>
        )}
        <span className="muted small">
          {words} words {words < 25 && '· aim for 25+'}
        </span>
        <div className="spacer" />
        <button className="btn primary" disabled={words < 10 || phase === 'loading'} onClick={submit}>
          {phase === 'loading' ? 'Reading your explanation…' : attempts ? 'Get feedback again' : 'Get feedback'}
        </button>
      </div>

      {phase === 'done' && result?.ok && <FeedbackCard fb={result.feedback} />}

      {phase === 'done' && result && !result.ok && result.reason === 'passcode' && (
        <div className="callout warn">
          <strong>Enter your feedback passcode.</strong> It's the FEEDBACK_PASSCODE you set in Vercel. It's saved in this browser.
          <div className="toolbar">
            <input
              id="feedback-passcode"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Passcode"
              className="text-input"
            />
            <button
              className="btn small primary"
              onClick={() => {
                setPasscode(pass)
                submit()
              }}
            >
              Save & retry
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && result && !result.ok && result.reason !== 'passcode' && (
        <div className="callout ok">
          {result.reason === 'not-set-up' ? (
            <p className="small muted">AI feedback isn't switched on yet (see the README to turn it on). For now, check yourself.</p>
          ) : (
            <p className="small muted">{result.message} For now, check yourself.</p>
          )}
          {keyPoints.length > 0 ? (
            <>
              <strong>A strong answer mentions:</strong>
              <ul>
                {keyPoints.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>Read it back out loud. Would a friend who has never coded understand every word?</p>
          )}
        </div>
      )}
    </div>
  )
}

function FeedbackCard({ fb }: { fb: Feedback }) {
  const score = Math.max(1, Math.min(5, Math.round(fb.score)))
  const label = ['', 'Not there yet', 'Getting there', 'Halfway', 'Solid', 'You could teach this'][score]
  return (
    <section className={`feedback score-${score}`} aria-live="polite">
      <div className="fb-head">
        <span className="fb-meter" aria-label={`Score ${score} out of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={n <= score ? 'on' : ''} />
          ))}
        </span>
        <strong>{label}</strong>
      </div>
      <p>{fb.verdict}</p>
      {fb.gotRight.length > 0 && (
        <div>
          <h4>What you nailed</h4>
          <ul className="fb-list ok">
            {fb.gotRight.map((t) => (
              <li key={t}>
                <Icon name="check" size={14} /> {t}
              </li>
            ))}
          </ul>
        </div>
      )}
      {fb.missing.length > 0 && (
        <div>
          <h4>Fill these gaps</h4>
          <ul className="fb-list gap">
            {fb.missing.map((t) => (
              <li key={t}>
                <Icon name="arrowRight" size={14} /> {t}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="fb-try">
        <span className="eyebrow">Try saying it like this</span>
        <p>{fb.tryThis}</p>
      </div>
      {score < 5 && <p className="muted small">Edit your answer or record again, then press Get feedback again.</p>}
    </section>
  )
}
