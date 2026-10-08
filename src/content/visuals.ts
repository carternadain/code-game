import type { VisualStep } from '../types'

/** Animated step-throughs. Each one is dropped into a lesson right after its concept card. */

export const referencesVisual: VisualStep = {
  kind: 'visual',
  title: 'Copies vs. arrows',
  code: `let a = 5
let b = a
b = 6
const hero = { hp: 100 }
const twin = hero
twin.hp = 1
console.log(hero.hp)`,
  frames: [
    {
      line: 1,
      caption: '`a` gets its own little box with **5** inside.',
      lanes: [
        { title: 'Variables', items: ['a = 5'], highlight: [0] },
        { title: 'Heap (big objects)', items: [] },
        { title: 'Console', items: [] },
      ],
    },
    {
      line: 2,
      caption: '`b` gets its **own copy** of 5. Two separate boxes.',
      lanes: [
        { title: 'Variables', items: ['a = 5', 'b = 5'], highlight: [1] },
        { title: 'Heap (big objects)', items: [] },
        { title: 'Console', items: [] },
      ],
    },
    {
      line: 3,
      caption: "Changing `b` doesn't touch `a`. Numbers are **copied**. ✅",
      lanes: [
        { title: 'Variables', items: ['a = 5', 'b = 6'], highlight: [1] },
        { title: 'Heap (big objects)', items: [] },
        { title: 'Console', items: [] },
      ],
    },
    {
      line: 4,
      caption: 'Objects are big, so they live in the **heap**. `hero` only holds an **arrow** (address) pointing at it.',
      lanes: [
        { title: 'Variables', items: ['a = 5', 'b = 6', 'hero ──► #1'], highlight: [2] },
        { title: 'Heap (big objects)', items: ['#1  { hp: 100 }'], highlight: [0] },
        { title: 'Console', items: [] },
      ],
    },
    {
      line: 5,
      caption: '`twin` copies the **arrow**, not the object. Now two arrows point at the SAME thing.',
      lanes: [
        { title: 'Variables', items: ['a = 5', 'b = 6', 'hero ──► #1', 'twin ──► #1'], highlight: [2, 3] },
        { title: 'Heap (big objects)', items: ['#1  { hp: 100 }'] },
        { title: 'Console', items: [] },
      ],
    },
    {
      line: 6,
      caption: "Follow `twin`'s arrow and change hp... it changes the ONE object both arrows point to.",
      lanes: [
        { title: 'Variables', items: ['a = 5', 'b = 6', 'hero ──► #1', 'twin ──► #1'], highlight: [3] },
        { title: 'Heap (big objects)', items: ['#1  { hp: 1 }'], highlight: [0] },
        { title: 'Console', items: [] },
      ],
    },
    {
      line: 7,
      caption: 'So `hero.hp` is **1**. 😱 Numbers/strings = copies. Objects/arrays = arrows.',
      lanes: [
        { title: 'Variables', items: ['a = 5', 'b = 6', 'hero ──► #1', 'twin ──► #1'], highlight: [2] },
        { title: 'Heap (big objects)', items: ['#1  { hp: 1 }'] },
        { title: 'Console', items: ['1'], highlight: [0] },
      ],
    },
  ],
}

