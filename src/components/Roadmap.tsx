import { REALMS } from '../content'
import { useGame } from '../game/GameContext'

/** The 9-month plan at ~25 min/day. Months 1–3 = "fast track" if you go hard; 9 = comfortable pace. */
const PHASES = [
  {
    months: 'Month 1',
    title: 'Foundations: think like the computer',
    realms: ['js', 'cs', 'git'],
    goal: 'Write small JS functions from a blank file with no AI. Explain the call stack and references out loud.',
    project: 'Mini project: a command-line quiz game in plain JavaScript (Node).',
  },
  {
    months: 'Month 2',
    title: 'Types & the event loop',
    realms: ['cs', 'ts'],
    goal: 'Read and fix TypeScript compile errors yourself. Predict the output of async code.',
    project: 'Mini project: convert your quiz game to TypeScript with strict mode on.',
  },
  {
    months: 'Month 3',
    title: 'React for real + debugging',
    realms: ['react', 'debug'],
    goal: 'Build a small React + TS app from `npm create vite` without copying tutorials. Debug with DevTools.',
    project: 'Mini project: a habit tracker in React + TypeScript + localStorage.',
  },
  {
    months: 'Month 4',
    title: 'Python, SQL & migrations',
    realms: ['py', 'sql', 'alembic'],
    goal: 'Write JOINs and GROUP BYs without looking anything up. Explain what Alembic does and run upgrade/downgrade yourself.',
    project: 'Mini project: a FastAPI + SQLite/Postgres API with SQLAlchemy models and 3 Alembic migrations.',
  },
  {
    months: 'Month 5',
    title: 'Data structures & algorithms I',
    realms: ['dsa'],
    goal: 'Say the Big-O of your own code. Solve easy LeetCode problems in 20 minutes.',
    project: 'Daily: 1 easy problem. Weekly: re-solve one from memory.',
  },
  {
    months: 'Month 6',
    title: 'Servers, HTTP & security',
    realms: ['dsa', 'servers', 'security'],
    goal: 'Explain what happens when you type a URL. Build an authenticated API with proper status codes.',
    project: 'Mini project: connect your React app to your FastAPI backend with login.',
  },
  {
    months: 'Month 7',
    title: 'Shipping: Docker, CI/CD & system design I',
    realms: ['devops', 'design'],
    goal: 'Dockerize your full-stack app and run tests in GitHub Actions on every push.',
    project: 'Capstone part 1: your app in docker compose with CI.',
  },
  {
    months: 'Month 8',
    title: 'System design II & AWS',
    realms: ['design', 'aws'],
    goal: 'Whiteboard a URL shortener / news feed and defend the trade-offs. Deploy to AWS.',
    project: 'Capstone part 2: deploy to AWS (S3 + CloudFront for the frontend, ECS or Lambda for the API, RDS).',
  },
  {
    months: 'Month 9',
    title: 'AI engineering',
    realms: ['ai'],
    goal: 'Build a RAG feature and an agent loop. Measure them with a small eval set.',
    project: 'Capstone part 3: add an AI study-buddy to your app — RAG over your own notes, with citations.',
  },
]

export function Roadmap() {
  const { p } = useGame()
  return (
    <div className="page">
      <h1>The 9-month roadmap</h1>
      <p className="muted">
        Noob → job-ready engineer at 20–30 min/day. Go faster if you can do more; the order matters more than the speed. Every month ends with a small project
        you build <strong>without AI writing the code</strong> — that's where the learning gets cemented.
      </p>
      <div className="timeline">
        {PHASES.map((phase) => (
          <div key={phase.months} className="card phase">
            <div className="phase-month">{phase.months}</div>
            <h3>{phase.title}</h3>
            <div className="phase-realms">
              {phase.realms.map((id) => {
                const r = REALMS.find((x) => x.id === id)!
                const done = r.lessons.filter((l) => p.completed[l.id]).length
                return (
                  <a key={id} href={`#/realm/${id}`} className="realm-pill" style={{ ['--realm' as string]: r.color }}>
                    {r.icon} {r.name}{' '}
                    <span className="muted">
                      {done}/{r.lessons.length}
                    </span>
                  </a>
                )
              })}
            </div>
            <p>
              <strong>You can:</strong> {phase.goal}
            </p>
            <p className="muted">🛠 {phase.project}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
