export type Lang = 'javascript' | 'typescript' | 'react' | 'python' | 'sql'

/** A short read-and-understand card. Supports a tiny markdown subset (see Markdown.tsx). */
export interface ConceptStep {
  kind: 'concept'
  title: string
  /** "Explain like I'm 5": one everyday analogy, shown big before any jargon. */
  eli5?: string
  body: string
}

/** A column/box in a visual: the call stack, the heap, a queue, an array… */
export interface Lane {
  title: string
  items: string[]
  /** Indexes of items to glow in this frame. */
  highlight?: number[]
  /** stack = new items pile on top · row = left-to-right cells · list = top-to-bottom (default) */
  layout?: 'stack' | 'row' | 'list'
}

export interface Frame {
  /** 1-based line of `code` that is "running" in this frame. */
  line?: number
  /** One or two plain-English sentences about what just happened. */
  caption: string
  lanes: Lane[]
}

/** An animated step-through diagram: press Next and watch the machine work. */
export interface VisualStep {
  kind: 'visual'
  title: string
  code?: string
  frames: Frame[]
}

/** Multiple choice, "predict the output", "spot the bug" — all the same shape. */
export interface QuizStep {
  kind: 'quiz'
  prompt: string
  code?: string
  options: string[]
  answer: number
  explain: string
}

/** Write real code. It runs in the browser and is checked by tests. */
export interface CodeStep {
  kind: 'code'
  lang: Lang
  title: string
  instructions: string
  starter: string
  /**
   * javascript/typescript/react: JS run after your code. Use `expect(actual).toBe(expected)`,
   *   `expect(x).toEqual(y)`, and (react) `screen` = the preview document.
   * python: Python run after your code. Use plain `assert` statements.
   * sql: optional query run after your SQL (e.g. inspect the schema after a migration).
   *   Its result after your code must match its result after `solution`. If empty, the result of
   *   your last statement is compared with the solution's.
   */
  tests: string
  /** sql only: schema + seed data run before your query. */
  setup?: string
  hint: string
  solution: string
}

/** Feynman technique: explain it in your own words. No AI allowed. Self-graded. */
export interface ExplainStep {
  kind: 'explain'
  prompt: string
  /** What a good answer mentions — shown after you submit. */
  keyPoints: string[]
}

export type Step = ConceptStep | VisualStep | QuizStep | CodeStep | ExplainStep

export interface Lesson {
  id: string
  title: string
  /** Boss lessons are the realm finale: more XP, harder. */
  boss?: boolean
  minutes: number
  steps: Step[]
}

export interface Realm {
  id: string
  name: string
  topic: string
  icon: string
  /** 1–4 characters shown on the realm's tile, e.g. 'JS', 'SQL', 'O(n)'. */
  glyph: string
  color: string
  /** Suggested month in the 9-month plan, e.g. "Month 1". */
  when: string
  blurb: string
  lessons: Lesson[]
  /** Lesson titles on the roadmap that haven't been built yet. */
  comingSoon: string[]
}

export interface TestResult {
  name: string
  pass: boolean
  message?: string
}

export interface RunResult {
  logs: string[]
  error?: string
  tests: TestResult[]
  /** sql only */
  table?: { columns: string[]; values: unknown[][] }
}