export const callStackVisual: VisualStep = {
  kind: 'visual',
  title: 'Watch the stack grow and shrink',
  code: `function main() {
  const x = double(4)
  console.log(x)
}
function double(n) {
  return add(n, n)
}
function add(a, b) {
  return a + b
}
main()`,
  frames: [
    {
      line: 11,
      caption: 'The program starts. `main()` gets called — a new plate goes on the stack.',
      lanes: [
        { title: 'Call stack', layout: 'stack', items: ['main()'], highlight: [0] },
        { title: 'Console', items: [] },
      ],
    },
    {
      line: 2,
      caption: '`main` needs `double(4)`. It **pauses** and a new plate goes on top.',
      lanes: [
        { title: 'Call stack', layout: 'stack', items: ['main()  ⏸ waiting', 'double(n = 4)'], highlight: [1] },
        { title: 'Console', items: [] },
      ],
    },
    {
      line: 6,
      caption: '`double` needs `add(4, 4)`. Pause again, another plate on top.',
      lanes: [
        { title: 'Call stack', layout: 'stack', items: ['main()  ⏸ waiting', 'double(n = 4)  ⏸ waiting', 'add(a = 4, b = 4)'], highlight: [2] },
        { title: 'Console', items: [] },
      ],
    },
    {
      line: 9,
      caption: '`add` returns **8**. Its plate is removed (popped). Only the TOP plate is ever running.',
      lanes: [
        { title: 'Call stack', layout: 'stack', items: ['main()  ⏸ waiting', 'double(n = 4)  ← got 8'], highlight: [1] },
        { title: 'Console', items: [] },
      ],
    },
    {
      line: 6,
      caption: '`double` passes the 8 back up and pops off too.',
      lanes: [
        { title: 'Call stack', layout: 'stack', items: ['main()  ← got 8'], highlight: [0] },
        { title: 'Console', items: [] },
      ],
    },
    {
      line: 3,
      caption: '`main` continues right where it paused: `x` is 8, so it logs 8.',
      lanes: [
        { title: 'Call stack', layout: 'stack', items: ['main()  x = 8'], highlight: [0] },
        { title: 'Console', items: ['8'], highlight: [0] },
      ],
    },
    {
      line: 4,
      caption: "`main` finishes. Stack is empty → program done. An error's **stack trace** is a photo of this stack at the moment it broke.",
      lanes: [
        { title: 'Call stack', layout: 'stack', items: [] },
        { title: 'Console', items: ['8'] },
      ],
    },
  ],
}

export const eventLoopVisual: VisualStep = {
  kind: 'visual',
  title: 'The event loop, one tick at a time',
  code: `console.log('1')
setTimeout(() => console.log('timeout'), 0)
Promise.resolve().then(() => console.log('promise'))
console.log('2')`,
  frames: [
    {
      line: 1,
      caption: 'Normal code runs right away on the call stack. Logs **1**.',
      lanes: [
        { title: 'Call stack', layout: 'stack', items: ["console.log('1')"], highlight: [0] },
        { title: 'Browser timers', items: [] },
        { title: 'Microtask line (VIP)', items: [] },
        { title: 'Task line (regular)', items: [] },
        { title: 'Console', items: ['1'], highlight: [0] },
      ],
    },
    {
      line: 2,
      caption: 'setTimeout hands the callback to the **browser** to hold. JS does NOT wait — it moves on.',
      lanes: [
        { title: 'Call stack', layout: 'stack', items: ['setTimeout(...)'], highlight: [0] },
        { title: 'Browser timers', items: ['⏲ 0ms → timeout cb'], highlight: [0] },
        { title: 'Microtask line (VIP)', items: [] },
        { title: 'Task line (regular)', items: [] },
        { title: 'Console', items: ['1'] },
      ],
    },
    {
      line: 2,
      caption: '0ms passes instantly, so the timer puts its callback in the **regular line**. It must wait its turn.',
      lanes: [
        { title: 'Call stack', layout: 'stack', items: [] },
        { title: 'Browser timers', items: [] },
        { title: 'Microtask line (VIP)', items: [] },
        { title: 'Task line (regular)', items: ['timeout cb'], highlight: [0] },
        { title: 'Console', items: ['1'] },
      ],
    },
    {
      line: 3,
      caption: "A resolved promise's `.then` goes in the **VIP line** (microtasks).",
      lanes: [
        { title: 'Call stack', layout: 'stack', items: ['Promise.then(...)'], highlight: [0] },
        { title: 'Browser timers', items: [] },
        { title: 'Microtask line (VIP)', items: ['promise cb'], highlight: [0] },
        { title: 'Task line (regular)', items: ['timeout cb'] },
        { title: 'Console', items: ['1'] },
      ],
    },
    {
      line: 4,
      caption: 'Still normal code, so it runs now. Logs **2**.',
      lanes: [
        { title: 'Call stack', layout: 'stack', items: ["console.log('2')"], highlight: [0] },
        { title: 'Browser timers', items: [] },
        { title: 'Microtask line (VIP)', items: ['promise cb'] },
        { title: 'Task line (regular)', items: ['timeout cb'] },
        { title: 'Console', items: ['1', '2'], highlight: [1] },
      ],
    },
    {
      caption: 'Stack is empty! The event loop checks the **VIP line first**. Logs **promise**.',
      lanes: [
        { title: 'Call stack', layout: 'stack', items: ['promise cb'], highlight: [0] },
        { title: 'Browser timers', items: [] },
        { title: 'Microtask line (VIP)', items: [] },
        { title: 'Task line (regular)', items: ['timeout cb'] },
        { title: 'Console', items: ['1', '2', 'promise'], highlight: [2] },
      ],
    },
    {
      caption: 'VIP line empty → now ONE task from the regular line. Logs **timeout**. Final order: 1, 2, promise, timeout.',
      lanes: [
        { title: 'Call stack', layout: 'stack', items: ['timeout cb'], highlight: [0] },
        { title: 'Browser timers', items: [] },
        { title: 'Microtask line (VIP)', items: [] },
        { title: 'Task line (regular)', items: [] },
        { title: 'Console', items: ['1', '2', 'promise', 'timeout'], highlight: [3] },
      ],
    },
  ],
}

