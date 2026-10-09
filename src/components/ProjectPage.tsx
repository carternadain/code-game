import { PROJECT_PARTS } from '../content'
import { useGame } from '../game/GameContext'
import { Icon } from './Icon'
import { RealmTile } from './RealmTile'
import { LearnNav } from './SkillTree'

/** Which piece of the app each realm adds, for the "what you've built" diagram. */
const LAYERS: { name: string; realms: string[] }[] = [
  { name: 'Logic', realms: ['js', 'think', 'ts'] },
  { name: 'Frontend', realms: ['web', 'react'] },
  { name: 'Database', realms: ['sql', 'alembic'] },
  { name: 'API', realms: ['servers'] },
  { name: 'Cloud', realms: ['aws', 'design'] },
  { name: 'AI', realms: ['ai'] },
]

/**
 * The Guild Tracker: one app built across the whole course, one part per realm.
 * Each part starts from the last part's code, the way real work starts from an existing codebase.
 */
export function ProjectPage() {
  const { p } = useGame()
  const done = PROJECT_PARTS.filter((x) => p.completed[x.lesson.id]).length
  const next = PROJECT_PARTS.find((x) => !p.completed[x.lesson.id])

  return (
    <div className="page">
      <div className="page-head">
        <LearnNav active="project" />
        <p className="eyebrow">One app, the whole course</p>
        <h1>Guild Tracker</h1>
        <p className="muted measure">
          A quest tracker you build piece by piece. Every realm adds one feature with what you just learned, and every part starts from the code you wrote in
          the last part. Plain JavaScript first, then types, a React screen, a database, an API, the cloud, and AI search.
        </p>
        <div className="row-meta">
          <span className="tnum">
            {done}/{PROJECT_PARTS.length} parts built
          </span>
          {next && (
            <a className="btn primary small" href={`#/lesson/${next.lesson.id}`}>
              {done ? 'Build the next part' : 'Start part 1'} <Icon name="arrowRight" size={14} />
            </a>
          )}
        </div>
      </div>

      <section className="panel stack-diagram" aria-label="What you've built so far">
        {LAYERS.map((layer) => {
          const parts = PROJECT_PARTS.filter((x) => layer.realms.includes(x.realm.id))
          const built = parts.filter((x) => p.completed[x.lesson.id]).length
          return (
            <div key={layer.name} className={`layer ${built === parts.length && parts.length ? 'is-built' : built ? 'is-partial' : ''}`}>
              <strong>{layer.name}</strong>
              <span className="muted small tnum">
                {built}/{parts.length}
              </span>
            </div>
          )
        })}
      </section>

      <ol className="syllabus project-steps">
        {PROJECT_PARTS.map(({ realm, lesson }) => {
          const isDone = !!p.completed[lesson.id]
          const isNext = next?.lesson.id === lesson.id
          return (
            <li key={lesson.id} className={`syl-row ${isDone ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`}>
              <span className="syl-num tnum">{isDone ? <Icon name="check" size={16} /> : lesson.project!.part}</span>
              <RealmTile realm={realm} size="sm" />
              <span className="syl-main">
                <strong>{lesson.title.replace(/^Guild Tracker \d+: /, '')}</strong>
                <span className="muted small">
                  {realm.name} · adds {lesson.project!.adds}
                </span>
              </span>
              <a className={`btn small ${isNext ? 'primary' : ''}`} href={`#/lesson/${lesson.id}`}>
                {isDone ? 'Replay' : 'Build'}
              </a>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
