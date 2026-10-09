import type { Lane, Lesson, VisualStep } from '../types'
import { FAKE_API } from './fakeServer'

/**
 * The Guild Tracker: one app that grows through the whole course. Each part lives in a realm,
 * starts from the previous part's code and adds one feature with that realm's new skill.
 * `after` = insert after this lesson id (default: end of the realm).
 */

// ---------------------------------------------------------------------------------------------
// "Where we are": an architecture picture that grows part by part.
// ---------------------------------------------------------------------------------------------

const LANES = ['Core logic', 'Frontend', 'API', 'Database', 'Cloud', 'AI'] as const
type LaneName = (typeof LANES)[number]
type Pieces = Partial<Record<LaneName, string[]>>

/** What each part adds to the picture. */
const PIECES: Pieces[] = [
  { 'Core logic': ['quests array', 'addQuest · totalReward · questLabel'] },
  { 'Core logic': ['pure functions: map · filter · reduce'] },
  { 'Core logic': ['types: Quest · Difficulty'] },
  { Frontend: ['loadQuests · saveQuest · markDone (fetch)'], API: ['a pretend server at /api/quests'] },
  { Frontend: ['Quest Board UI (React)'] },
  { Database: ['quests table (SQL)'] },
  { API: ['Python data layer (sqlite3)'] },
  { Database: ['migration: + difficulty column'] },
  { API: ['HTTP routes + auth: handle(req)'] },
  { Cloud: ['Lambda handler(event)'] },
  { AI: ['searchQuests + RAG prompt'] },
  { Cloud: ['CDN · cache · read replica · queue'] },
]

/** Frame 1 = the app so far. Frame 2 = the same app with this part's new piece glowing. */
function whereWeAre(part: number, before: string, after: string): VisualStep {
  const old: Pieces = {}
  for (const pieces of PIECES.slice(0, part - 1)) {
    for (const name of LANES) if (pieces[name]) old[name] = [...(old[name] ?? []), ...pieces[name]]
  }
  const added = PIECES[part - 1]
  const shown = LANES.filter((name) => old[name] || added[name])
  const lane = (name: LaneName, withNew: boolean): Lane => {
    const was = old[name] ?? []
    const extra = withNew ? (added[name] ?? []) : []
    const items = [...was, ...extra]
    return {
      title: name,
      items: items.length ? items : ['(nothing yet)'],
      highlight: extra.map((_, i) => was.length + i),
    }
  }
  return {
    kind: 'visual',
    title: 'Where we are',
    frames: [
      { caption: before, lanes: shown.map((name) => lane(name, false)) },
      { caption: after, lanes: shown.map((name) => lane(name, true)) },
    ],
  }
}

// ---------------------------------------------------------------------------------------------
// Part 1 (JavaScript)
// ---------------------------------------------------------------------------------------------

const SEED = `const quests = [
  { id: 1, title: 'Slay the Bug Dragon', reward: 500, done: false },
  { id: 2, title: 'Fix Prod at 2am', reward: 300, done: true },
  { id: 3, title: 'Write the Docs', reward: 50, done: false },
]`

const P1_ADD = `// Add a new quest to the END of the list and return it.
// Its id is one more than the number of quests already in the list.
function addQuest(quests, title, reward) {
  const quest = { id: quests.length + 1, title: title, reward: reward, done: false }
  quests.push(quest)
  return quest
}

// Add up the reward of every quest.
function totalReward(quests) {
  let total = 0
  for (const quest of quests) {
    total = total + quest.reward
  }
  return total
}`

const P1_LABEL = `// One line of text per quest: "[ ] Slay the Bug Dragon (500g)", or "[x] ..." when done.
function questLabel(quest) {
  let box = '[ ]'
  if (quest.done) {
    box = '[x]'
  }
  return \`\${box} \${quest.title} (\${quest.reward}g)\`
}`

// ---------------------------------------------------------------------------------------------
// Part 2 (pure functions)
// ---------------------------------------------------------------------------------------------

const P2_ADD = `// Returns a NEW list with the quest on the end. The old list is untouched.
function addQuest(quests, title, reward) {
  const quest = { id: quests.length + 1, title: title, reward: reward, done: false }
  return [...quests, quest]
}

// Returns a NEW list where quest \`id\` is done. The old quest objects are untouched.
function completeQuest(quests, id) {
  return quests.map((quest) => {
    if (quest.id === id) return { ...quest, done: true }
    return quest
  })
}`

const P2_REST = `// Only the quests that are not done yet.
function openQuests(quests) {
  return quests.filter((quest) => !quest.done)
}

// Add up the reward of every quest.
function totalReward(quests) {
  return quests.reduce((sum, quest) => sum + quest.reward, 0)
}`

// ---------------------------------------------------------------------------------------------
// Part 3 (TypeScript)
// ---------------------------------------------------------------------------------------------

const P3_TYPES = `type Difficulty = 'easy' | 'normal' | 'hard'

type Quest = {
  id: number
  title: string
  reward: number
  done: boolean
  difficulty: Difficulty
}`

const P3_A = `${P3_TYPES}

const quests: Quest[] = [
  { id: 1, title: 'Slay the Bug Dragon', reward: 500, done: false, difficulty: 'hard' },
  { id: 2, title: 'Fix Prod at 2am', reward: 300, done: true, difficulty: 'normal' },
  { id: 3, title: 'Write the Docs', reward: 50, done: false, difficulty: 'easy' },
]

function addQuest(quests: Quest[], title: string, reward: number, difficulty: Difficulty = 'normal'): Quest[] {
  const quest: Quest = { id: quests.length + 1, title: title, reward: reward, done: false, difficulty: difficulty }
  return [...quests, quest]
}

function completeQuest(quests: Quest[], id: number): Quest[] {
  return quests.map((quest) => {
    if (quest.id === id) return { ...quest, done: true }
    return quest
  })
}

function openQuests(quests: Quest[]): Quest[] {
  return quests.filter((quest) => !quest.done)
}

function totalReward(quests: Quest[]): number {
  return quests.reduce((sum, quest) => sum + quest.reward, 0)
}

function questLabel(quest: Quest): string {
  let box = '[ ]'
  if (quest.done) {
    box = '[x]'
  }
  return \`\${box} \${quest.title} (\${quest.reward}g)\`
}`

const P3_B = `// Only the quests with difficulty d.
function questsByDifficulty(quests: Quest[], d: Difficulty): Quest[] {
  return quests.filter((quest) => quest.difficulty === d)
}

// Extra gold for harder quests.
function bonusFor(d: Difficulty): number {
  switch (d) {
    case 'easy':
      return 0
    case 'normal':
      return 50
    case 'hard':
      return 200
  }
}`

// ---------------------------------------------------------------------------------------------
// Part 4 (fetch)
// ---------------------------------------------------------------------------------------------

const P4_HELPERS = `type Difficulty = 'easy' | 'normal' | 'hard'

type Quest = {
  id: number
  title: string
  reward: number
  done: boolean
  difficulty?: Difficulty // ? = optional: the server doesn't store difficulty yet (Part 8 fixes that)
}

function completeQuest(quests: Quest[], id: number): Quest[] {
  return quests.map((quest) => {
    if (quest.id === id) return { ...quest, done: true }
    return quest
  })
}

function openQuests(quests: Quest[]): Quest[] {
  return quests.filter((quest) => !quest.done)
}

function totalReward(quests: Quest[]): number {
  return quests.reduce((sum, quest) => sum + quest.reward, 0)
}

function questLabel(quest: Quest): string {
  let box = '[ ]'
  if (quest.done) {
    box = '[x]'
  }
  return \`\${box} \${quest.title} (\${quest.reward}g)\`
}`

const P4_LOAD = `// GET every quest from the server.
async function loadQuests(): Promise<Quest[]> {
  const res = await fetch('/api/quests')
  if (!res.ok) throw new Error(\`Could not load quests (\${res.status})\`)
  return res.json()
}`

const P4_SAVE = `// POST a new quest. The server picks its id and sends the saved quest back.
async function saveQuest(title: string, reward: number): Promise<Quest> {
  const res = await fetch('/api/quests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title, reward: reward }),
  })
  if (!res.ok) throw new Error(\`Could not save quest (\${res.status})\`)
  return res.json()
}

// PATCH one quest to done: true.
async function markDone(id: number): Promise<Quest> {
  const res = await fetch(\`/api/quests/\${id}\`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: true }),
  })
  if (!res.ok) throw new Error(\`Could not complete quest \${id} (\${res.status})\`)
  return res.json()
}`

// ---------------------------------------------------------------------------------------------
// Part 5 (React)
// ---------------------------------------------------------------------------------------------

const P5_HEADER = `// 🏰 Guild Tracker, Part 5: the Quest Board.
// Your code from Parts 3 and 4: types, pure helpers and the server calls.
${P4_HELPERS}

${P4_LOAD}

${P4_SAVE}`

const P5_A = `${P5_HEADER}

function App() {
  const [quests, setQuests] = useState<Quest[]>([])

  // When the board first appears, load the quests from the server.
  useEffect(() => {
    loadQuests().then(setQuests)
  }, [])

  // Tell the server first, then update the screen with your Part 2 helper.
  async function complete(id: number) {
    await markDone(id)
    setQuests((qs) => completeQuest(qs, id))
  }

  return (
    <div>
      <h1>Quest Board</h1>
      <ul>
        {quests.map((quest) => (
          <li key={quest.id}>
            {questLabel(quest)}{' '}
            {!quest.done && <button onClick={() => complete(quest.id)}>Complete</button>}
          </li>
        ))}
      </ul>
      <p id="total">To earn: {totalReward(openQuests(quests))}g</p>
    </div>
  )
}
`

const P5_B = `${P5_HEADER}

function App() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [title, setTitle] = useState('')
  const [reward, setReward] = useState('')

  // When the board first appears, load the quests from the server.
  useEffect(() => {
    loadQuests().then(setQuests)
  }, [])

  // Tell the server first, then update the screen with your Part 2 helper.
  async function complete(id: number) {
    await markDone(id)
    setQuests((qs) => completeQuest(qs, id))
  }

  async function add(e: { preventDefault: () => void }) {
    e.preventDefault()
    const clean = title.trim()
    if (!clean) return
    const saved = await saveQuest(clean, Number(reward) || 0)
    setQuests((qs) => [...qs, saved])
    setTitle('')
    setReward('')
  }

  return (
    <div>
      <h1>Quest Board</h1>
      <form onSubmit={add}>
        <input name="title" placeholder="New quest" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input name="reward" type="number" placeholder="Reward" value={reward} onChange={(e) => setReward(e.target.value)} />
        <button>Add</button>
      </form>
      <ul>
        {quests.map((quest) => (
          <li key={quest.id}>
            {questLabel(quest)}{' '}
            {!quest.done && <button onClick={() => complete(quest.id)}>Complete</button>}
          </li>
        ))}
      </ul>
      <p id="total">To earn: {totalReward(openQuests(quests))}g</p>
    </div>
  )
}
`

/** FAKE_API lives inside the preview's App scope; expose its request log to the tests. */
const REACT_API = `${FAKE_API}\nwindow.__requests = __requests;\n`

// ---------------------------------------------------------------------------------------------
// Part 6 (SQL)
// ---------------------------------------------------------------------------------------------

const P6_TABLE = `CREATE TABLE quests (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  reward INTEGER NOT NULL CHECK (reward >= 0),
  done INTEGER NOT NULL DEFAULT 0
);

INSERT INTO quests (title, reward, done) VALUES
  ('Slay the Bug Dragon', 500, 0),
  ('Fix Prod at 2am', 300, 1),
  ('Write the Docs', 50, 0);`

// ---------------------------------------------------------------------------------------------
// Part 7 + 8 (Python)
// ---------------------------------------------------------------------------------------------

const indent = (s: string) =>
  s
    .split('\n')
    .map((l) => (l ? '  ' + l : l))
    .join('\n')

const PY_DB = `import sqlite3

# Your table from Part 6, now created from Python.
SCHEMA = """
${indent(P6_TABLE)}
"""


def make_db():
    conn = sqlite3.connect(":memory:")
    conn.executescript(SCHEMA)
    return conn`

const PY_ROW = `def row_to_quest(row):
    # SQLite has no true/false: done comes back as 0 or 1. Turn it into a real bool.
    quest_id, title, reward, done = row
    return {"id": quest_id, "title": title, "reward": reward, "done": bool(done)}`

const PY_LIST = `def list_quests(conn, done=None):
    if done is None:
        rows = conn.execute("SELECT id, title, reward, done FROM quests ORDER BY id").fetchall()
    else:
        rows = conn.execute(
            "SELECT id, title, reward, done FROM quests WHERE done = ? ORDER BY id", (int(done),)
        ).fetchall()
    return [row_to_quest(row) for row in rows]`

const PY_WRITE = `def add_quest(conn, title, reward):
    cur = conn.execute("INSERT INTO quests (title, reward) VALUES (?, ?)", (title, reward))
    conn.commit()
    return {"id": cur.lastrowid, "title": title, "reward": reward, "done": False}


def complete_quest(conn, quest_id):
    cur = conn.execute("UPDATE quests SET done = 1 WHERE id = ?", (quest_id,))
    conn.commit()
    return cur.rowcount == 1`

const PY_DB_V1 = `import sqlite3

# Production is at revision a1_create_quests, and the table is full of real quests.
SCHEMA = """
${indent(P6_TABLE)}

  CREATE TABLE alembic_version (version_num TEXT NOT NULL);
  INSERT INTO alembic_version VALUES ('a1_create_quests');
"""


def make_db():
    conn = sqlite3.connect(":memory:")
    conn.executescript(SCHEMA)
    return conn`