const buckets = (b0: string[], b1: string[], b2: string[], b3: string[], hl?: number) =>
  [b0, b1, b2, b3].map((items, i) => ({ title: `Bucket ${i}`, items, highlight: hl === i ? [items.length - 1] : undefined }))

export const hashMapVisual: VisualStep = {
  kind: 'visual',
  title: 'Inside a hash map',
  frames: [
    { caption: 'A hash map is just a row of numbered **buckets** (an array). Empty for now.', lanes: buckets([], [], [], []) },
    {
      caption: '`set("ada", 7)`: run "ada" through the hash function → 96354. 96354 % 4 = **2**. Drop it in bucket 2.',
      lanes: buckets([], [], ['ada → 7'], [], 2),
    },
    {
      caption: '`set("linus", 3)`: hash → 102 % 4 = **2**... bucket 2 again! A **collision**. No problem, the bucket holds a tiny list.',
      lanes: buckets([], [], ['ada → 7', 'linus → 3'], [], 2),
    },
    { caption: '`set("grace", 9)`: hash % 4 = **0**.', lanes: buckets(['grace → 9'], [], ['ada → 7', 'linus → 3'], [], 0) },
    {
      caption:
        '`get("grace")`: do the SAME math → bucket 0 → found. No scanning the whole thing. That\'s why lookups are **O(1)** — instant, no matter how big.',
      lanes: buckets(['grace → 9'], [], ['ada → 7', 'linus → 3'], [], 0),
    },
  ],
}

const arr = [1, 3, 5, 7, 9, 11, 13, 15, 17]
const bsLane = (lo: number, hi: number, mid?: number) => ({
  title: 'Sorted array (looking for 15)',
  layout: 'row' as const,
  items: arr.map((v, i) => (i < lo || i > hi ? '░' : String(v))),
  highlight: mid != null ? [mid] : undefined,
})

export const binarySearchVisual: VisualStep = {
  kind: 'visual',
  title: 'Binary search: throw away half every time',
  frames: [
    { caption: 'We want **15**. Instead of checking one by one (9 checks), peek at the **middle**.', lanes: [bsLane(0, 8)] },
    { caption: 'Middle is **9**. 15 is bigger, so everything left of 9 can be thrown away. 💨', lanes: [bsLane(0, 8, 4)] },
    { caption: "Half gone! Middle of what's left is **13**. Still too small → throw away the left part again.", lanes: [bsLane(5, 8, 6)] },
    { caption: 'Middle is **15**. Found it in **3 peeks** instead of 8.', lanes: [bsLane(7, 8, 7)] },
    { caption: "A million items? Only **~20 peeks**. A billion? ~30. That's O(log n). (Only works if the list is sorted!)", lanes: [bsLane(7, 7, 7)] },
  ],
}

