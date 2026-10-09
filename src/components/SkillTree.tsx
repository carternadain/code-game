import { useMemo, useState } from 'react'
import { ALL_LESSONS, REALMS, dependentsOf, findLesson } from '../content'
import { useGame } from '../game/GameContext'
import type { Lesson } from '../types'
import { BuildsOn } from './Connections'
import { Icon } from './Icon'
import { onColor } from './onColor'
import { RealmTile } from './RealmTile'

/** Tabs at the top of the Learn section: the realm catalog, the skill tree and the project. */
export function LearnNav({ active }: { active: 'map' | 'tree' | 'project' }) {
  const items: [typeof active, string, string][] = [
    ['map', '#/map', 'Realms'],
    ['tree', '#/tree', 'Skill tree'],
    ['project', '#/project', 'Guild Tracker project'],
  ]
  return (
    <nav className="seg-nav" aria-label="Learn views">
      {items.map(([key, href, label]) => (
        <a key={key} href={href} className={key === active ? 'active' : undefined} aria-current={key === active ? 'page' : undefined}>
          {label}
        </a>
      ))}
    </nav>
  )
}

const COL = 156
const ROW = 58
const NODE_W = 138
const NODE_H = 38
const LEFT = 176
const TOP = 16

const short = (title: string, n = 19) => {
  const t = title.replace(/^(BOSS|Remix): /, '').replace(/^Guild Tracker (\d+): /, 'GT$1: ')
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t
}

/**
 * Every lesson as a node, one row per realm, with a line from each lesson to the ones that build on it.
 * Columns are assigned so a line always points right: a lesson sits after everything it uses
 * and after the lesson before it in the same realm.
 */
function useLayout() {
  return useMemo(() => {
    const col: Record<string, number> = {}
    const row: Record<string, number> = {}
    const lastInRealm: Record<string, number> = {}
    for (const { realm, lesson } of ALL_LESSONS) {
      const after = Math.max(lastInRealm[realm.id] ?? -1, ...(lesson.uses ?? []).map((u) => col[u] ?? -1))
      col[lesson.id] = after + 1
      lastInRealm[realm.id] = after + 1
      row[lesson.id] = REALMS.indexOf(realm)
    }
    const cols = Math.max(...Object.values(col)) + 1
    const edges = ALL_LESSONS.flatMap(({ lesson }) => (lesson.uses ?? []).filter((u) => u in col).map((u) => [u, lesson.id] as const))
    return { col, row, edges, width: LEFT + cols * COL + 16, height: TOP * 2 + REALMS.length * ROW }
  }, [])
}

/** Everything `id` depends on (all the way back) and everything that depends on it. */
function lineage(id: string) {
  const up = new Set<string>()
  const down = new Set<string>()
  const walkUp = (x: string) => {
    for (const u of findLesson(x)?.lesson.uses ?? []) {
      if (up.has(u)) continue
      up.add(u)
      walkUp(u)
    }
  }
  const walkDown = (x: string) => {
    for (const { lesson } of dependentsOf(x)) {
      if (down.has(lesson.id)) continue
      down.add(lesson.id)
      walkDown(lesson.id)
    }
  }
  walkUp(id)
  walkDown(id)
  return { up, down }
}