const PY_MIGRATION = `# ---- migrations/versions/b2_add_difficulty.py ----
revision = "b2_add_difficulty"
down_revision = "a1_create_quests"


def upgrade(conn):
    conn.execute("ALTER TABLE quests ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'normal'")
    conn.execute("UPDATE alembic_version SET version_num = ?", (revision,))
    conn.commit()


def downgrade(conn):
    conn.execute("ALTER TABLE quests DROP COLUMN difficulty")
    conn.execute("UPDATE alembic_version SET version_num = ?", (down_revision,))
    conn.commit()`

// ---------------------------------------------------------------------------------------------
// Part 9 + 10 (servers, Lambda)
// ---------------------------------------------------------------------------------------------

const P9_DATA = `// In production these call your Part 7 data layer on the real database.
// Here a plain array stands in for the database, so we can focus on HTTP.
const db = {
  quests: [
    { id: 1, title: 'Slay the Bug Dragon', reward: 500, done: false, difficulty: 'hard' },
    { id: 2, title: 'Fix Prod at 2am', reward: 300, done: true, difficulty: 'normal' },
    { id: 3, title: 'Write the Docs', reward: 50, done: false, difficulty: 'easy' },
  ],
}

function listQuests() {
  return db.quests
}

function getQuest(id) {
  return db.quests.find((q) => q.id === id)
}

function addQuest(title, reward, difficulty = 'normal') {
  const quest = { id: db.quests.length + 1, title: title, reward: reward, done: false, difficulty: difficulty }
  db.quests.push(quest)
  return quest
}

// Your router helper from srv-2: matchRoute('/quests/:id', '/quests/7') → { id: '7' }, or null
function matchRoute(pattern, path) {
  const a = pattern.split('/')
  const b = path.split('/')
  if (a.length !== b.length) return null
  const params = {}
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = b[i]
    else if (a[i] !== b[i]) return null
  }
  return params
}`

const P9_A_HANDLE = `// Answer each request with { status, body }.
function handle(req) {
  if (req.method === 'GET' && req.path === '/quests') {
    return { status: 200, body: listQuests() }
  }
  const params = matchRoute('/quests/:id', req.path)
  if (req.method === 'GET' && params) {
    const quest = getQuest(Number(params.id))
    if (!quest) return { status: 404, body: { error: 'Quest not found' } }
    return { status: 200, body: quest }
  }
  return { status: 404, body: { error: 'Not found' } }
}`

const P9_AUTH = `// Middleware: wraps a handler. No valid token → 401, and the handler never runs.
function withAuth(handler) {
  return (req) => {
    if (req.headers.authorization !== 'Bearer letmein') {
      return { status: 401, body: { error: 'Not logged in' } }
    }
    return handler(req)
  }
}

const createQuest = withAuth((req) => {
  if (!req.body || !req.body.title) return { status: 400, body: { error: 'title is required' } }
  return { status: 201, body: addQuest(req.body.title, req.body.reward || 0) }
})`

const P9_B_HANDLE = `// Answer each request with { status, body }.
function handle(req) {
  if (req.method === 'GET' && req.path === '/quests') {
    return { status: 200, body: listQuests() }
  }
  if (req.method === 'POST' && req.path === '/quests') {
    return createQuest(req)
  }
  const params = matchRoute('/quests/:id', req.path)
  if (req.method === 'GET' && params) {
    const quest = getQuest(Number(params.id))
    if (!quest) return { status: 404, body: { error: 'Quest not found' } }
    return { status: 200, body: quest }
  }
  return { status: 404, body: { error: 'Not found' } }
}`

const P9_CODE = `${P9_DATA}\n\n${P9_AUTH}\n\n${P9_B_HANDLE}`

const P10_JSON = `// Lambda answers must have a STRING body.
const json = (statusCode, data) => ({
  statusCode: statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})`

const P10_A = `async function handler(event) {
  const req = {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : undefined,
  }
  const res = handle(req)
  return json(res.status, res.body)
}`

const P10_B = `async function handler(event) {
  // Header names can arrive in any case. Make them all lowercase.
  const headers = {}
  for (const name in event.headers || {}) {
    headers[name.toLowerCase()] = event.headers[name]
  }
  // A body that isn't valid JSON is the caller's mistake: 400, not a crash.
  let body
  if (event.body) {
    try {
      body = JSON.parse(event.body)
    } catch {
      return json(400, { error: 'Body must be valid JSON' })
    }
  }
  const res = handle({ method: event.httpMethod, path: event.path, headers: headers, body: body })
  return json(res.status, res.body)
}`

// ---------------------------------------------------------------------------------------------
// Part 11 (AI search)
// ---------------------------------------------------------------------------------------------

const P11_DATA = `// Your data layer from Parts 9 and 10 (handle() and handler() are unchanged, hidden to keep this short).
const db = {
  quests: [
    { id: 1, title: 'Slay the Bug Dragon', reward: 500, done: false },
    { id: 2, title: 'Fix Prod at 2am', reward: 300, done: true },
    { id: 3, title: 'Write the Docs', reward: 50, done: false },
    { id: 4, title: 'Review a Pull Request', reward: 120, done: false },
    { id: 5, title: 'Fix the login bug', reward: 200, done: false },
    { id: 6, title: 'Write tests for the login page', reward: 150, done: false },
  ],
}

function listQuests() {
  return db.quests
}

// Lowercase words only: 'Fix the Login bug!' → ['fix', 'the', 'login', 'bug']
function words(text) {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w !== '')
}

// Every different word used in the quest titles, in a fixed order.
function buildVocab(quests) {
  const vocab = []
  for (const quest of quests) {
    for (const w of words(quest.title)) {
      if (!vocab.includes(w)) vocab.push(w)
    }
  }
  return vocab
}`

const P11_A = `// One number per vocab word: how many times that word appears in the text.
function embed(text, vocab) {
  const ws = words(text)
  return vocab.map((v) => ws.filter((w) => w === v).length)
}

// 1 = same direction, 0 = nothing in common.
function cosine(a, b) {
  const dot = a.reduce((sum, x, i) => sum + x * b[i], 0)
  const norm = (v) => Math.sqrt(v.reduce((sum, x) => sum + x * x, 0))
  if (norm(a) === 0 || norm(b) === 0) return 0
  return dot / (norm(a) * norm(b))
}

// Titles of the k quests most similar to the query, best first.
function searchQuests(quests, query, k) {
  const vocab = buildVocab(quests)
  const q = embed(query, vocab)
  return quests
    .map((quest) => ({ title: quest.title, score: cosine(q, embed(quest.title, vocab)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((hit) => hit.title)
}`

const P11_B = `function buildPrompt(question, hits) {
  const sources = hits.map((title, i) => \`[\${i + 1}] \${title}\`).join('\\n')
  return (
    'Answer using only the quests below. If the answer is not there, say "I do not know".\\n\\n' +
    sources +
    '\\n\\nQuestion: ' +
    question
  )
}

function askGuild(question) {
  return buildPrompt(question, searchQuests(listQuests(), question, 3))
}`

// ---------------------------------------------------------------------------------------------
// Part 12 (cache)
// ---------------------------------------------------------------------------------------------

const P12_DATA = `// Your data layer, talking to the real (slow, busy) database.
const db = {
  quests: [
    { id: 1, title: 'Slay the Bug Dragon', reward: 500, done: false },
    { id: 2, title: 'Fix Prod at 2am', reward: 300, done: true },
    { id: 3, title: 'Write the Docs', reward: 50, done: false },
  ],
}

async function listQuestsFromDb() {
  return db.quests.map((quest) => ({ ...quest }))
}

async function completeQuestInDb(id) {
  const quest = db.quests.find((q) => q.id === id)
  if (quest) quest.done = true
}`

const P12_SOL = `async function cachedListQuests(cache, loadFn, ttlMs, now) {
  const hit = cache.get('quests')
  if (hit && hit.expiresAt > now) return hit.value
  const value = await loadFn()
  cache.set('quests', { value: value, expiresAt: now + ttlMs })
  return value
}

async function completeQuest(cache, id) {
  await completeQuestInDb(id)
  cache.delete('quests')
}`

// ---------------------------------------------------------------------------------------------
// The parts
// ---------------------------------------------------------------------------------------------