export const reactStateVisual: VisualStep = {
  kind: 'visual',
  title: 'What happens when you click',
  code: `function Counter() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  )
}`,
  frames: [
    {
      line: 2,
      caption: 'First render: React calls `Counter()`. useState says "count starts at 0" and React **remembers 0 for you**.',
      lanes: [
        { title: "React's memory", items: ['count = 0'], highlight: [0] },
        { title: 'Function calls', items: ['Counter() #1'] },
        { title: 'Screen', items: ['[ 0 ]'] },
      ],
    },
    {
      line: 4,
      caption: 'You click. `setCount(0 + 1)` doesn\'t change anything instantly — it tells React "please store 1 and **redraw**".',
      lanes: [
        { title: "React's memory", items: ['count = 1'], highlight: [0] },
        { title: 'Function calls', items: ['Counter() #1'] },
        { title: 'Screen', items: ['[ 0 ]'] },
      ],
    },
    {
      line: 1,
      caption: 'React calls your whole `Counter()` function **again** from the top. A brand new run.',
      lanes: [
        { title: "React's memory", items: ['count = 1'] },
        { title: 'Function calls', items: ['Counter() #1', 'Counter() #2'], highlight: [1] },
        { title: 'Screen', items: ['[ 0 ]'] },
      ],
    },
    {
      line: 2,
      caption: 'This time useState hands back the **remembered** value: 1.',
      lanes: [
        { title: "React's memory", items: ['count = 1'], highlight: [0] },
        { title: 'Function calls', items: ['Counter() #1', 'Counter() #2  count=1'], highlight: [1] },
        { title: 'Screen', items: ['[ 0 ]'] },
      ],
    },
    {
      line: 5,
      caption: 'The new JSX says `1`. React compares old vs new and updates **only that text** on screen.',
      lanes: [
        { title: "React's memory", items: ['count = 1'] },
        { title: 'Function calls', items: ['Counter() #1', 'Counter() #2  count=1'] },
        { title: 'Screen', items: ['[ 1 ]'], highlight: [0] },
      ],
    },
    {
      caption:
        "The loop: **click → setState → React re-runs your function → screen updates**. A normal `let count` would reset to 0 on every run — that's why we need useState.",
      lanes: [
        { title: "React's memory", items: ['count = 1'] },
        { title: 'Function calls', items: ['Counter() #1', 'Counter() #2  count=1'] },
        { title: 'Screen', items: ['[ 1 ]'] },
      ],
    },
  ],
}

const net = (browser: string[], dns: string[], server: string[], db: string[], hl?: [number, number]) =>
  [
    { title: '💻 Your browser', items: browser },
    { title: '📖 DNS', items: dns },
    { title: '🖥 Server', items: server },
    { title: '🗄 Database', items: db },
  ].map((lane, i) => (hl && hl[0] === i ? { ...lane, highlight: [hl[1]] } : lane))

export const requestVisual: VisualStep = {
  kind: 'visual',
  title: 'The journey of one request',
  frames: [
    { caption: 'You type **questapp.com/users/7** and press Enter.', lanes: net(['questapp.com/users/7 ⏎'], [], [], [], [0, 0]) },
    {
      caption: 'Computers need a number, not a name. Ask **DNS** (the internet\'s phone book): "what\'s the address for questapp.com?"',
      lanes: net(['questapp.com/users/7 ⏎'], ['questapp.com = 52.1.2.3'], [], [], [1, 0]),
    },
    {
      caption: 'Connect to 52.1.2.3 and lock the line with **HTTPS** encryption 🔒. Then send the request message.',
      lanes: net(['GET /users/7  🔒'], ['questapp.com = 52.1.2.3'], ['GET /users/7  🔒'], [], [2, 0]),
    },
    {
      caption: 'The server matches the route `/users/:id` and asks the **database** for user 7.',
      lanes: net(['⏳ waiting…'], [], ['route → getUser(id=7)'], ['SELECT * FROM users WHERE id = 7'], [3, 0]),
    },
    {
      caption: 'The database answers. The server wraps it up as a **response**: status code + JSON.',
      lanes: net(['⏳ waiting…'], [], ['200 OK  {"id":7,"name":"Ada"}'], ['→ Ada'], [2, 0]),
    },
    {
      caption: 'Your browser gets **200 OK** and the data, and draws the page. All of that in ~100 milliseconds.',
      lanes: net(['200 OK ✅  shows "Ada"'], [], [], [], [0, 0]),
    },
  ],
}