export function SkillTree() {
  const { p } = useGame()
  const { col, row, edges, width, height } = useLayout()
  const [selected, setSelected] = useState<string | null>(null)
  // Realm names stay pinned to the left edge while the tree scrolls sideways.
  const [scrollX, setScrollX] = useState(0)
  const line = useMemo(() => (selected ? lineage(selected) : null), [selected])
  const sel = selected ? findLesson(selected) : undefined
  const unlocks = selected ? dependentsOf(selected) : []

  const ready = (l: Lesson) => !p.completed[l.id] && (l.uses ?? []).every((u) => p.completed[u])
  const x = (id: string) => LEFT + col[id] * COL
  const y = (id: string) => TOP + row[id] * ROW + (ROW - NODE_H) / 2
  const lit = (id: string) => !line || id === selected || line.up.has(id) || line.down.has(id)
  const doneCount = ALL_LESSONS.filter((l) => p.completed[l.lesson.id]).length

  return (
    <div className="page wide-page">
      <div className="page-head">
        <LearnNav active="tree" />
        <h1>Skill tree</h1>
        <p className="muted measure">
          Every lesson, and how they connect. A line means "this lesson uses that one". Tap any lesson to light up everything it needs (to the left) and
          everything it unlocks (to the right).
        </p>
        <div className="tree-legend">
          <span>
            <i className="dot is-done" /> Done ({doneCount})
          </span>
          <span>
            <i className="dot is-ready" /> Ready: everything it needs is done
          </span>
          <span>
            <i className="dot" /> Not yet
          </span>
        </div>
      </div>

      {sel && (
        <aside className="tree-panel" aria-live="polite">
          <RealmTile realm={sel.realm} size="sm" />
          <div className="tree-panel-main">
            <span className="muted small">{sel.realm.name}</span>
            <strong>{sel.lesson.title.replace(/^BOSS: /, '')}</strong>
            <BuildsOn lesson={sel.lesson} label="Needs" />
            {unlocks.length > 0 && (
              <span className="builds-on">
                <span className="builds-label">
                  <Icon name="arrowRight" size={13} /> Unlocks
                </span>
                {unlocks.map(({ lesson: l, realm }) => (
                  <button
                    key={l.id}
                    className={`chip ${p.completed[l.id] ? 'is-done' : ''}`}
                    style={{ ['--chip' as string]: realm.color }}
                    onClick={() => setSelected(l.id)}
                  >
                    {short(l.title, 30)}
                  </button>
                ))}
              </span>
            )}
          </div>
          <div className="toolbar">
            <button className="btn small ghost" onClick={() => setSelected(null)}>
              Clear
            </button>
            <a className="btn small primary" href={`#/lesson/${sel.lesson.id}`}>
              {p.completed[sel.lesson.id] ? 'Replay' : 'Start'} <Icon name="arrowRight" size={14} />
            </a>
          </div>
        </aside>
      )}

      <div className="tree-scroll" onScroll={(e) => setScrollX(e.currentTarget.scrollLeft)}>
        <svg className="tree" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Skill tree of all lessons">
          {REALMS.map((r, i) => (
            <rect key={r.id} x={0} y={TOP + i * ROW} width={width} height={ROW} className={i % 2 ? 'row-b' : 'row-a'} />
          ))}
          {edges.map(([from, to]) => {
            const x1 = x(from) + NODE_W
            const y1 = y(from) + NODE_H / 2
            const x2 = x(to)
            const y2 = y(to) + NODE_H / 2
            const mid = Math.max(24, (x2 - x1) / 2)
            const on = !!line && lit(from) && lit(to) && (from === selected || to === selected || line.up.has(to) || line.down.has(from))
            return (
              <path
                key={from + '>' + to}
                d={`M${x1},${y1} C${x1 + mid},${y1} ${x2 - mid},${y2} ${x2},${y2}`}
                className={`edge ${on ? 'is-on' : ''} ${line && !on ? 'is-off' : ''} ${p.completed[from] ? 'is-done' : ''}`}
              />
            )
          })}
          {ALL_LESSONS.map(({ realm, lesson }) => {
            const state = p.completed[lesson.id] ? 'is-done' : ready(lesson) ? 'is-ready' : ''
            return (
              <g
                key={lesson.id}
                className={`node ${state} ${lit(lesson.id) ? '' : 'is-off'} ${selected === lesson.id ? 'is-selected' : ''} ${lesson.boss ? 'is-boss' : ''}`}
                transform={`translate(${x(lesson.id)},${y(lesson.id)})`}
                onClick={() => setSelected(selected === lesson.id ? null : lesson.id)}
                tabIndex={0}
                role="button"
                aria-label={lesson.title}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelected(lesson.id)
                  }
                }}
              >
                <title>{lesson.title}</title>
                <rect width={NODE_W} height={NODE_H} rx={8} style={{ ['--node' as string]: realm.color }} />
                <rect width={5} height={NODE_H} rx={2} fill={realm.color} />
                <text x={13} y={NODE_H / 2 + 4}>
                  {lesson.boss ? '★ ' : lesson.project ? '⚒ ' : lesson.remix ? '⟲ ' : ''}
                  {short(lesson.title)}
                </text>
              </g>
            )
          })}
          <g transform={`translate(${scrollX},0)`} className="tree-labels">
            {REALMS.map((r, i) => (
              <g key={r.id}>
                <rect x={0} y={TOP + i * ROW} width={LEFT - 10} height={ROW} className={i % 2 ? 'row-b' : 'row-a'} />
                <rect x={10} y={TOP + i * ROW + 13} width={32} height={32} rx={8} fill={r.color} />
                <text x={26} y={TOP + i * ROW + 33} className="row-glyph" textAnchor="middle" fill={onColor(r.color)}>
                  {r.glyph.slice(0, 3)}
                </text>
                <a href={`#/realm/${r.id}`}>
                  <text x={50} y={TOP + i * ROW + 34} className="row-name">
                    {r.name}
                  </text>
                </a>
              </g>
            ))}
          </g>
        </svg>
      </div>
      <p className="muted small">★ boss · ⚒ Guild Tracker project part · ⟲ remix (mixes earlier ideas)</p>
    </div>
  )
}
