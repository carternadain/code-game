import { useEffect, useState } from 'react'
import type { VisualStep } from '../types'
import { Markdown } from './Markdown'

/**
 * Step-through animation: code on the left with the "current line" lit up,
 * memory / queues / data on the right. Press Next (or Play) and watch it change.
 */
export function Visualizer({ step, onFinished }: { step: VisualStep; onFinished: () => void }) {
  const [i, setI] = useState(0)
  const [playRequested, setPlaying] = useState(false)
  const frame = step.frames[i]
  const last = step.frames.length - 1
  const playing = playRequested && i < last

  useEffect(() => {
    if (i === last) onFinished()
  }, [i, last, onFinished])

  useEffect(() => {
    if (!playing) return
    const id = setTimeout(() => setI((n) => n + 1), 1800)
    return () => clearTimeout(id)
  }, [playing, i, last])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, .monaco-editor')) return
      if (e.key === 'ArrowRight') setI((n) => Math.min(last, n + 1))
      if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [last])

  const lines = step.code?.split('\n') ?? []

  return (
    <div className="visual">
      <div className="visual-badge">👀 Watch it happen</div>
      <h2>{step.title}</h2>

      <div className={`visual-stage ${step.code ? '' : 'no-code'}`}>
        {step.code && (
          <pre className="visual-code">
            {lines.map((l, n) => (
              <div key={n} className={`vline ${frame.line === n + 1 ? 'now' : ''}`}>
                <span className="vnum">{n + 1}</span>
                <span>{l || ' '}</span>
              </div>
            ))}
          </pre>
        )}
        <div className="lanes">
          {frame.lanes.map((lane) => (
            <div key={lane.title} className={`lane lane-${lane.layout ?? 'list'}`}>
              <div className="lane-title">{lane.title}</div>
              <div className="lane-items">
                {lane.items.length === 0 && <span className="lane-empty">empty</span>}
                {lane.items.map((item, n) => (
                  <div key={`${n}:${item}`} className={`vitem ${lane.highlight?.includes(n) ? 'hl' : ''}`}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="visual-caption" key={i}>
        <span className="frame-num">
          {i + 1}/{step.frames.length}
        </span>
        <Markdown text={frame.caption} />
      </div>

      <div className="toolbar">
        <button className="btn ghost" onClick={() => setI(0)} disabled={i === 0}>
          ⏮
        </button>
        <button className="btn ghost" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
          ← Back
        </button>
        <button className="btn primary" onClick={() => setI(Math.min(last, i + 1))} disabled={i === last}>
          Next →
        </button>
        <button className="btn ghost" onClick={() => (i === last ? (setI(0), setPlaying(true)) : setPlaying(!playing))}>
          {playing ? '⏸ Pause' : i === last ? '↻ Replay' : '▶ Play'}
        </button>
        <span className="kbd-hint">← → arrow keys work too</span>
      </div>
      <div className="frame-dots">
        {step.frames.map((_, n) => (
          <button key={n} className={`fdot ${n === i ? 'on' : n < i ? 'seen' : ''}`} onClick={() => setI(n)} aria-label={`frame ${n + 1}`} />
        ))}
      </div>
    </div>
  )
}