export const alembicVisual: VisualStep = {
  kind: 'visual',
  title: 'What `alembic upgrade head` actually does',
  frames: [
    {
      caption: 'Your migration files are like **save points** in a chain. Each one points back to the one before it.',
      lanes: [
        { title: '📁 Migration files (in Git)', items: ['a1  create users', 'b2  add email   (after a1)', 'c3  create posts (after b2)'] },
        { title: 'alembic_version table', items: ['a1'], highlight: [0] },
        { title: 'Database tables', items: ['users(id, username)'] },
      ],
    },
    {
      caption: 'Alembic reads the **alembic_version** table: "this database is at **a1**". Head is c3, so b2 and c3 still need to run.',
      lanes: [
        { title: '📁 Migration files (in Git)', items: ['a1  ✔ done', 'b2  ⏳ to do', 'c3  ⏳ to do'], highlight: [1, 2] },
        { title: 'alembic_version table', items: ['a1'], highlight: [0] },
        { title: 'Database tables', items: ['users(id, username)'] },
      ],
    },
    {
      caption: "Run **b2**'s `upgrade()` → adds the email column. Then update the bookmark to b2.",
      lanes: [
        { title: '📁 Migration files (in Git)', items: ['a1  ✔ done', 'b2  ✔ done', 'c3  ⏳ to do'], highlight: [1] },
        { title: 'alembic_version table', items: ['b2'], highlight: [0] },
        { title: 'Database tables', items: ['users(id, username, email)'], highlight: [0] },
      ],
    },
    {
      caption: "Run **c3**'s `upgrade()` → creates posts. Bookmark moves to c3. The database now matches the code. 🎉",
      lanes: [
        { title: '📁 Migration files (in Git)', items: ['a1  ✔ done', 'b2  ✔ done', 'c3  ✔ done'], highlight: [2] },
        { title: 'alembic_version table', items: ['c3'], highlight: [0] },
        { title: 'Database tables', items: ['users(id, username, email)', 'posts(id, user_id, title)'], highlight: [1] },
      ],
    },
    {
      caption:
        "Your teammate's laptop, CI and production all run the **same chain** → every database ends up identical. `downgrade` walks the chain backwards.",
      lanes: [
        { title: '💻 Your laptop', items: ['at c3 ✔'] },
        { title: '🧪 CI', items: ['at c3 ✔'] },
        { title: '🚀 Production', items: ['at c3 ✔'] },
      ],
    },
  ],
}

export const joinVisual: VisualStep = {
  kind: 'visual',
  title: 'How a JOIN matches rows',
  frames: [
    {
      caption: 'Two tables. heroes only stores a **guild_id number**, not the guild name.',
      lanes: [
        { title: 'heroes', items: ['Ada    guild_id 1', 'Linus  guild_id 2', 'Alan   guild_id NULL'] },
        { title: 'guilds', items: ['1  Null Pointers', '2  Stack Overflowers'] },
        { title: 'Result', items: [] },
      ],
    },
    {
      caption: '`JOIN guilds ON guilds.id = heroes.guild_id`: take Ada → her guild_id is 1 → find guild 1 → glue the rows together.',
      lanes: [
        { title: 'heroes', items: ['Ada    guild_id 1', 'Linus  guild_id 2', 'Alan   guild_id NULL'], highlight: [0] },
        { title: 'guilds', items: ['1  Null Pointers', '2  Stack Overflowers'], highlight: [0] },
        { title: 'Result', items: ['Ada | Null Pointers'], highlight: [0] },
      ],
    },
    {
      caption: 'Linus → guild 2 → match. Glue.',
      lanes: [
        { title: 'heroes', items: ['Ada    guild_id 1', 'Linus  guild_id 2', 'Alan   guild_id NULL'], highlight: [1] },
        { title: 'guilds', items: ['1  Null Pointers', '2  Stack Overflowers'], highlight: [1] },
        { title: 'Result', items: ['Ada | Null Pointers', 'Linus | Stack Overflowers'], highlight: [1] },
      ],
    },
    {
      caption: 'Alan has NULL → no match. A normal (INNER) JOIN just **drops him**. 😢',
      lanes: [
        { title: 'heroes', items: ['Ada    guild_id 1', 'Linus  guild_id 2', 'Alan   guild_id NULL'], highlight: [2] },
        { title: 'guilds', items: ['1  Null Pointers', '2  Stack Overflowers'] },
        { title: 'Result', items: ['Ada | Null Pointers', 'Linus | Stack Overflowers'] },
      ],
    },
    {
      caption: 'A **LEFT JOIN** keeps every row from the left table (heroes) and fills the blanks with NULL.',
      lanes: [
        { title: 'heroes', items: ['Ada    guild_id 1', 'Linus  guild_id 2', 'Alan   guild_id NULL'], highlight: [2] },
        { title: 'guilds', items: ['1  Null Pointers', '2  Stack Overflowers'] },
        { title: 'Result (LEFT JOIN)', items: ['Ada | Null Pointers', 'Linus | Stack Overflowers', 'Alan | NULL'], highlight: [2] },
      ],
    },
  ],
}

