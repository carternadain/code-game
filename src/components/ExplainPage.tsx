import { useState } from 'react'
import { ExplainBox } from './Steps'

const IDEAS = [
  'What a function is',
  'Why we use return',
  'How the event loop works',
  'What a database index does',
  'Why Alembic migrations exist',
  'What RAG is',
  'A bug I am stuck on',
]

/** Rubber-duck mode: explain any concept (or a problem you're stuck on) out loud and get feedback. */
export function ExplainPage() {
  const [topic, setTopic] = useState('')
  const [started, setStarted] = useState('')

  return (
    <div className="page reader">
      <div className="page-head">
        <p className="eyebrow">Explain</p>
        <h1>Say it out loud</h1>
        <p className="muted measure">
          Pick anything: a concept from a lesson, something from work, or a bug you're stuck on. Explaining it in your own words is the fastest way to find out
          what you really understand. Claude tells you what you nailed and what's missing.
        </p>
      </div>

      {!started ? (
        <div className="panel">
          <label htmlFor="explain-topic" className="eyebrow">
            What do you want to explain?
          </label>
          <input
            id="explain-topic"
            className="text-input big"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && topic.trim() && setStarted(topic.trim())}
            placeholder="e.g. what a closure is"
          />
          <div className="chips">
            {IDEAS.map((idea) => (
              <button key={idea} className="chip-btn" onClick={() => setTopic(idea)}>
                {idea}
              </button>
            ))}
          </div>
          <div className="toolbar">
            <button className="btn primary" disabled={!topic.trim()} onClick={() => setStarted(topic.trim())}>
              Start explaining
            </button>
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="toolbar">
            <span className="eyebrow">Explaining</span>
            <strong>{started}</strong>
            <span className="spacer" />
            <button className="btn small" onClick={() => setStarted('')}>
              Change topic
            </button>
          </div>
          <ExplainBox
            key={started}
            prompt={`Explain this in your own words, as if teaching a friend who has never coded: ${started}. (If it's a bug or problem, describe what you expected, what actually happens, and what you think the cause is.)`}
            keyPoints={[]}
          />
        </div>
      )}
    </div>
  )
}