export const guildParts: { realm: string; after?: string; lesson: Lesson }[] = [
  // ------------------------------------------------------------------------------------------- 1
  {
    realm: 'js',
    lesson: {
      id: 'gt-1',
      title: 'Guild Tracker 1: A Quest List',
      project: { part: 1, adds: 'a quest list in plain JavaScript' },
      uses: ['js-2', 'js-4', 'js-b8'],
      minutes: 15,
      steps: [
        whereWeAre(
          1,
          'This is the start of **one app you will keep building for the whole course**: the Guild Tracker. Right now it is an empty folder.',
          'Part 1 adds the heart of it: a **list of quests** and three small functions that work on it. Everything later grows out of this.',
        ),
        {
          kind: 'concept',
          title: 'Your first real app',
          eli5: 'A quest list is a **to-do list for heroes**. Each sticky note has a title, how much gold it pays, and a tick box.',
          body: `
Up to now, every challenge was a small puzzle. From here on, there is also **one app** that keeps growing. Each realm adds one feature to it, using that realm's new skill. That's what a real job feels like: you rarely start from nothing, you change code that already exists.

## The data
Each quest is an **object**. All quests live in one **array**:

\`\`\`
{ id: 1, title: 'Slay the Bug Dragon', reward: 500, done: false }
\`\`\`
## The three jobs
- \`addQuest\`: put a new quest on the list
- \`totalReward\`: add up all the gold (a loop)
- \`questLabel\`: turn one quest into a line of text (a template literal)

> Inside a function, \`quests\` means whatever list you pass in. That makes the function work on *any* list, not just one.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Guided: add quests and count the gold',
          instructions: `
Finish two functions. The plan is already written as comments.

1. \`addQuest(quests, title, reward)\` makes a quest \`{ id, title, reward, done: false }\`, **pushes** it onto the list, and **returns** it. Its \`id\` is \`quests.length + 1\`.
2. \`totalReward(quests)\` loops over every quest and adds up the rewards.
`,
          starter: `// 🏰 Guild Tracker, Part 1
// Your guild's quest list. Each quest is an object.
${SEED}

// Add a new quest to the END of the list and return it.
// Its id is one more than the number of quests already in the list.
function addQuest(quests, title, reward) {
  // 1. make the quest object: { id, title, reward, done: false }

  // 2. push it onto the list

  // 3. return it
}

// Add up the reward of every quest.
function totalReward(quests) {
  // 1. start a total at 0

  // 2. loop over every quest and add its reward to the total

  // 3. return the total
}

addQuest(quests, 'Review a Pull Request', 120)
console.log(quests.length) // 4
console.log(totalReward(quests)) // 970
`,
          tests: `test('addQuest returns the new quest', () => {
  const board = []
  expect(addQuest(board, 'Feed the Cat', 10)).toEqual({ id: 1, title: 'Feed the Cat', reward: 10, done: false })
})
test('addQuest puts it on the end of the list', () => {
  const board = []
  addQuest(board, 'A', 1)
  addQuest(board, 'B', 2)
  expect(board.length).toBe(2)
  expect(board[1].title).toBe('B')
})
test('ids go up by one', () => {
  const board = []
  addQuest(board, 'A', 1)
  expect(addQuest(board, 'B', 2).id).toBe(2)
})
test('totalReward adds up every reward', () => expect(totalReward([{ reward: 5 }, { reward: 7 }, { reward: 8 }])).toBe(20))
test('totalReward of an empty list is 0', () => expect(totalReward([])).toBe(0))`,
          hint: 'const quest = { id: quests.length + 1, title: title, reward: reward, done: false } · quests.push(quest) · return quest. For the total: let total = 0; for (const quest of quests) { total = total + quest.reward }; return total',
          solution: `// 🏰 Guild Tracker, Part 1
// Your guild's quest list. Each quest is an object.
${SEED}

${P1_ADD}

addQuest(quests, 'Review a Pull Request', 120)
console.log(quests.length) // 4
console.log(totalReward(quests)) // 970
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your turn: a label for each quest',
          instructions: `
The screen needs one line of text per quest. Write \`questLabel(quest)\`:

- not done → \`[ ] Slay the Bug Dragon (500g)\`
- done → \`[x] Fix Prod at 2am (300g)\`

Pick the box first (\`'[ ]'\` or \`'[x]'\`), then build the line with **one template literal** with three slots.
`,
          starter: `// 🏰 Guild Tracker, Part 1 (continued)
${SEED}

${P1_ADD}

// One line of text per quest: "[ ] Slay the Bug Dragon (500g)", or "[x] ..." when done.
function questLabel(quest) {
  // 1. pick the box: '[x]' if quest.done, otherwise '[ ]'

  // 2. return one template literal with three slots: box, title, reward
}

for (const quest of quests) {
  console.log(questLabel(quest))
}
`,
          tests: `test('an open quest gets an empty box', () => expect(questLabel({ id: 1, title: 'Slay the Bug Dragon', reward: 500, done: false })).toBe('[ ] Slay the Bug Dragon (500g)'))
test('a done quest gets an x', () => expect(questLabel({ id: 2, title: 'Fix Prod at 2am', reward: 300, done: true })).toBe('[x] Fix Prod at 2am (300g)'))
test('works for the quests in your list', () => expect(questLabel(quests[2])).toBe('[ ] Write the Docs (50g)'))
test('uses a template literal', () => { if (!questLabel.toString().includes('\${')) throw new Error('Build the line with \${...} slots inside backticks') })`,
          hint: "let box = '[ ]' · if (quest.done) { box = '[x]' } · return `${box} ${quest.title} (${quest.reward}g)`",
          solution: `// 🏰 Guild Tracker, Part 1 (continued)
${SEED}

${P1_ADD}

${P1_LABEL}

for (const quest of quests) {
  console.log(questLabel(quest))
}
`,
        },
        {
          kind: 'quiz',
          prompt: 'The list has 3 quests. What does this print?',
          code: `addQuest(quests, 'Review a Pull Request', 120)\nconsole.log(quests.length)`,
          options: ['3', '4', 'undefined', 'An error'],
          answer: 1,
          explain:
            '`push` changes the list itself, so it now has 4 quests. Remember this: in Part 2 you will see why changing a list in place can cause trouble, and fix it.',
        },
      ],
    },
  },

  // ------------------------------------------------------------------------------------------- 2
  {
    realm: 'think',
    lesson: {
      id: 'gt-2',
      title: 'Guild Tracker 2: Pure Functions',
      project: { part: 2, adds: 'a pure, loop-free refactor' },
      uses: ['gt-1', 'think-4'],
      minutes: 15,
      steps: [
        whereWeAre(
          2,
          'Your app so far: a quest list and three functions. They work, but `addQuest` **changes** the list it is given.',
          'Part 2 is a **refactor**: same features, better shape. Every function becomes **pure**: it returns new data and never changes what it was given.',
        ),
        {
          kind: 'concept',
          title: 'Why rewrite code that works?',
          eli5: 'Changing the list in place is like **writing on the only copy of a recipe**. Anyone else reading it gets your scribbles too. A pure function **photocopies it first**, then writes on the copy.',
          body: `
In Part 1, \`addQuest\` used \`push\`. That changes the list for **everyone** who holds it. In a big app that leads to "who changed this?!" bugs.

## The pure version
- \`addQuest\` returns a **new** array: \`[...quests, quest]\`
- \`completeQuest\` uses **map** to make a new array where one quest is done
- \`openQuests\` uses **filter**
- \`totalReward\` uses **reduce**

No \`for\` loops, no \`push\`. Each function only looks at its inputs and returns an answer.

> This pays off big in Part 5: React *needs* new arrays to notice a change. Your pure functions will plug straight in.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Guided: stop changing the list',
          instructions: `
This is your Part 1 code. Change two things:

1. \`addQuest\` must return a **new array** with the quest on the end (use spread: \`[...quests, quest]\`). The original list stays the same. No \`push\`.
2. Write \`completeQuest(quests, id)\` with **map**: return a new array where the quest with that \`id\` is replaced by \`{ ...quest, done: true }\`. Other quests stay as they are.
`,
          starter: `// 🏰 Guild Tracker, Part 2
// Your code from Part 1:
${SEED}

// TODO 1: return a NEW array instead of pushing (and don't return the quest any more)
${P1_ADD}

// TODO 2: return a NEW array where the quest with this id has done: true. Use map.
function completeQuest(quests, id) {
  return quests
}

${P1_LABEL}

const more = addQuest(quests, 'Review a Pull Request', 120)
console.log(quests.length, more.length) // 3 4
`,
          tests: `const start = [
  { id: 1, title: 'A', reward: 10, done: false },
  { id: 2, title: 'B', reward: 20, done: false },
]
test('addQuest returns a new array with the quest on the end', () => {
  const next = addQuest(start, 'C', 30)
  expect(next.length).toBe(3)
  expect(next[2]).toEqual({ id: 3, title: 'C', reward: 30, done: false })
})
test('addQuest leaves the original array alone', () => {
  addQuest(start, 'D', 40)
  expect(start.length).toBe(2)
})
test('addQuest does not use push', () => expect(addQuest.toString().includes('.push(')).toBe(false))
test('completeQuest marks only that quest done', () => expect(completeQuest(start, 2).map((q) => q.done)).toEqual([false, true]))
test('completeQuest leaves the original quests alone', () => {
  completeQuest(start, 1)
  expect(start[0].done).toBe(false)
})
test('completeQuest uses map', () => expect(completeQuest.toString().includes('.map(')).toBe(true))`,
          hint: 'addQuest: build the quest, then return [...quests, quest]. completeQuest: return quests.map((quest) => { if (quest.id === id) return { ...quest, done: true }; return quest })',
          solution: `// 🏰 Guild Tracker, Part 2
// Your code from Part 1, now pure:
${SEED}

${P2_ADD}

${P1_LABEL}

const more = addQuest(quests, 'Review a Pull Request', 120)
console.log(quests.length, more.length) // 3 4
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your turn: filter and reduce, no loops',
          instructions: `
Finish the refactor:

1. \`openQuests(quests)\` returns only the quests that are **not** done. Use **filter**.
2. Rewrite \`totalReward(quests)\` with **reduce** instead of the \`for\` loop.

When you're done there are no \`for\` loops left in your functions. Bonus: "gold still to earn" is now just \`totalReward(openQuests(quests))\`. Small pieces snap together.
`,
          starter: `// 🏰 Guild Tracker, Part 2 (continued)
${SEED}

${P2_ADD}

// TODO 1: only the quests that are not done yet. Use filter.
function openQuests(quests) {
  return quests
}

// TODO 2: same answer, but with reduce instead of a for loop
function totalReward(quests) {
  let total = 0
  for (const quest of quests) {
    total = total + quest.reward
  }
  return total
}

${P1_LABEL}

console.log(openQuests(quests).map(questLabel))
console.log('Gold still to earn:', totalReward(openQuests(quests))) // 550
`,
          tests: `const sample = [
  { id: 1, title: 'A', reward: 10, done: false },
  { id: 2, title: 'B', reward: 20, done: true },
  { id: 3, title: 'C', reward: 5, done: false },
]
test('openQuests keeps only quests that are not done', () => expect(openQuests(sample).map((q) => q.id)).toEqual([1, 3]))
test('openQuests uses filter', () => expect(openQuests.toString().includes('.filter(')).toBe(true))
test('totalReward still adds up every reward', () => expect(totalReward(sample)).toBe(35))
test('totalReward of an empty list is 0', () => expect(totalReward([])).toBe(0))
test('totalReward uses reduce', () => expect(totalReward.toString().includes('.reduce(')).toBe(true))
test('no for loops left in your functions', () => {
  for (const fn of [addQuest, completeQuest, openQuests, totalReward]) {
    if (/\\bfor\\s*\\(/.test(fn.toString())) throw new Error(fn.name + ' still has a for loop')
  }
})
test('gold still to earn is 550', () => expect(totalReward(openQuests(quests))).toBe(550))`,
          hint: 'return quests.filter((quest) => !quest.done) · return quests.reduce((sum, quest) => sum + quest.reward, 0)',
          solution: `// 🏰 Guild Tracker, Part 2 (continued)
${SEED}

${P2_ADD}

${P2_REST}

${P1_LABEL}

console.log(openQuests(quests).map(questLabel))
console.log('Gold still to earn:', totalReward(openQuests(quests))) // 550
`,
        },
        {
          kind: 'quiz',
          prompt: 'After this runs, how many quests are in `quests`?',
          code: `const quests = [{ id: 1, title: 'A', reward: 10, done: false }]\nconst next = addQuest(quests, 'B', 20)   // the pure version`,
          options: ['1', '2', '0', 'It depends on next'],
          answer: 0,
          explain:
            '`quests` still has 1 quest. The new list with 2 quests is in `next`. Nothing you passed in was changed. That is what makes pure functions safe to call from anywhere.',
        },
      ],
    },
  },

  // ------------------------------------------------------------------------------------------- 3
  {
    realm: 'ts',
    lesson: {
      id: 'gt-3',
      title: 'Guild Tracker 3: Types and Difficulty',
      project: { part: 3, adds: 'types and quest difficulty' },
      uses: ['gt-2', 'ts-2', 'ts-3'],
      minutes: 16,
      steps: [
        whereWeAre(
          3,
          'Your app so far: a quest list and pure functions. But nothing stops someone writing `reward: "lots"` or `title: 42`.',
          'Part 3 adds **types**: a `Quest` shape and a `Difficulty` that can only be easy, normal or hard. The compiler checks every function for you.',
        ),
        {
          kind: 'concept',
          title: 'A new feature: difficulty',
          eli5: 'A union type is a **menu with only three dishes**. You can order easy, normal or hard. Ask for "legendary" and the waiter (the compiler) says no before the kitchen even starts.',
          body: `
The guild wants a **difficulty** on every quest, and harder quests pay a **bonus**. If difficulty were a plain string, a typo like \`'hrad'\` would slip through and give the wrong bonus with no error.

With TypeScript:
\`\`\`
type Difficulty = 'easy' | 'normal' | 'hard'
\`\`\`
Now \`'hrad'\` is a compile error, and your editor autocompletes the three real options.

## The plan
1. Describe a \`Quest\` with a type
2. Add types to every function's inputs and output
3. New: \`questsByDifficulty\` and \`bonusFor\`
`,
        },
        {
          kind: 'code',
          lang: 'typescript',
          title: 'Guided: type your Part 2 code',
          instructions: `
This is your Part 2 code, now in a \`.ts\` file. Press **Compile & run**: the compiler lists every spot that needs a type. Fix them one by one.

1. \`type Difficulty = 'easy' | 'normal' | 'hard'\`
2. \`type Quest\` with \`id\`, \`title\`, \`reward\`, \`done\` and \`difficulty\`
3. Type the list (\`const quests: Quest[]\`) and every function's parameters and return value
4. \`addQuest\` gets a 4th parameter, \`difficulty: Difficulty = 'normal'\`, and puts it on the new quest
`,
          starter: `// 🏰 Guild Tracker, Part 3: your Part 2 code, now in TypeScript.
// TODO 1: type Difficulty = 'easy' | 'normal' | 'hard'
// TODO 2: type Quest = { ... } (id, title, reward, done, difficulty)

const quests = [
  { id: 1, title: 'Slay the Bug Dragon', reward: 500, done: false, difficulty: 'hard' },
  { id: 2, title: 'Fix Prod at 2am', reward: 300, done: true, difficulty: 'normal' },
  { id: 3, title: 'Write the Docs', reward: 50, done: false, difficulty: 'easy' },
]

// TODO 3: type every parameter and return value below
// TODO 4: addQuest takes a 4th parameter, difficulty (default 'normal')
${P2_ADD}

${P2_REST}

${P1_LABEL}

console.log(addQuest(quests, 'Tame the Legacy Code', 900, 'hard'))
`,
          tests: `test('addQuest stores the difficulty you pass', () => expect(addQuest(quests, 'Tame the Legacy Code', 900, 'hard')[3]).toEqual({ id: 4, title: 'Tame the Legacy Code', reward: 900, done: false, difficulty: 'hard' }))
test('difficulty defaults to normal', () => expect(addQuest([], 'Water the Plants', 5)[0].difficulty).toBe('normal'))
test('the other functions still work', () => {
  expect(totalReward(openQuests(quests))).toBe(550)
  expect(completeQuest(quests, 1)[0].done).toBe(true)
  expect(questLabel(quests[1])).toBe('[x] Fix Prod at 2am (300g)')
})`,
          hint: "function addQuest(quests: Quest[], title: string, reward: number, difficulty: Difficulty = 'normal'): Quest[] { const quest: Quest = { ..., difficulty: difficulty } ... }. totalReward returns number, questLabel returns string.",
          solution: `// 🏰 Guild Tracker, Part 3: your Part 2 code, now in TypeScript.
${P3_A}

console.log(addQuest(quests, 'Tame the Legacy Code', 900, 'hard'))
`,
        },
        {
          kind: 'code',
          lang: 'typescript',
          title: 'Your turn: filter by difficulty, pay the bonus',
          instructions: `
Two new functions:

1. \`questsByDifficulty(quests, d)\` returns only the quests whose difficulty is \`d\`.
2. \`bonusFor(d)\` uses a **switch**: \`'easy'\` → \`0\`, \`'normal'\` → \`50\`, \`'hard'\` → \`200\`.

Notice: you don't need a \`default\` case. TypeScript knows the switch covers all three options.
`,
          starter: `// 🏰 Guild Tracker, Part 3 (continued)
${P3_A}

// TODO 1: only the quests with difficulty d
function questsByDifficulty(quests: Quest[], d: Difficulty): Quest[] {
  return []
}

// TODO 2: a switch: easy → 0, normal → 50, hard → 200
function bonusFor(d: Difficulty): number {
  return 0
}

console.log(questsByDifficulty(quests, 'hard').map(questLabel))
console.log(bonusFor('hard')) // 200
`,
          tests: `test('questsByDifficulty keeps only that difficulty', () => expect(questsByDifficulty(quests, 'hard').map((q) => q.title)).toEqual(['Slay the Bug Dragon']))
test('questsByDifficulty can find new quests too', () => expect(questsByDifficulty(addQuest(quests, 'Rename a Variable', 5, 'easy'), 'easy').length).toBe(2))
test("bonusFor('easy') is 0", () => expect(bonusFor('easy')).toBe(0))
test("bonusFor('normal') is 50", () => expect(bonusFor('normal')).toBe(50))
test("bonusFor('hard') is 200", () => expect(bonusFor('hard')).toBe(200))
test('bonusFor uses a switch', () => expect(bonusFor.toString().includes('switch')).toBe(true))`,
          hint: "return quests.filter((quest) => quest.difficulty === d) · switch (d) { case 'easy': return 0; case 'normal': return 50; case 'hard': return 200 }",
          solution: `// 🏰 Guild Tracker, Part 3 (continued)
${P3_A}

${P3_B}

console.log(questsByDifficulty(quests, 'hard').map(questLabel))
console.log(bonusFor('hard')) // 200
`,
        },
        {
          kind: 'quiz',
          prompt: "A teammate adds `'legendary'` to `Difficulty` but forgets `bonusFor`. What happens?",
          code: `type Difficulty = 'easy' | 'normal' | 'hard' | 'legendary'`,
          options: [
            'Nothing, until a legendary quest pays 0 gold in production',
            'A compile error in bonusFor: not every case returns a number',
            'bonusFor returns undefined at runtime, with a warning',
            'TypeScript adds the missing case for you',
          ],
          answer: 1,
          explain:
            'TypeScript sees the switch no longer covers every option, so the function could end without returning a number: "Function lacks ending return statement". The bug is caught the moment the type changes, before any code runs.',
        },
      ],
    },
  },

  // ------------------------------------------------------------------------------------------- 4
  {
    realm: 'web',
    lesson: {
      id: 'gt-4',
      title: 'Guild Tracker 4: Load and Save over HTTP',
      project: { part: 4, adds: 'loading and saving quests over HTTP' },
      uses: ['gt-3', 'web-4', 'web-6'],
      minutes: 18,
      steps: [
        whereWeAre(
          4,
          'Your app so far: typed quests and pure functions. But the list lives in your code. Close the tab and every quest is gone.',
          'Part 4 moves the quests to a **server**. Your app asks for them with `fetch` (GET), saves new ones (POST) and marks them done (PATCH).',
        ),
        {
          kind: 'concept',
          title: 'Why a server?',
          eli5: 'Keeping quests in your code is like keeping the guild ledger **in your pocket**. A server is the **guild hall**: the ledger stays there, and everyone (your phone, your laptop, your friends) asks the hall for the latest copy.',
          body: `
The server has an API at \`/api/quests\`:

- \`GET /api/quests\` → the list
- \`POST /api/quests\` with body \`{ title, reward }\` → \`201\` and the saved quest (the **server** picks the id now)
- \`PATCH /api/quests/3\` with body \`{ done: true }\` → the updated quest

## Every call has the same shape
\`\`\`
const res = await fetch(url, options)
if (!res.ok) throw new Error(...)    // 4xx / 5xx do NOT throw by themselves!
return res.json()
\`\`\`
Your Part 3 helpers stay. \`addQuest\` retires: the server hands out ids now. And \`difficulty\` becomes optional (\`?\`), because this server doesn't store it yet.
`,
        },
        {
          kind: 'code',
          lang: 'typescript',
          title: 'Guided: load the quests',
          setup: FAKE_API,
          instructions: `
Write \`loadQuests()\`:

1. \`await fetch('/api/quests')\`
2. if \`res.ok\` is false, **throw** an Error (fetch doesn't throw on a 500 by itself!)
3. return \`res.json()\`

A pretend server is running for you, so \`fetch\` works with no internet.
`,
          starter: `// 🏰 Guild Tracker, Part 4: the quests now live on a server.
// Your types and helpers from Part 3:
${P4_HELPERS}

// NEW: GET every quest from the server.
async function loadQuests(): Promise<Quest[]> {
  // TODO 1: fetch '/api/quests'
  // TODO 2: if (!res.ok) throw an Error
  // TODO 3: return the JSON
  return []
}

loadQuests().then((list) => console.log(list.map(questLabel)))
`,
          tests: `test('loadQuests returns the quests from the server', async () => {
  const list = await loadQuests()
  expect(list.length).toBe(3)
  expect(list[0].title).toBe('Slay the Bug Dragon')
})
test('it sends GET /api/quests', async () => {
  __requests.length = 0
  await loadQuests()
  expect(__requests.length).toBe(1)
  expect(__requests[0].method).toBe('GET')
  expect(__requests[0].url).toBe('/api/quests')
})
test('it throws when the server answers with an error', async () => {
  const realFetch = fetch
  fetch = async () => __respond(500, { error: 'Something exploded' })
  let threw = false
  try {
    await loadQuests()
  } catch {
    threw = true
  }
  fetch = realFetch
  expect(threw).toBe(true)
})`,
          hint: "const res = await fetch('/api/quests') · if (!res.ok) throw new Error('Could not load quests') · return res.json()",
          solution: `// 🏰 Guild Tracker, Part 4: the quests now live on a server.
// Your types and helpers from Part 3:
${P4_HELPERS}

${P4_LOAD}

loadQuests().then((list) => console.log(list.map(questLabel)))
`,
        },
        {
          kind: 'code',
          lang: 'typescript',
          title: 'Your turn: save and complete',
          setup: FAKE_API,
          instructions: `
Two more calls. Both send JSON, so include \`headers: { 'Content-Type': 'application/json' }\` and a body made with \`JSON.stringify\`. Both throw if \`!res.ok\`, and both return the quest the server sends back.

1. \`saveQuest(title, reward)\`: **POST** \`/api/quests\` with body \`{ title, reward }\`
2. \`markDone(id)\`: **PATCH** \`/api/quests/<id>\` with body \`{ done: true }\`
`,
          starter: `// 🏰 Guild Tracker, Part 4 (continued)
${P4_HELPERS}

${P4_LOAD}

// TODO: POST /api/quests with a JSON body { title, reward }. Return the saved quest.
async function saveQuest(title: string, reward: number): Promise<Quest> {
  throw new Error('saveQuest is not written yet')
}

// TODO: PATCH /api/quests/<id> with a JSON body { done: true }. Return the updated quest.
async function markDone(id: number): Promise<Quest> {
  throw new Error('markDone is not written yet')
}
`,
          tests: `test('saveQuest sends a POST with a JSON body', async () => {
  __requests.length = 0
  await saveQuest('Review a Pull Request', 120)
  expect(__requests[0].method).toBe('POST')
  expect(__requests[0].url).toBe('/api/quests')
  expect(JSON.parse(__requests[0].body)).toEqual({ title: 'Review a Pull Request', reward: 120 })
})
test('saveQuest returns the quest the server created', async () => {
  const saved = await saveQuest('Pet the Server Cat', 5)
  expect(saved.title).toBe('Pet the Server Cat')
  expect(saved.id).toBe(5)
  expect(saved.done).toBe(false)
})
test('saveQuest throws when the server says 400', async () => {
  let threw = false
  try {
    await saveQuest('', 10)
  } catch {
    threw = true
  }
  expect(threw).toBe(true)
})
test('markDone sends PATCH /api/quests/3 with done true', async () => {
  __requests.length = 0
  const updated = await markDone(3)
  expect(__requests[0].method).toBe('PATCH')
  expect(__requests[0].url).toBe('/api/quests/3')
  expect(JSON.parse(__requests[0].body)).toEqual({ done: true })
  expect(updated.done).toBe(true)
})
test('the server now has quest 3 done', () => expect(__api.quests.find((q) => q.id === 3).done).toBe(true))
test('markDone throws for a quest that does not exist', async () => {
  let threw = false
  try {
    await markDone(99)
  } catch {
    threw = true
  }
  expect(threw).toBe(true)
})`,
          hint: "const res = await fetch('/api/quests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title, reward: reward }) }). For markDone the URL is a template literal: `/api/quests/${id}`.",
          solution: `// 🏰 Guild Tracker, Part 4 (continued)
${P4_HELPERS}

${P4_LOAD}

${P4_SAVE}
`,
        },
        {
          kind: 'quiz',
          prompt: 'The server answers `500 Internal Server Error`. What does `await fetch(url)` do?',
          options: ['It throws an error', 'It returns a response with res.ok === false', 'It returns undefined', 'It retries automatically'],
          answer: 1,
          explain:
            'fetch only throws when the request could not happen at all (offline, bad URL). Any answer from the server, even a 500, is a normal response. That is why every call checks `res.ok`.',
        },
      ],
    },
  },

  // ------------------------------------------------------------------------------------------- 5
  {
    realm: 'react',
    lesson: {
      id: 'gt-5',
      title: 'Guild Tracker 5: The Quest Board',
      project: { part: 5, adds: 'a React Quest Board' },
      uses: ['gt-4', 'react-5', 'react-6'],
      minutes: 20,
      steps: [
        whereWeAre(
          5,
          'Your app so far: typed helpers and three server calls. It all works, but only in the console. Real users need buttons.',
          'Part 5 adds a **screen**: a React Quest Board that loads the quests, shows them, completes them and adds new ones, all through your Part 4 calls.',
        ),
        {
          kind: 'concept',
          title: 'Your old code does most of the work',
          eli5: 'React is the **shop window**. Your Part 2–4 functions are the **workshop in the back**. The window just shows what the workshop made, and sends orders back when someone presses a button.',
          body: `
Look how much you already have:

- \`questLabel\` → the text of each list item
- \`totalReward(openQuests(quests))\` → the gold still to earn
- \`completeQuest\` → returns a **new** array, which is exactly what \`setQuests\` needs (React only re-renders when it gets a new array: Part 2 pays off!)
- \`loadQuests\` / \`markDone\` / \`saveQuest\` → talk to the server

## The flow when you click Complete
1. \`await markDone(id)\`: the server saves it
2. \`setQuests((qs) => completeQuest(qs, id))\`: the screen updates

The \`useEffect\` that loads the quests is already written for you (you met it in react-6).
`,
        },
        {
          kind: 'code',
          lang: 'react',
          title: 'Guided: show the board',
          setup: REACT_API,
          instructions: `
Your Part 4 code is at the top. The quests already load into state. Build the board:

1. Inside the \`<ul>\`, one \`<li>\` per quest showing \`questLabel(quest)\`
2. Quests that are **not done** also get a \`<button>Complete</button>\` inside their \`<li>\`
3. Write \`complete(id)\`: \`await markDone(id)\`, then \`setQuests((qs) => completeQuest(qs, id))\`
4. \`<p id="total">\` shows \`To earn: 550g\`: the total of the **open** quests
`,
          starter: `${P5_HEADER}

function App() {
  const [quests, setQuests] = useState<Quest[]>([])

  // When the board first appears, load the quests from the server.
  useEffect(() => {
    loadQuests().then(setQuests)
  }, [])

  // TODO 3: tell the server (markDone), then update state with completeQuest
  async function complete(id: number) {
  }

  return (
    <div>
      <h1>Quest Board</h1>
      {/* TODO 1 + 2: one <li> per quest with questLabel(quest), and a Complete button if it is not done */}
      <ul></ul>
      {/* TODO 4: the gold still to earn: totalReward of the open quests */}
      <p id="total">To earn: 0g</p>
    </div>
  )
}
`,
          tests: `test('shows one item per quest from the server', async () => {
  await tick(150)
  expect($$('li').length).toBe(3)
})
test('each item shows the quest label', () => {
  expect($$('li')[0].textContent).toContain('[ ] Slay the Bug Dragon (500g)')
  expect($$('li')[1].textContent).toContain('[x] Fix Prod at 2am (300g)')
})
test('only open quests have a Complete button', () => expect($$('li button').length).toBe(2))
test('shows the gold still to earn', () => expect(text('#total')).toBe('To earn: 550g'))
test('Complete marks the quest done', async () => {
  await click($$('li')[0].querySelector('button'))
  await tick(150)
  expect($$('li')[0].textContent).toContain('[x] Slay the Bug Dragon (500g)')
  expect(text('#total')).toBe('To earn: 50g')
})
test('Complete tells the server', () => expect(__requests.some((r) => r.method === 'PATCH' && r.url === '/api/quests/1')).toBe(true))`,
          hint: '{quests.map((quest) => (<li key={quest.id}>{questLabel(quest)} {!quest.done && <button onClick={() => complete(quest.id)}>Complete</button>}</li>))} · <p id="total">To earn: {totalReward(openQuests(quests))}g</p>',
          solution: P5_A,
        },
        {
          kind: 'code',
          lang: 'react',
          title: 'Your turn: the add form',
          setup: REACT_API,
          instructions: `
Add a \`<form>\` above the list with:

- \`<input name="title">\` and \`<input name="reward" type="number">\`, both **controlled** (value from state, \`onChange\` updates state)
- a \`<button>Add</button>\`

On submit: \`e.preventDefault()\`, ignore an empty (or spaces-only) title, \`await saveQuest(title, Number(reward))\`, add the **saved** quest to the end of the list, then clear both inputs.
`,
          starter: P5_A.replace(
            '  // When the board',
            `  // TODO: state for the two inputs (title and reward), as strings
  // TODO: an add(e) function for the form's onSubmit

  // When the board`,
          ).replace(
            '      <ul>',
            `      {/* TODO: <form onSubmit={add}> with the title input, the reward input and an Add button */}
      <ul>`,
          ),
          tests: `const addViaForm = async (title, reward) => {
  await type($('input[name=title]'), title)
  await type($('input[name=reward]'), reward)
  await click($('form button'))
  await tick(150)
}
test('the board still loads the quests', async () => {
  await tick(150)
  expect($$('li').length).toBe(3)
})
test('adding a quest shows it on the board', async () => {
  await addViaForm('Review a Pull Request', '120')
  expect($$('li').length).toBe(4)
  expect($$('li')[3].textContent).toContain('[ ] Review a Pull Request (120g)')
})
test('the new quest was saved on the server', () => expect(__requests.some((r) => r.method === 'POST' && JSON.parse(r.body).title === 'Review a Pull Request')).toBe(true))
test('both inputs are cleared after adding', () => {
  expect($('input[name=title]').value).toBe('')
  expect($('input[name=reward]').value).toBe('')
})
test('the total includes the new quest', () => expect(text('#total')).toBe('To earn: 670g'))
test('an empty title is ignored', async () => {
  await addViaForm('   ', '5')
  expect($$('li').length).toBe(4)
})`,
          hint: "const [title, setTitle] = useState('') · <input name=\"title\" value={title} onChange={(e) => setTitle(e.target.value)} /> · in add: e.preventDefault(); const clean = title.trim(); if (!clean) return; const saved = await saveQuest(clean, Number(reward) || 0); setQuests((qs) => [...qs, saved]); setTitle(''); setReward('')",
          solution: P5_B,
        },
        {
          kind: 'quiz',
          prompt: 'Why does `setQuests((qs) => completeQuest(qs, id))` work, when changing `quest.done = true` directly would not update the screen?',
          options: [
            'completeQuest is faster',
            'React compares the old and new array. completeQuest returns a NEW array, so React sees a change and re-renders',
            'React watches every object for changes automatically',
            'It only works because of useEffect',
          ],
          answer: 1,
          explain:
            'If you change the old array in place, it is still the same array, so React thinks nothing happened. Your pure functions from Part 2 always return a new array. That is why React and pure functions are best friends.',
        },
      ],
    },
  },

  // ------------------------------------------------------------------------------------------- 6
  {
    realm: 'sql',
    lesson: {
      id: 'gt-6',
      title: 'Guild Tracker 6: A Real Table',
      project: { part: 6, adds: 'a quests table in SQL' },
      uses: ['gt-5', 'sql-1', 'sql-w1'],
      minutes: 16,
      steps: [
        whereWeAre(
          6,
          'Your app so far: a React board talking to a server. But the server keeps quests in a plain array in memory. Restart it and they vanish.',
          'Part 6 gives the quests a permanent home: a **database table**, with rules that keep bad data out.',
        ),
        {
          kind: 'concept',
          title: 'From array to table',
          eli5: 'An array is a **notepad**. A table is a **form with boxes**: every row must fill in the same boxes, and the form can refuse nonsense like "reward: minus 50".',
          body: `
Your quest objects become **rows**. Each key becomes a **column**:

\`\`\`
CREATE TABLE quests (
  id INTEGER PRIMARY KEY,                       -- the database picks ids
  title TEXT NOT NULL,                          -- a quest MUST have a title
  reward INTEGER NOT NULL CHECK (reward >= 0),  -- no negative gold
  done INTEGER NOT NULL DEFAULT 0               -- 0 = open, 1 = done
);
\`\`\`
## Constraints are free bug-catchers
\`NOT NULL\` and \`CHECK\` are rules the database enforces on **every** insert and update, from any app. Even a buggy script can't sneak a negative reward in.

> SQLite has no true/false type, so \`done\` is \`0\` or \`1\`. And \`difficulty\` from Part 3? We leave it out for now. Part 8 adds it, the hard way.
`,
        },
        {
          kind: 'code',
          lang: 'sql',
          title: 'Guided: create and fill the table',
          setup: '',
          instructions: `
1. Create the \`quests\` table: \`id INTEGER PRIMARY KEY\`, \`title TEXT NOT NULL\`, \`reward INTEGER NOT NULL CHECK (reward >= 0)\`, \`done INTEGER NOT NULL DEFAULT 0\`.
2. Insert your three quests (in this order): Slay the Bug Dragon (500, open), Fix Prod at 2am (300, done), Write the Docs (50, open). Don't give ids: the database picks them.

The checker inspects your columns, the CHECK rule and the rows.
`,
          starter: `-- 🏰 Guild Tracker, Part 6: the quests from Part 5, as a table.
-- 1. CREATE TABLE quests (...)

-- 2. INSERT INTO quests (title, reward, done) VALUES ...
`,
          tests: `SELECT
  (SELECT group_concat(name || ' notnull=' || "notnull" || ' default=' || ifnull(dflt_value, '-'), ', ') FROM pragma_table_info('quests')) AS columns,
  (SELECT sql LIKE '%CHECK%reward%>=%0%' FROM sqlite_master WHERE name = 'quests') AS has_check,
  (SELECT group_concat(id || ':' || title || ':' || reward || ':' || done, ' | ') FROM (SELECT * FROM quests ORDER BY id)) AS all_rows;`,
          hint: "CREATE TABLE quests (id INTEGER PRIMARY KEY, title TEXT NOT NULL, reward INTEGER NOT NULL CHECK (reward >= 0), done INTEGER NOT NULL DEFAULT 0); INSERT INTO quests (title, reward, done) VALUES ('Slay the Bug Dragon', 500, 0), (...), (...);",
          solution: `-- 🏰 Guild Tracker, Part 6: the quests from Part 5, as a table.\n${P6_TABLE}\n`,
        },
        {
          kind: 'code',
          lang: 'sql',
          title: 'Query the board',
          setup: P6_TABLE,
          instructions: `
The table from the last step is ready. The Quest Board wants the **open** quests, biggest reward first.

Select \`title\` and \`reward\` of quests where \`done = 0\`, ordered by \`reward\` from highest to lowest.
`,
          starter: `-- open quests, biggest reward first\n`,
          tests: '',
          hint: 'SELECT title, reward FROM quests WHERE done = 0 ORDER BY reward DESC;',
          solution: `SELECT title, reward FROM quests WHERE done = 0 ORDER BY reward DESC;\n`,
        },
        {
          kind: 'code',
          lang: 'sql',
          title: 'Your turn: complete a quest, count the gold',
          setup: P6_TABLE,
          instructions: `
This is what your Complete button and your "To earn" line will do, in SQL:

1. **UPDATE** the quest titled \`'Write the Docs'\` so \`done = 1\`
2. Then select the **sum** of \`reward\` over the open quests, as a column named \`gold_to_earn\`
`,
          starter: `-- 1. mark 'Write the Docs' as done

-- 2. SELECT ... AS gold_to_earn
`,
          tests: '',
          hint: "UPDATE quests SET done = 1 WHERE title = 'Write the Docs'; SELECT SUM(reward) AS gold_to_earn FROM quests WHERE done = 0;",
          solution: `UPDATE quests SET done = 1 WHERE title = 'Write the Docs';\n\nSELECT SUM(reward) AS gold_to_earn FROM quests WHERE done = 0;\n`,
        },
        {
          kind: 'quiz',
          prompt: "What happens when some code runs `INSERT INTO quests (title, reward) VALUES ('Cheat', -100)`?",
          options: ['It works and the guild loses 100 gold', 'The database refuses it: CHECK constraint failed', 'reward is set to 0', 'It inserts NULL'],
          answer: 1,
          explain:
            'The CHECK rule runs on every insert and update, no matter which app or script sends it. Rules in the database protect the data even from code you did not write.',
        },
      ],
    },
  },

  // ------------------------------------------------------------------------------------------- 7
  {
    realm: 'alembic',
    after: 'py-sql',
    lesson: {
      id: 'gt-7',
      title: 'Guild Tracker 7: A Python Data Layer',
      project: { part: 7, adds: 'a Python data layer with sqlite3' },
      uses: ['gt-6', 'py-sql'],
      minutes: 16,
      steps: [
        whereWeAre(
          7,
          'Your app so far: a React board, server calls, and a real table. But nothing connects the server to the table yet.',
          'Part 7 adds the **data layer**: Python functions that run your SQL with sqlite3. The server will call these instead of touching an array.',
        ),
        {
          kind: 'concept',
          title: 'Three functions between the API and the table',
          eli5: 'The data layer is the **librarian**. The API never walks into the stacks itself. It asks "list the open quests" or "add this one", and the librarian knows exactly where to look.',
          body: `
Each function takes a connection \`conn\` and runs one SQL statement:

- \`list_quests(conn, done=None)\` → a list of dicts (optionally only open or only done)
- \`add_quest(conn, title, reward)\` → the new quest as a dict
- \`complete_quest(conn, quest_id)\` → \`True\` if a row changed, \`False\` if no such quest (so the API can say 404)

## Always use ? parameters
\`\`\`
conn.execute("INSERT INTO quests (title, reward) VALUES (?, ?)", (title, reward))
\`\`\`
Never build SQL with f-strings. A title like \`Fix Bob's bug\` would break the quotes, and a nasty one could run its own SQL (that's **SQL injection**).
`,
        },
        {
          kind: 'code',
          lang: 'python',
          title: 'Guided: list the quests',
          instructions: `
Write \`list_quests(conn, done=None)\`:

1. With no \`done\`: \`SELECT id, title, reward, done FROM quests ORDER BY id\`
2. With \`done=True\` or \`done=False\`: add \`WHERE done = ?\` and pass \`(int(done),)\` as the parameters (\`int(True)\` is \`1\`)
3. Return \`[row_to_quest(row) for row in rows]\`
`,
          starter: `# 🏰 Guild Tracker, Part 7: the data layer, in Python.
${PY_DB}


${PY_ROW}


def list_quests(conn, done=None):
    # TODO 1: SELECT id, title, reward, done FROM quests ORDER BY id
    # TODO 2: if done is not None, only rows WHERE done = ? (parameters: (int(done),))
    # TODO 3: return a list of dicts using row_to_quest
    return []


conn = make_db()
print(list_quests(conn))
`,
          tests: `# test: lists every quest
conn = make_db()
assert len(list_quests(conn)) == 3, list_quests(conn)
# test: each quest is a dict with a real bool for done
assert list_quests(conn)[1] == {"id": 2, "title": "Fix Prod at 2am", "reward": 300, "done": True}, list_quests(conn)[1]
# test: done=False gives only open quests
assert [q["id"] for q in list_quests(conn, done=False)] == [1, 3]
# test: done=True gives only finished quests
assert [q["id"] for q in list_quests(conn, done=True)] == [2]`,
          hint: 'rows = conn.execute("SELECT id, title, reward, done FROM quests WHERE done = ? ORDER BY id", (int(done),)).fetchall() · return [row_to_quest(row) for row in rows]',
          solution: `# 🏰 Guild Tracker, Part 7: the data layer, in Python.
${PY_DB}


${PY_ROW}


${PY_LIST}


conn = make_db()
print(list_quests(conn))
`,
        },
        {
          kind: 'code',
          lang: 'python',
          title: 'Your turn: add and complete',
          instructions: `
1. \`add_quest(conn, title, reward)\`: INSERT with \`?\` placeholders, \`conn.commit()\`, and return \`{"id": ..., "title": ..., "reward": ..., "done": False}\`. The new id is \`cur.lastrowid\` (where \`cur\` is what \`conn.execute\` returned).
2. \`complete_quest(conn, quest_id)\`: \`UPDATE quests SET done = 1 WHERE id = ?\`, commit, and return \`True\` if a row changed (\`cur.rowcount == 1\`), else \`False\`.

Your CHECK rule from Part 6 still guards the table: a negative reward raises \`sqlite3.IntegrityError\`.
`,
          starter: `# 🏰 Guild Tracker, Part 7 (continued)
${PY_DB}


${PY_ROW}


${PY_LIST}


def add_quest(conn, title, reward):
    # TODO: INSERT with ? placeholders (never put title straight into the SQL text!)
    # then conn.commit() and return the new quest as a dict (cur.lastrowid is its id)
    return None


def complete_quest(conn, quest_id):
    # TODO: UPDATE quests SET done = 1 WHERE id = ?
    # then conn.commit() and return True if a row changed (cur.rowcount == 1), else False
    return False


conn = make_db()
print(add_quest(conn, "Fix Bob's bug", 75))
`,
          tests: `# test: add_quest returns the new quest
conn = make_db()
new = add_quest(conn, "Review a Pull Request", 120)
assert new == {"id": 4, "title": "Review a Pull Request", "reward": 120, "done": False}, new
# test: the new quest is saved in the table
assert list_quests(conn)[-1]["title"] == "Review a Pull Request"
# test: titles with quotes work
add_quest(conn, "Fix Bob's bug", 75)
assert list_quests(conn)[-1]["title"] == "Fix Bob's bug"
# test: a negative reward is refused by the CHECK rule
try:
    add_quest(conn, "Cheat", -100)
    assert False, "expected sqlite3.IntegrityError"
except sqlite3.IntegrityError:
    pass
# test: complete_quest marks it done and returns True
assert complete_quest(conn, 1) is True
assert list_quests(conn)[0]["done"] is True
# test: complete_quest returns False for a missing quest
assert complete_quest(conn, 99) is False`,
          hint: 'cur = conn.execute("INSERT INTO quests (title, reward) VALUES (?, ?)", (title, reward)) · conn.commit() · return {"id": cur.lastrowid, ...}. For complete: cur = conn.execute("UPDATE quests SET done = 1 WHERE id = ?", (quest_id,)) · return cur.rowcount == 1',
          solution: `# 🏰 Guild Tracker, Part 7 (continued)
${PY_DB}


${PY_ROW}


${PY_LIST}


${PY_WRITE}


conn = make_db()
print(add_quest(conn, "Fix Bob's bug", 75))
`,
        },
        {
          kind: 'quiz',
          prompt: 'Why does `complete_quest` return True or False instead of nothing?',
          options: [
            'Python functions must return something',
            'So the API can tell "done" apart from "no such quest" and answer 200 or 404',
            'It makes the UPDATE faster',
            'sqlite3 requires it',
          ],
          answer: 1,
          explain:
            'An UPDATE that matches no rows is not an error in SQL. It just changes 0 rows. Returning `rowcount == 1` passes that fact up, so in Part 9 the HTTP layer can answer 404 Not Found.',
        },
      ],
    },
  },

  // ------------------------------------------------------------------------------------------- 8
  {
    realm: 'alembic',
    lesson: {
      id: 'gt-8',
      title: 'Guild Tracker 8: Your First Migration',
      project: { part: 8, adds: 'a migration that adds difficulty' },
      uses: ['gt-7', 'alembic-3', 'alembic-4'],
      minutes: 18,
      steps: [
        whereWeAre(
          8,
          'Your app so far: React board, server calls, a quests table and a Python data layer. People are using it. The table is full of real quests.',
          "Part 8 brings back **difficulty** from Part 3, this time in the database. You can't throw the table away, so you write a **migration**.",
        ),
        {
          kind: 'concept',
          title: 'Now you feel why Alembic exists',
          eli5: "Your table is a **house people live in**. You want to add a room. You can't knock the house down and rebuild it while everyone is inside. A migration is the **renovation plan**: add the room carefully, and know how to take it back out.",
          body: `
In Part 6 you wrote \`CREATE TABLE\`. Easy, because the table was empty. Now it has real quests. Running \`DROP TABLE\` + \`CREATE TABLE\` again would **delete every quest**.

So you write a revision with two halves:

\`\`\`
def upgrade(conn):     # forwards: add the column
def downgrade(conn):   # backwards: remove it again
\`\`\`
## Two traps
- A new \`NOT NULL\` column needs a **DEFAULT**, or the existing rows have no value and it fails
- The \`alembic_version\` table remembers which revision the database is at. Real Alembic updates it for you. Today **you are Alembic**, so you update it yourself.
`,
        },
        {
          kind: 'code',
          lang: 'python',
          title: 'Guided: write upgrade and downgrade',
          instructions: `
The database is at \`a1_create_quests\` and has 3 quests.

1. \`upgrade(conn)\`: \`ALTER TABLE quests ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'normal'\`, then set \`alembic_version.version_num\` to \`revision\`
2. \`downgrade(conn)\`: \`ALTER TABLE quests DROP COLUMN difficulty\`, then set the version back to \`down_revision\`

Commit at the end of each. The checker looks at the columns with \`PRAGMA table_info(quests)\` after each step.
`,
          starter: `# 🏰 Guild Tracker, Part 8: a migration.
${PY_DB_V1}


# Your data layer from Part 7 (add_quest and complete_quest are unchanged, hidden to keep this short)
${PY_ROW}


${PY_LIST}


# ---- migrations/versions/b2_add_difficulty.py ----
revision = "b2_add_difficulty"
down_revision = "a1_create_quests"


def upgrade(conn):
    # TODO 1: add a difficulty column: TEXT, NOT NULL, DEFAULT 'normal'
    # TODO 2: UPDATE alembic_version SET version_num = ?  (parameter: revision)
    pass


def downgrade(conn):
    # TODO 1: drop the difficulty column
    # TODO 2: put alembic_version back to down_revision
    pass


conn = make_db()
upgrade(conn)
print([row[1] for row in conn.execute("PRAGMA table_info(quests)")])
`,
          tests: `# test: upgrade adds a difficulty column
conn = make_db()
upgrade(conn)
cols = [row[1] for row in conn.execute("PRAGMA table_info(quests)")]
assert "difficulty" in cols, cols
# test: the column is NOT NULL with default 'normal'
info = {row[1]: row for row in conn.execute("PRAGMA table_info(quests)")}
assert info["difficulty"][3] == 1, "difficulty should be NOT NULL"
assert info["difficulty"][4] == "'normal'", info["difficulty"][4]
# test: existing quests got 'normal'
assert [r[0] for r in conn.execute("SELECT difficulty FROM quests ORDER BY id")] == ["normal"] * 3
# test: no quests were lost
assert len(list_quests(conn)) == 3
# test: alembic_version moved to b2_add_difficulty
assert conn.execute("SELECT version_num FROM alembic_version").fetchone()[0] == "b2_add_difficulty"
# test: downgrade removes the column again
downgrade(conn)
cols = [row[1] for row in conn.execute("PRAGMA table_info(quests)")]
assert cols == ["id", "title", "reward", "done"], cols
# test: downgrade puts alembic_version back
assert conn.execute("SELECT version_num FROM alembic_version").fetchone()[0] == "a1_create_quests"
# test: the quests survive the round trip
assert [q["title"] for q in list_quests(conn)] == ["Slay the Bug Dragon", "Fix Prod at 2am", "Write the Docs"]`,
          hint: 'conn.execute("ALTER TABLE quests ADD COLUMN difficulty TEXT NOT NULL DEFAULT \'normal\'") · conn.execute("UPDATE alembic_version SET version_num = ?", (revision,)) · conn.commit(). Downgrade: "ALTER TABLE quests DROP COLUMN difficulty".',
          solution: `# 🏰 Guild Tracker, Part 8: a migration.
${PY_DB_V1}


# Your data layer from Part 7 (add_quest and complete_quest are unchanged, hidden to keep this short)
${PY_ROW}


${PY_LIST}


${PY_MIGRATION}


conn = make_db()
upgrade(conn)
print([row[1] for row in conn.execute("PRAGMA table_info(quests)")])
`,
        },
        {
          kind: 'code',
          lang: 'python',
          title: 'Your turn: use the new column',
          instructions: `
The column exists after \`upgrade\`. Now the app code must use it:

1. \`row_to_quest\` gets 5 values per row and adds \`"difficulty"\` to the dict
2. \`list_quests\` selects \`difficulty\` too
3. \`add_quest(conn, title, reward, difficulty="normal")\` inserts it and returns it in the dict

Migration first, code second: that's the order on every real deploy.
`,
          starter: `# 🏰 Guild Tracker, Part 8 (continued)
${PY_DB_V1}


# TODO 1: rows now have 5 values: id, title, reward, done, difficulty
${PY_ROW}


# TODO 2: select difficulty too
${PY_LIST}


# TODO 3: take a difficulty (default "normal"), insert it and return it
def add_quest(conn, title, reward):
    cur = conn.execute("INSERT INTO quests (title, reward) VALUES (?, ?)", (title, reward))
    conn.commit()
    return {"id": cur.lastrowid, "title": title, "reward": reward, "done": False}


${PY_MIGRATION}


conn = make_db()
upgrade(conn)
print(list_quests(conn))
`,
          tests: `# test: list_quests includes difficulty
conn = make_db()
upgrade(conn)
assert list_quests(conn)[0] == {"id": 1, "title": "Slay the Bug Dragon", "reward": 500, "done": False, "difficulty": "normal"}, list_quests(conn)[0]
# test: add_quest can set a difficulty
q = add_quest(conn, "Tame the Legacy Code", 900, "hard")
assert q == {"id": 4, "title": "Tame the Legacy Code", "reward": 900, "done": False, "difficulty": "hard"}, q
assert list_quests(conn)[-1]["difficulty"] == "hard"
# test: difficulty defaults to normal
add_quest(conn, "Water the Plants", 5)
assert list_quests(conn)[-1]["difficulty"] == "normal"
# test: filtering by done still works
assert [q["id"] for q in list_quests(conn, done=True)] == [2]`,
          hint: 'quest_id, title, reward, done, difficulty = row · "SELECT id, title, reward, done, difficulty FROM quests ..." · def add_quest(conn, title, reward, difficulty="normal"): ... VALUES (?, ?, ?)", (title, reward, difficulty)',
          solution: `# 🏰 Guild Tracker, Part 8 (continued)
${PY_DB_V1}


def row_to_quest(row):
    # SQLite has no true/false: done comes back as 0 or 1. Turn it into a real bool.
    quest_id, title, reward, done, difficulty = row
    return {"id": quest_id, "title": title, "reward": reward, "done": bool(done), "difficulty": difficulty}


def list_quests(conn, done=None):
    if done is None:
        rows = conn.execute("SELECT id, title, reward, done, difficulty FROM quests ORDER BY id").fetchall()
    else:
        rows = conn.execute(
            "SELECT id, title, reward, done, difficulty FROM quests WHERE done = ? ORDER BY id", (int(done),)
        ).fetchall()
    return [row_to_quest(row) for row in rows]


def add_quest(conn, title, reward, difficulty="normal"):
    cur = conn.execute(
        "INSERT INTO quests (title, reward, difficulty) VALUES (?, ?, ?)", (title, reward, difficulty)
    )
    conn.commit()
    return {"id": cur.lastrowid, "title": title, "reward": reward, "done": False, "difficulty": difficulty}


${PY_MIGRATION}


conn = make_db()
upgrade(conn)
print(list_quests(conn))
`,
        },
        {
          kind: 'quiz',
          prompt: "Why did the column need `DEFAULT 'normal'`?",
          options: [
            "SQLite doesn't allow columns without defaults",
            'The table already has rows. A NOT NULL column with no default leaves them with no value, so the ALTER fails',
            'To make the query faster',
            'Alembic requires every column to have a default',
          ],
          answer: 1,
          explain:
            'Existing rows need *some* value for a NOT NULL column. The default fills them all in one go. On a huge production table, teams often add the column as nullable, backfill in batches, then add NOT NULL in a later migration.',
        },
        {
          kind: 'explain',
          prompt: 'Explain to a new teammate why we wrote a migration instead of just editing the CREATE TABLE from Part 6.',
          keyPoints: [
            'The production table already has real data that must not be lost',
            'CREATE TABLE only runs on an empty database; existing databases need ALTER TABLE',
            'A migration is a small, ordered, repeatable change that every copy of the database (dev, test, prod) runs the same way',
            'downgrade lets you undo it if a deploy goes wrong',
            'alembic_version records which migrations a database has already run',
          ],
        },
      ],
    },
  },

  // ------------------------------------------------------------------------------------------- 9
  {
    realm: 'servers',
    lesson: {
      id: 'gt-9',
      title: 'Guild Tracker 9: The HTTP API',
      project: { part: 9, adds: 'HTTP routes with auth' },
      uses: ['gt-8', 'srv-2', 'srv-3'],
      minutes: 18,
      steps: [
        whereWeAre(
          9,
          'Your app so far: a React board calling a **pretend** server, plus a real table and data layer. The two halves have never met.',
          'Part 9 builds the **real API**: `handle(req)` turns HTTP requests into data-layer calls, with a 401 guard on writes.',
        ),
        {
          kind: 'concept',
          title: 'The API is a translator',
          eli5: 'The API is the **front desk** of the guild hall. Visitors speak HTTP ("GET /quests/2"). The desk translates that into a job for the librarian (your data layer), then hands back an answer with a status code.',
          body: `
Your Part 4 \`fetch\` calls already expect these routes. Now you write the other side:

- \`GET /quests\` → \`200\` and the list
- \`GET /quests/2\` → \`200\` and one quest, or \`404\`
- \`POST /quests\` → \`201\` and the new quest, \`400\` with no title, \`401\` with no login

## Request in, response out
\`\`\`
handle({ method: 'GET', path: '/quests/2', headers: {}, body: undefined })
// → { status: 200, body: { id: 2, title: 'Fix Prod at 2am', ... } }
\`\`\`
You'll reuse two ideas from this realm: \`matchRoute\` (srv-2) to read \`:id\`, and a **middleware wrapper** (srv-3) for auth.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Guided: the read routes',
          instructions: `
Write \`handle(req)\` for the two read routes:

1. \`GET /quests\` → \`{ status: 200, body: listQuests() }\`
2. \`GET /quests/:id\` → use \`matchRoute('/quests/:id', req.path)\`. The id comes back as a **string**, so use \`Number(params.id)\`. Found → \`200\` and the quest. Not found → \`404\` with body \`{ error: 'Quest not found' }\`
3. Anything else → \`404\` with \`{ error: 'Not found' }\`
`,
          starter: `// 🏰 Guild Tracker, Part 9: the HTTP API.
${P9_DATA}

// TODO: answer each request with { status, body }
//   GET /quests      → 200, every quest
//   GET /quests/:id  → 200 and the quest, or 404 { error: 'Quest not found' }
//   anything else    → 404 { error: 'Not found' }
function handle(req) {
  return { status: 404, body: { error: 'Not found' } }
}

console.log(handle({ method: 'GET', path: '/quests/2', headers: {} }))
`,
          tests: `test('GET /quests lists every quest', () => {
  const res = handle({ method: 'GET', path: '/quests', headers: {} })
  expect(res.status).toBe(200)
  expect(res.body.length).toBe(3)
})
test('GET /quests/2 returns one quest', () => {
  const res = handle({ method: 'GET', path: '/quests/2', headers: {} })
  expect(res.status).toBe(200)
  expect(res.body.title).toBe('Fix Prod at 2am')
})
test('GET /quests/99 is a 404', () => {
  const res = handle({ method: 'GET', path: '/quests/99', headers: {} })
  expect(res.status).toBe(404)
  expect(res.body).toEqual({ error: 'Quest not found' })
})
test('an unknown path is a 404', () => expect(handle({ method: 'GET', path: '/dragons', headers: {} }).status).toBe(404))
test('the wrong method is a 404 too', () => expect(handle({ method: 'DELETE', path: '/quests/1', headers: {} }).status).toBe(404))`,
          hint: "if (req.method === 'GET' && req.path === '/quests') return { status: 200, body: listQuests() } · const params = matchRoute('/quests/:id', req.path) · if (req.method === 'GET' && params) { const quest = getQuest(Number(params.id)); ... }",
          solution: `// 🏰 Guild Tracker, Part 9: the HTTP API.
${P9_DATA}

${P9_A_HANDLE}

console.log(handle({ method: 'GET', path: '/quests/2', headers: {} }))
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your turn: POST with an auth guard',
          instructions: `
Only logged-in heroes may create quests.

1. \`withAuth(handler)\` returns a **new** function \`(req) => ...\`: if \`req.headers.authorization\` is not \`'Bearer letmein'\`, answer \`401\` with \`{ error: 'Not logged in' }\`. Otherwise return \`handler(req)\`.
2. \`createQuest\`: no \`req.body\` or no \`req.body.title\` → \`400\` with \`{ error: 'title is required' }\`. Otherwise \`201\` with \`addQuest(req.body.title, req.body.reward || 0)\`.
3. In \`handle\`, send \`POST /quests\` to \`createQuest\`.
`,
          starter: `// 🏰 Guild Tracker, Part 9 (continued)
${P9_DATA}

// TODO 1: return a NEW handler: 401 { error: 'Not logged in' } unless the token is right
function withAuth(handler) {
  return handler
}

// TODO 2: 400 { error: 'title is required' } without a title, else 201 with the new quest
const createQuest = withAuth((req) => {
  return { status: 500, body: { error: 'Not written yet' } }
})

// TODO 3: send POST /quests to createQuest
${P9_A_HANDLE}

console.log(handle({ method: 'POST', path: '/quests', headers: {}, body: { title: 'Sneaky', reward: 1 } }))
`,
          tests: `const auth = { authorization: 'Bearer letmein' }
test('POST /quests without a token is 401', () => {
  const res = handle({ method: 'POST', path: '/quests', headers: {}, body: { title: 'Sneaky', reward: 1 } })
  expect(res.status).toBe(401)
  expect(res.body).toEqual({ error: 'Not logged in' })
})
test('a wrong token is 401 too', () => expect(handle({ method: 'POST', path: '/quests', headers: { authorization: 'Bearer guess' }, body: { title: 'Sneaky' } }).status).toBe(401))
test('POST /quests without a title is 400', () => {
  const res = handle({ method: 'POST', path: '/quests', headers: auth, body: { reward: 5 } })
  expect(res.status).toBe(400)
  expect(res.body).toEqual({ error: 'title is required' })
})
test('POST /quests creates a quest with 201', () => {
  const res = handle({ method: 'POST', path: '/quests', headers: auth, body: { title: 'Review a Pull Request', reward: 120 } })
  expect(res.status).toBe(201)
  expect(res.body).toEqual({ id: 4, title: 'Review a Pull Request', reward: 120, done: false, difficulty: 'normal' })
})
test('the new quest shows up in GET /quests', () => expect(handle({ method: 'GET', path: '/quests', headers: {} }).body.length).toBe(4))
test('withAuth works on any handler', () => {
  const secret = withAuth(() => ({ status: 200, body: 'treasure' }))
  expect(secret({ headers: {} }).status).toBe(401)
  expect(secret({ headers: auth }).body).toBe('treasure')
})`,
          hint: "withAuth: return (req) => { if (req.headers.authorization !== 'Bearer letmein') return { status: 401, body: { error: 'Not logged in' } }; return handler(req) }. In handle: if (req.method === 'POST' && req.path === '/quests') return createQuest(req)",
          solution: `// 🏰 Guild Tracker, Part 9 (continued)
${P9_CODE}

console.log(handle({ method: 'POST', path: '/quests', headers: {}, body: { title: 'Sneaky', reward: 1 } }))
`,
        },
        {
          kind: 'quiz',
          prompt: 'Why wrap `createQuest` in `withAuth` instead of checking the token inside it?',
          options: [
            'It runs faster',
            'The same guard can wrap every route that needs a login, and it runs before any handler code',
            'JavaScript requires it',
            'So GET requests also need a token',
          ],
          answer: 1,
          explain:
            'Middleware keeps one concern in one place. Tomorrow you add PATCH and DELETE routes: wrap them in withAuth and they are protected, with no copy-pasted token checks to forget.',
        },
      ],
    },
  },

  // ------------------------------------------------------------------------------------------ 10
  {
    realm: 'aws',
    lesson: {
      id: 'gt-10',
      title: 'Guild Tracker 10: Deploy as a Lambda',
      project: { part: 10, adds: 'a Lambda handler for the API' },
      uses: ['gt-9', 'aws-3'],
      minutes: 15,
      steps: [
        whereWeAre(
          10,
          'Your app so far: a React board, an HTTP API with auth, a data layer and a table. All of it runs only on your laptop.',
          'Part 10 puts the API **in the cloud** as an AWS Lambda. A thin `handler(event)` wraps your Part 9 `handle(req)`.',
        ),
        {
          kind: 'concept',
          title: 'An adapter, not a rewrite',
          eli5: "Your API speaks one plug shape. AWS sockets are a different shape. You don't rebuild the lamp, you buy a **travel adapter**. `handler` is that adapter.",
          body: `
API Gateway calls your Lambda with an **event** that looks a bit different from your \`req\`:

\`\`\`
event = { httpMethod: 'POST', path: '/quests',
          headers: { authorization: 'Bearer letmein' },
          body: '{"title":"Review a Pull Request","reward":120}' }   // a STRING
\`\`\`
And it wants a different answer shape back:

\`\`\`
{ statusCode: 201, headers: { 'Content-Type': 'application/json' }, body: '{"id":4,...}' }
\`\`\`
So \`handler\` does three things: event → \`req\`, call \`handle(req)\`, \`{ status, body }\` → Lambda answer. Your Part 9 code doesn't change at all. That's the win: the same logic can run on a laptop, in a container, or in Lambda.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Guided: event in, response out',
          instructions: `
Your whole Part 9 API is at the top. Write \`handler(event)\`:

1. Build \`req\`: \`method\` from \`event.httpMethod\`, \`path\` from \`event.path\`, \`headers\` from \`event.headers\`, and \`body\` = \`JSON.parse(event.body)\` when there is a body (GET requests have \`body: null\`)
2. \`const res = handle(req)\`
3. Return \`json(res.status, res.body)\` (the helper is written for you)
`,
          starter: `// 🏰 Guild Tracker, Part 10: run your API on AWS Lambda.
// Your Part 9 API, unchanged:
${P9_CODE}

// ---- NEW: the Lambda adapter ----
${P10_JSON}

async function handler(event) {
  // TODO 1: event → req { method, path, headers, body } (body: parse the JSON string, if there is one)
  // TODO 2: const res = handle(req)
  // TODO 3: return json(res.status, res.body)
  return json(500, { error: 'Not written yet' })
}

handler({ httpMethod: 'GET', path: '/quests/1', headers: {}, body: null }).then(console.log)
`,
          tests: `test('GET /quests comes back as a Lambda response', async () => {
  const r = await handler({ httpMethod: 'GET', path: '/quests', headers: {}, body: null })
  expect(r.statusCode).toBe(200)
  expect(r.headers['Content-Type']).toBe('application/json')
  expect(JSON.parse(r.body).length).toBe(3)
})
test('the body is a string', async () => expect(typeof (await handler({ httpMethod: 'GET', path: '/quests/1', headers: {}, body: null })).body).toBe('string'))
test('a missing quest is still a 404', async () => expect((await handler({ httpMethod: 'GET', path: '/quests/99', headers: {}, body: null })).statusCode).toBe(404))
test('POST with a JSON body creates a quest', async () => {
  const r = await handler({ httpMethod: 'POST', path: '/quests', headers: { authorization: 'Bearer letmein' }, body: JSON.stringify({ title: 'Deploy on a Tuesday', reward: 80 }) })
  expect(r.statusCode).toBe(201)
  expect(JSON.parse(r.body).title).toBe('Deploy on a Tuesday')
})`,
          hint: 'const req = { method: event.httpMethod, path: event.path, headers: event.headers, body: event.body ? JSON.parse(event.body) : undefined } · const res = handle(req) · return json(res.status, res.body)',
          solution: `// 🏰 Guild Tracker, Part 10: run your API on AWS Lambda.
// Your Part 9 API, unchanged:
${P9_CODE}

// ---- NEW: the Lambda adapter ----
${P10_JSON}

${P10_A}

handler({ httpMethod: 'GET', path: '/quests/1', headers: {}, body: null }).then(console.log)
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your turn: survive the real internet',
          instructions: `
Real traffic is messy. Make \`handler\` tougher:

1. A body that isn't valid JSON (\`'{oops'\`) must answer \`400\` with \`{ error: 'Body must be valid JSON' }\`, not crash. Use \`try { ... } catch { ... }\`.
2. Header names can arrive as \`Authorization\` or \`authorization\`. Copy them into a new object with **lowercase** names before calling \`handle\`. If \`event.headers\` is \`null\`, use an empty object.
`,
          starter: `// 🏰 Guild Tracker, Part 10 (continued)
${P9_CODE}

${P10_JSON}

// TODO 1: lowercase every header name (event.headers may be null)
// TODO 2: invalid JSON body → 400 { error: 'Body must be valid JSON' }
${P10_A}
`,
          tests: `test('a body that is not JSON gets a 400', async () => {
  const r = await handler({ httpMethod: 'POST', path: '/quests', headers: { authorization: 'Bearer letmein' }, body: '{oops' })
  expect(r.statusCode).toBe(400)
  expect(JSON.parse(r.body)).toEqual({ error: 'Body must be valid JSON' })
})
test('header names work in any case', async () => {
  const r = await handler({ httpMethod: 'POST', path: '/quests', headers: { Authorization: 'Bearer letmein' }, body: JSON.stringify({ title: 'Rotate the Keys', reward: 60 }) })
  expect(r.statusCode).toBe(201)
})
test('a missing headers object does not crash', async () => expect((await handler({ httpMethod: 'GET', path: '/quests', headers: null, body: null })).statusCode).toBe(200))
test('no token is still a 401', async () => expect((await handler({ httpMethod: 'POST', path: '/quests', headers: {}, body: JSON.stringify({ title: 'Sneaky' }) })).statusCode).toBe(401))`,
          hint: "const headers = {}; for (const name in event.headers || {}) { headers[name.toLowerCase()] = event.headers[name] } · let body; if (event.body) { try { body = JSON.parse(event.body) } catch { return json(400, { error: 'Body must be valid JSON' }) } }",
          solution: `// 🏰 Guild Tracker, Part 10 (continued)
${P9_CODE}

${P10_JSON}

${P10_B}
`,
        },
        {
          kind: 'quiz',
          prompt: 'A quest list request after 20 idle minutes takes 900ms. The next one takes 40ms. Why?',
          options: [
            'The database was asleep',
            'A cold start: AWS had to spin up a fresh Lambda container for the first request',
            'The cache was full',
            'API Gateway was rate limiting',
          ],
          answer: 1,
          explain:
            'After being idle, the first call starts a new container and loads your code. Warm calls reuse it. Small bundles and setting things up outside the handler keep cold starts short.',
        },
      ],
    },
  },

  // ------------------------------------------------------------------------------------------ 11
  {
    realm: 'ai',
    lesson: {
      id: 'gt-11',
      title: 'Guild Tracker 11: Search My Quests',
      project: { part: 11, adds: 'quest search and a RAG prompt' },
      uses: ['gt-10', 'ai-2', 'ai-3'],
      minutes: 18,
      steps: [
        whereWeAre(
          11,
          "Your app so far: a React board and a full API on Lambda, backed by a real table. Heroes now have dozens of quests and can't find anything.",
          'Part 11 adds **AI search**: turn quest titles into vectors, find the closest ones to a question, and hand them to an LLM in a RAG prompt.',
        ),
        {
          kind: 'concept',
          title: 'Search by meaning (well, almost)',
          eli5: 'Each quest becomes a **dot on a map**. A question becomes a dot too. "Search" means: find the dots closest to the question dot.',
          body: `
Real apps use an embedding model for the vectors. To see the machine work, you'll build the simplest embedding there is, **bag of words**:

\`\`\`
vocab:                  [fix, the, login, bug, ...]
'Fix the login bug'  →  [ 1,   1,    1,   1,  ...]
'login bug'          →  [ 0,   0,    1,   1,  ...]
\`\`\`
Then \`cosine\` (from ai-2) says how close two vectors are, and you keep the top k.

## Then RAG
The top quests go into a prompt: "Answer using only these quests". The LLM answers from **your** data, not from its memory. That's ai-3, applied to your app.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Guided: embed, compare, rank',
          instructions: `
\`words(text)\` and \`buildVocab(quests)\` are written for you.

1. \`embed(text, vocab)\`: one number per vocab word, how many times it appears in \`words(text)\`
2. \`cosine(a, b)\`: like ai-2, but return \`0\` if either vector is all zeros (otherwise you'd divide by 0)
3. \`searchQuests(quests, query, k)\`: build the vocab, embed the query and each title, sort by cosine (highest first), return the top \`k\` **titles**
`,
          starter: `// 🏰 Guild Tracker, Part 11: "Search my quests".
${P11_DATA}

// TODO 1: one number per vocab word: how many times it appears in the text
function embed(text, vocab) {
  return []
}

// TODO 2: cosine similarity (ai-2). Return 0 if either vector is all zeros.
function cosine(a, b) {
  return 0
}

// TODO 3: titles of the k quests most similar to the query, best first
function searchQuests(quests, query, k) {
  return []
}

console.log(searchQuests(listQuests(), 'login bug', 3))
`,
          tests: `const vocabSample = ['fix', 'the', 'login', 'bug']
test('embed counts each vocab word', () => expect(embed('Fix the bug, the BUG!', vocabSample)).toEqual([1, 2, 0, 2]))
test('words not in the vocab are ignored', () => expect(embed('dragon', vocabSample)).toEqual([0, 0, 0, 0]))
test('cosine of the same direction is 1', () => expect(Math.round(cosine([1, 2], [2, 4]) * 1000)).toBe(1000))
test('cosine with an all-zero vector is 0', () => expect(cosine([0, 0], [1, 1])).toBe(0))
test('searchQuests finds the login bug first', () => expect(searchQuests(listQuests(), 'login bug', 1)).toEqual(['Fix the login bug']))
test('searchQuests returns k titles, best first', () => expect(searchQuests(listQuests(), 'login bug', 3)).toEqual(['Fix the login bug', 'Slay the Bug Dragon', 'Write tests for the login page']))`,
          hint: 'embed: const ws = words(text); return vocab.map((v) => ws.filter((w) => w === v).length). searchQuests: map each quest to { title, score: cosine(q, embed(quest.title, vocab)) }, sort((a, b) => b.score - a.score), slice(0, k), map to title.',
          solution: `// 🏰 Guild Tracker, Part 11: "Search my quests".
${P11_DATA}

${P11_A}

console.log(searchQuests(listQuests(), 'login bug', 3))
`,
        },
        {
          kind: 'quiz',
          prompt: "Searching 'login bug' ranks **Slay the Bug Dragon** above **Write tests for the login page**. Why?",
          options: [
            'cosine is broken',
            'Bag of words only counts matching words. "bug" matches, and the shorter title wins. It has no idea dragons are not software',
            'The dragon quest has a bigger reward',
            'Titles are sorted alphabetically',
          ],
          answer: 1,
          explain:
            'Counting words is not understanding. A real embedding model knows "login page" is closer to "login bug" than a dragon is. Same math (vectors + cosine), much better vectors.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your turn: the RAG prompt',
          instructions: `
1. \`buildPrompt(question, hits)\` (\`hits\` = titles) returns exactly:
\`\`\`
Answer using only the quests below. If the answer is not there, say "I do not know".

[1] first title
[2] second title

Question: <question>
\`\`\`
2. \`askGuild(question)\` = \`buildPrompt\` of the question and the top **3** results of \`searchQuests(listQuests(), question, 3)\`.

This string is what you'd send to the LLM.
`,
          starter: `// 🏰 Guild Tracker, Part 11 (continued)
${P11_DATA}

${P11_A}

// TODO 1: the prompt, with numbered sources
function buildPrompt(question, hits) {
  return ''
}

// TODO 2: search, then build the prompt from the top 3
function askGuild(question) {
  return ''
}

console.log(askGuild('login bug'))
`,
          tests: `test('buildPrompt matches the format exactly', () => expect(buildPrompt('Q?', ['A', 'B'])).toBe('Answer using only the quests below. If the answer is not there, say "I do not know".\\n\\n[1] A\\n[2] B\\n\\nQuestion: Q?'))
test('askGuild puts the top 3 quests in the prompt', () => {
  const p = askGuild('login bug')
  expect(p).toContain('[1] Fix the login bug')
  expect(p).toContain('[3] Write tests for the login page')
  expect(p.includes('[4]')).toBe(false)
})
test('askGuild ends with the question', () => expect(askGuild('login bug').endsWith('Question: login bug')).toBe(true))`,
          hint: "const sources = hits.map((title, i) => `[${i + 1}] ${title}`).join('\\n') · return 'Answer using only ... \"I do not know\".\\n\\n' + sources + '\\n\\nQuestion: ' + question",
          solution: `// 🏰 Guild Tracker, Part 11 (continued)
${P11_DATA}

${P11_A}

${P11_B}

console.log(askGuild('login bug'))
`,
        },
      ],
    },
  },

  // ------------------------------------------------------------------------------------------ 12
  {
    realm: 'ai',
    lesson: {
      id: 'gt-12',
      title: 'Guild Tracker 12: A Million Users',
      boss: true,
      project: { part: 12, adds: 'a design for a million users, plus a cache' },
      uses: ['gt-11', 'sd-2', 'sd-4'],
      minutes: 20,
      steps: [
        whereWeAre(
          12,
          'Look what you built: a React board, typed pure logic, an HTTP API with auth on Lambda, a table with migrations, and AI search. Every piece was **one small step** from the last.',
          'The finale: the app goes viral. **A million users.** You redesign it to survive, and add the piece that saves the database: a cache.',
        ),
        {
          kind: 'visual',
          title: 'Guild Tracker at a million users',
          frames: [
            {
              caption: 'Today: one browser, one Lambda, one database. Fine for 100 heroes. At a million, every request lands on the **same database**.',
              lanes: [
                { title: 'Frontend', items: ['React Quest Board'] },
                { title: 'API', items: ['Lambda: handler → handle'] },
                { title: 'Database', items: ['Postgres (one box)'], highlight: [0] },
              ],
            },
            {
              caption: 'The React app is just files. Put them on **S3 behind a CDN** (CloudFront): copies sit near every user, and the API never serves them.',
              lanes: [
                { title: 'Frontend', items: ['React files on S3', 'CDN edge copies'], highlight: [0, 1] },
                { title: 'API', items: ['API Gateway', 'Lambda × many'] },
                { title: 'Database', items: ['Postgres primary'] },
              ],
            },
            {
              caption:
                'Most traffic is **reads** (opening the board). A **read replica** takes them. The primary only does writes. A **cache** in front answers the same list without touching either.',
              lanes: [
                { title: 'Frontend', items: ['React files on S3', 'CDN edge copies'] },
                { title: 'API', items: ['API Gateway', 'Lambda × many'] },
                { title: 'Cache', items: ['Redis: quest lists (TTL 30s)'], highlight: [0] },
                { title: 'Database', items: ['Postgres primary (writes)', 'Read replica (reads)'], highlight: [1] },
              ],
            },
            {
              caption:
                'Completing a quest sends a "well done" email. That is slow and can fail, so the API drops a message on a **queue** and answers right away. A worker sends the email later.',
              lanes: [
                { title: 'API', items: ['API Gateway', 'Lambda × many'] },
                { title: 'Cache', items: ['Redis: quest lists (TTL 30s)'] },
                { title: 'Database', items: ['Postgres primary (writes)', 'Read replica (reads)'] },
                { title: 'Queue', items: ['SQS: quest-completed', 'Worker Lambda → email'], highlight: [0, 1] },
              ],
            },
            {
              caption:
                'Your Part 11 search moves into the database: **pgvector** stores real embeddings next to the quests, so "search my quests" is one indexed query.',
              lanes: [
                { title: 'Frontend', items: ['React files on S3', 'CDN edge copies'] },
                { title: 'API', items: ['API Gateway', 'Lambda × many'] },
                { title: 'Cache', items: ['Redis: quest lists (TTL 30s)'] },
                { title: 'Database', items: ['Postgres primary (writes)', 'Read replica (reads)'] },
                { title: 'Queue', items: ['SQS: quest-completed', 'Worker Lambda → email'] },
                { title: 'AI', items: ['pgvector: quest embeddings', 'LLM for RAG answers'], highlight: [0, 1] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Every morning a million heroes open the Quest Board at 9am. 95% of requests are reads. What melts first in the one-box design?',
          options: ['The CDN', 'The single database: every Lambda copy opens connections and runs the same list query', 'The React app', 'The queue'],
          answer: 1,
          explain:
            'Lambda scales to thousands of copies easily. The database does not. Read replicas spread the reads, a cache skips most of them, and a connection pooler (like RDS Proxy) stops thousands of Lambdas from opening thousands of connections.',
        },
        {
          kind: 'quiz',
          prompt: 'Sending the "quest complete" email takes 2 seconds and the email service sometimes fails. Where should it happen?',
          options: [
            'Inside the PATCH request, before answering',
            'In the React app',
            'Put a message on a queue, answer the user right away, and let a worker send it (with retries)',
            'Skip emails at scale',
          ],
          answer: 2,
          explain:
            "The user shouldn't wait 2 seconds, or see an error, because of an email. A queue makes slow or flaky work happen later, and retries it if it fails.",
        },
        {
          kind: 'concept',
          title: 'A read-through cache with a TTL',
          eli5: "The cache is the **sticky note** with today's quest list. If the note is fresh, read it. If it's too old (or missing), walk to the filing cabinet (database), then write a new note.",
          body: `
\`\`\`
hit = cache.get('quests')
if hit exists and hit.expiresAt > now:   return hit.value      // fast!
value = await loadFn()                                         // slow: the database
cache.set('quests', { value, expiresAt: now + ttlMs })
return value
\`\`\`
## The other half: invalidation
When a quest is completed, the cached list is **wrong**. So after writing to the database, **delete** the cache entry. The next read loads fresh data.

> \`now\` is passed in instead of calling \`Date.now()\`, so tests can pretend time passed.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Boss: put a cache in front of the database',
          instructions: `
\`cache\` is a \`Map\`.

1. \`cachedListQuests(cache, loadFn, ttlMs, now)\`: if \`cache.get('quests')\` exists and its \`expiresAt\` is **greater than** \`now\`, return its \`value\` without calling \`loadFn\`. Otherwise \`await loadFn()\`, store \`{ value, expiresAt: now + ttlMs }\` under \`'quests'\`, and return the value.
2. \`completeQuest(cache, id)\`: update the database with \`completeQuestInDb(id)\`, **then** delete \`'quests'\` from the cache.
`,
          starter: `// 🏰 Guild Tracker, Part 12: a cache in front of the quest list.
${P12_DATA}

// TODO 1: fresh cache entry → its value. Otherwise load, store { value, expiresAt }, return.
async function cachedListQuests(cache, loadFn, ttlMs, now) {
  return loadFn()
}

// TODO 2: update the database, THEN delete 'quests' from the cache
async function completeQuest(cache, id) {
  await completeQuestInDb(id)
}
`,
          tests: `test('the first call loads from the database', async () => {
  const cache = new Map()
  let calls = 0
  const load = async () => { calls++; return ['a'] }
  expect(await cachedListQuests(cache, load, 1000, 0)).toEqual(['a'])
  expect(calls).toBe(1)
})
test('a second call within the TTL uses the cache', async () => {
  const cache = new Map()
  let calls = 0
  const load = async () => { calls++; return ['a'] }
  await cachedListQuests(cache, load, 1000, 0)
  expect(await cachedListQuests(cache, load, 1000, 999)).toEqual(['a'])
  expect(calls).toBe(1)
})
test('after the TTL it loads again', async () => {
  const cache = new Map()
  let calls = 0
  const load = async () => { calls++; return ['a'] }
  await cachedListQuests(cache, load, 1000, 0)
  await cachedListQuests(cache, load, 1000, 1000)
  expect(calls).toBe(2)
})
test('the cache entry stores value and expiresAt', async () => {
  const cache = new Map()
  await cachedListQuests(cache, async () => ['a'], 1000, 500)
  expect(cache.get('quests')).toEqual({ value: ['a'], expiresAt: 1500 })
})
test('completeQuest updates the database', async () => {
  await completeQuest(new Map(), 1)
  expect(db.quests[0].done).toBe(true)
})
test('completeQuest clears the cached list so nobody sees stale data', async () => {
  const cache = new Map()
  await cachedListQuests(cache, listQuestsFromDb, 60000, 0)
  await completeQuest(cache, 3)
  const list = await cachedListQuests(cache, listQuestsFromDb, 60000, 1)
  expect(list[2].done).toBe(true)
})`,
          hint: "const hit = cache.get('quests'); if (hit && hit.expiresAt > now) return hit.value; const value = await loadFn(); cache.set('quests', { value: value, expiresAt: now + ttlMs }); return value. completeQuest: await completeQuestInDb(id); cache.delete('quests')",
          solution: `// 🏰 Guild Tracker, Part 12: a cache in front of the quest list.
${P12_DATA}

${P12_SOL}
`,
        },
        {
          kind: 'quiz',
          prompt: 'You forgot `cache.delete(...)` in `completeQuest`. A hero completes a quest. What do they see?',
          options: ['An error', 'The quest still looks open until the cache entry expires (up to the TTL)', 'The quest disappears', 'Nothing changes, ever'],
          answer: 1,
          explain:
            'The database is right, but the cache still holds the old list. Readers get stale data until the TTL runs out. That is why "cache invalidation" is famously one of the two hard things in computer science.',
        },
        {
          kind: 'explain',
          prompt:
            'Walk through what happens when a hero clicks Complete on the Quest Board, from the click to the database and back to the screen. Name every piece you built.',
          keyPoints: [
            'React onClick calls complete(id), which calls markDone(id): fetch sends PATCH /quests/:id with a JSON body (Parts 4–5)',
            'The request hits API Gateway, which calls the Lambda handler; it turns the event into a req (Part 10)',
            'handle(req) matches the route, and withAuth checks the Bearer token, or answers 401 (Part 9)',
            'The data layer runs UPDATE quests SET done = 1 WHERE id = ? with a parameter, and rowcount decides 200 or 404 (Part 7)',
            'The cached quest list is deleted so the next read is fresh, and an email job goes on the queue (Part 12)',
            'The JSON answer travels back; res.ok is checked, then setQuests(completeQuest(...)) gives React a new array and the board re-renders (Parts 2, 4, 5)',
          ],
        },
      ],
    },
  },
]