export const ragVisual: VisualStep = {
  kind: 'visual',
  title: 'RAG, step by step',
  frames: [
    {
      caption: "You have documents the AI has **never seen** (your company's help docs).",
      lanes: [
        { title: '📄 Docs', items: ['refund-policy.md', 'shipping.md', 'login-help.md'] },
        { title: '✂️ Chunks', items: [] },
        { title: '🧭 Vector DB', items: [] },
        { title: '📝 Prompt', items: [] },
      ],
    },
    {
      caption: '**Chunk**: cut them into bite-size pieces (a few paragraphs each).',
      lanes: [
        { title: '📄 Docs', items: ['refund-policy.md', 'shipping.md', 'login-help.md'] },
        { title: '✂️ Chunks', items: ['"Refunds within 30 days…"', '"Free shipping over $50…"', '"Reset your password via…"'], highlight: [0, 1, 2] },
        { title: '🧭 Vector DB', items: [] },
        { title: '📝 Prompt', items: [] },
      ],
    },
    {
      caption: '**Embed**: turn each chunk into a list of numbers that captures its *meaning*, and store them. (This all happens once, ahead of time.)',
      lanes: [
        { title: '📄 Docs', items: [] },
        { title: '✂️ Chunks', items: ['"Refunds within 30 days…"', '"Free shipping over $50…"', '"Reset your password via…"'] },
        { title: '🧭 Vector DB', items: ['[0.9, 0.1, …] refunds', '[0.1, 0.8, …] shipping', '[0.2, 0.1, …] password'], highlight: [0, 1, 2] },
        { title: '📝 Prompt', items: [] },
      ],
    },
    {
      caption:
        'A user asks **"Can I get my money back?"** → embed the question → find the chunk with the closest meaning. (No word "refund" in the question — meaning still matches!)',
      lanes: [
        { title: '❓ Question', items: ['"Can I get my money back?"', '→ [0.85, 0.15, …]'], highlight: [1] },
        { title: '✂️ Chunks', items: [] },
        { title: '🧭 Vector DB', items: ['[0.9, 0.1, …] refunds  ← closest!', '[0.1, 0.8, …] shipping', '[0.2, 0.1, …] password'], highlight: [0] },
        { title: '📝 Prompt', items: [] },
      ],
    },
    {
      caption: '**Augment**: paste the found chunk into the prompt with the question.',
      lanes: [
        { title: '❓ Question', items: ['"Can I get my money back?"'] },
        { title: '✂️ Chunks', items: [] },
        { title: '🧭 Vector DB', items: ['refunds chunk ✔'] },
        { title: '📝 Prompt', items: ['Use ONLY these sources:', '[1] Refunds within 30 days…', 'Question: Can I get my money back?'], highlight: [1] },
      ],
    },
    {
      caption: '**Generate**: the LLM answers from the real policy — *"Yes, within 30 days [1]"* — instead of guessing. That\'s RAG.',
      lanes: [
        { title: '📝 Prompt', items: ['sources + question'] },
        { title: '🤖 LLM', items: ['reads it all…'] },
        { title: '💬 Answer', items: ['"Yes — within 30 days of purchase. [1]"'], highlight: [0] },
      ],
    },
  ],
}
