import type { Realm } from '../types'

export const react: Realm = {
  id: 'react',
  name: 'Component Kingdom',
  topic: 'React + TypeScript',
  icon: '👑',
  color: '#61dafb',
  when: 'Month 2–3',
  blurb: 'Understand what React actually does: components as functions, state, re-renders, effects. Live preview + tests.',
  lessons: [
    {
      id: 'react-1',
      title: 'Components Are Just Functions',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'UI = f(state)',
          eli5: 'A component is a **cookie cutter**: give it data (props), and it stamps out the same UI shape every time. Change the data → stamp a new cookie.',
          body: `
A React component is a **function that returns a description of UI**. That's it.

\`\`\`
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>
}
\`\`\`
## JSX is not HTML
JSX is syntax sugar. A compiler (Babel, esbuild, tsc) turns it into plain function calls:

\`\`\`
<h1 className="title">Hello, {name}</h1>
// becomes
React.createElement('h1', { className: 'title' }, 'Hello, ', name)
\`\`\`
That call returns a plain JS object — a **virtual DOM** node. React compares the new tree with the previous one (**reconciliation**) and updates only the real DOM nodes that changed.

## Rendering lists
\`\`\`
<ul>{skills.map(s => <li key={s}>{s}</li>)}</ul>
\`\`\`
\`key\` tells React which item is which between renders, so it can move/update the right DOM node instead of rebuilding everything.
`,
        },
        {
          kind: 'quiz',
          prompt: 'What does `<button onClick={save}>Save</button>` compile to?',
          options: [
            "document.createElement('button')",
            "React.createElement('button', { onClick: save }, 'Save')",
            '\'<button onclick="save">Save</button>\'',
            'new Button(save)',
          ],
          answer: 1,
          explain:
            'JSX → createElement calls → plain objects. No HTML strings involved. (With the newer "automatic runtime" it compiles to `jsx(...)` from react/jsx-runtime, but it\'s the same idea.)',
        },
        {
          kind: 'code',
          lang: 'react',
          title: 'Render your skill tree',
          instructions: `
Make \`App\` render:
- an \`<h1>\` with the text \`Skill Tree\`
- a \`<ul>\` with one \`<li>\` per skill in the \`skills\` array (use \`.map\` and a \`key\`)

Hooks like \`useState\` are already available — no imports needed in this playground.
`,
          starter: `const skills = ['JavaScript', 'TypeScript', 'React', 'SQL']\n\nfunction App() {\n  return (\n    <div>\n      {/* your JSX here */}\n    </div>\n  )\n}\n`,
          tests: `test('has the heading', () => expect(text('h1')).toBe('Skill Tree'))
test('renders 4 list items', () => expect($$('li').length).toBe(4))
test('items match the array', () => expect($$('li').map((li) => li.textContent)).toEqual(['JavaScript', 'TypeScript', 'React', 'SQL']))`,
          hint: '<ul>{skills.map((s) => <li key={s}>{s}</li>)}</ul>',
          solution: `const skills = ['JavaScript', 'TypeScript', 'React', 'SQL']\n\nfunction App() {\n  return (\n    <div>\n      <h1>Skill Tree</h1>\n      <ul>\n        {skills.map((s) => (\n          <li key={s}>{s}</li>\n        ))}\n      </ul>\n    </div>\n  )\n}\n`,
        },
      ],
    },
    {
      id: 'react-2',
      title: 'State & Re-rendering',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: "Why you can't just change a variable",
          eli5: 'Every render, React **re-runs your whole function** from scratch — so normal variables reset. `useState` is a **sticky note React keeps for you** between runs.',
          body: `
\`\`\`
function Counter() {
  let count = 0                          // ✖ reset to 0 on every render
  return <button onClick={() => count++}>{count}</button>
}
\`\`\`
Every render calls your function again from scratch. Local variables don't survive, and changing them doesn't tell React to re-render.

\`useState\` stores the value **outside** your function (React keeps it, keyed by the hook's position) and gives you a setter that **schedules a re-render**:

\`\`\`
const [count, setCount] = useState(0)
setCount(count + 1)        // fine
setCount(c => c + 1)       // better when based on the previous value
\`\`\`
## Never mutate state
\`\`\`
items.push(x); setItems(items)   // ✖ same array reference → React may skip the render
setItems([...items, x])          // ✔ new array
\`\`\`
> Hooks rule: call them at the top level of your component, never inside ifs or loops — React identifies them by call order.
`,
        },
        {
          kind: 'quiz',
          prompt: 'count is 0. What is it after one click?',
          code: `<button onClick={() => {\n  setCount(count + 1)\n  setCount(count + 1)\n  setCount(count + 1)\n}}>+3?</button>`,
          options: ['3', '1', '0', 'It throws an error'],
          answer: 1,
          explain:
            '`count` is a constant (0) for this whole render. All three calls say "set it to 0 + 1". Use the updater form `setCount(c => c + 1)` three times to get 3.',
        },
        {
          kind: 'code',
          lang: 'react',
          title: 'Health bar',
          instructions: `
Build a health tracker:
- show the HP in a \`<p id="hp">\` like \`HP: 100\`
- a button with text \`Hit\` that subtracts 15 (never below 0)
- a button with text \`Heal\` that adds 10 (never above 100)
- when HP is 0, show \`<p id="status">Game over</p>\`
`,
          starter: `function App() {\n  // const [hp, setHp] = useState(100)\n  return (\n    <div>\n      \n    </div>\n  )\n}\n`,
          tests: `const btn = (label) => $$('button').find((b) => b.textContent === label)
test('starts at 100', () => expect(text('#hp')).toBe('HP: 100'))
test('Hit subtracts 15', async () => { await click(btn('Hit')); expect(text('#hp')).toBe('HP: 85') })
test('Heal caps at 100', async () => { await click(btn('Heal')); await click(btn('Heal')); expect(text('#hp')).toBe('HP: 100') })
test('no game over yet', () => expect($('#status')).toBe(null))
test('floors at 0 + game over', async () => {
  for (let i = 0; i < 8; i++) await click(btn('Hit'))
  expect(text('#hp')).toBe('HP: 0')
  expect(text('#status')).toBe('Game over')
})`,
          hint: 'setHp(h => Math.max(0, h - 15)) and setHp(h => Math.min(100, h + 10)). Conditional render: {hp === 0 && <p id="status">Game over</p>}',
          solution: `function App() {\n  const [hp, setHp] = useState(100)\n  return (\n    <div>\n      <p id="hp">HP: {hp}</p>\n      <button onClick={() => setHp((h) => Math.max(0, h - 15))}>Hit</button>\n      <button onClick={() => setHp((h) => Math.min(100, h + 10))}>Heal</button>\n      {hp === 0 && <p id="status">Game over</p>}\n    </div>\n  )\n}\n`,
        },
      ],
    },
    {
      id: 'react-3',
      title: 'Props & Lifting State Up',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Data flows down, events flow up',
          eli5: "Props are **instructions a parent hands down** to its kids. Kids can't change them — they **call up** (a callback) to ask the parent to change things.",
          body: `
**Props** are a component's arguments. They're read-only.

\`\`\`
type BadgeProps = { name: string; level: number; onLevelUp: () => void }

function Badge({ name, level, onLevelUp }: BadgeProps) {
  return <button onClick={onLevelUp}>{name} Lv{level}</button>
}
\`\`\`
When two components need the same state, **lift it up** to their closest common parent, and pass down both the value and a function to change it. The parent owns the data; children *ask* for changes by calling callbacks.
`,
        },
        {
          kind: 'code',
          lang: 'react',
          title: 'Party roster',
          instructions: `
1. Write a \`Member\` component with props \`{ name: string; level: number; onTrain: () => void }\` that renders an \`<li>\` with the text \`<name> (Lv <level>)\` and a \`Train\` button.
2. \`App\` holds the party in state and renders a \`Member\` for each one. Clicking **Train** levels up **only that member**.
3. Show the total party level in \`<p id="total">Total: N</p>\`.
`,
          starter: `type Hero = { name: string; level: number }\n\nfunction Member(/* props */) {\n  return <li></li>\n}\n\nfunction App() {\n  const [party, setParty] = useState<Hero[]>([\n    { name: 'Ada', level: 3 },\n    { name: 'Linus', level: 1 },\n  ])\n\n  return (\n    <div>\n      <ul></ul>\n    </div>\n  )\n}\n`,
          tests: `test('renders members', () => expect($$('li').length).toBe(2))
test('shows name and level', () => expect($$('li')[0].textContent).toContain('Ada (Lv 3)'))
test('total', () => expect(text('#total')).toBe('Total: 4'))
test('training levels only that member', async () => {
  await click($$('li')[1].querySelector('button'))
  expect($$('li')[1].textContent).toContain('Linus (Lv 2)')
  expect($$('li')[0].textContent).toContain('Ada (Lv 3)')
  expect(text('#total')).toBe('Total: 5')
})`,
          hint: 'onTrain={() => setParty(p => p.map((h, j) => j === i ? { ...h, level: h.level + 1 } : h))} — map to a NEW array with a NEW object for the changed hero.',
          solution: `type Hero = { name: string; level: number }\n\nfunction Member({ name, level, onTrain }: { name: string; level: number; onTrain: () => void }) {\n  return (\n    <li>\n      {name} (Lv {level}) <button onClick={onTrain}>Train</button>\n    </li>\n  )\n}\n\nfunction App() {\n  const [party, setParty] = useState<Hero[]>([\n    { name: 'Ada', level: 3 },\n    { name: 'Linus', level: 1 },\n  ])\n  const total = party.reduce((sum, h) => sum + h.level, 0)\n\n  return (\n    <div>\n      <ul>\n        {party.map((h, i) => (\n          <Member\n            key={h.name}\n            name={h.name}\n            level={h.level}\n            onTrain={() => setParty((p) => p.map((x, j) => (j === i ? { ...x, level: x.level + 1 } : x)))}\n          />\n        ))}\n      </ul>\n      <p id="total">Total: {total}</p>\n    </div>\n  )\n}\n`,
        },
        {
          kind: 'quiz',
          prompt: 'Why compute `total` during render instead of storing it in its own useState?',
          options: [
            "useState can't hold numbers",
            "It's derived data — storing it separately means two sources of truth that can get out of sync",
            "It's faster to store it",
            'React forbids more than one useState',
          ],
          answer: 1,
          explain: 'If you can calculate it from existing state or props, calculate it. Duplicated state is one of the most common React bugs.',
        },
      ],
    },
    {
      id: 'react-4',
      title: 'Effects & the Render Cycle',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Syncing with the outside world',
          eli5: 'Rendering is **drawing the picture**. `useEffect` is **doing chores after the picture is drawn** (fetch data, start a timer) — and the cleanup function is **putting your toys away**.',
          body: `
Rendering should be **pure**: same props/state in → same JSX out, no side effects. Side effects (fetching, timers, subscriptions, touching \`document\`) go in \`useEffect\`, which runs **after** React commits the render to the screen.

\`\`\`
useEffect(() => {
  const id = setInterval(tick, 1000)
  return () => clearInterval(id)    // cleanup: runs before next effect & on unmount
}, [])                              // deps: [] = only after the first render
\`\`\`
## The dependency array
- no array → runs after **every** render
- \`[]\` → once after mount
- \`[userId]\` → whenever \`userId\` changes

> You might not need an effect! Transforming data for rendering or handling a click doesn't need one. Effects are for synchronizing with things *outside* React.
`,
        },
        {
          kind: 'quiz',
          prompt: 'What happens here?',
          code: `const [n, setN] = useState(0)\nuseEffect(() => {\n  setN(n + 1)\n})`,
          options: ['n becomes 1 and stops', 'Infinite render loop', 'Compile error', "Nothing — effects don't run on mount"],
          answer: 1,
          explain:
            'No dependency array → the effect runs after every render. It sets state → re-render → effect runs again → forever. React will eventually throw "Maximum update depth exceeded".',
        },
        {
          kind: 'code',
          lang: 'react',
          title: 'Sync the document title',
          instructions: `
Build a click counter that also keeps the **browser tab title** in sync:
- a \`<button>\` showing \`Clicks: N\`
- a \`useEffect\` that sets \`document.title\` to \`N clicks\` whenever the count changes (with the correct dependency array).
`,
          starter: `function App() {\n  const [count, setCount] = useState(0)\n\n  // useEffect(...)\n\n  return <button onClick={() => setCount((c) => c + 1)}>Clicks: {count}</button>\n}\n`,
          tests: `test('title starts at 0 clicks', () => expect(document.title).toBe('0 clicks'))
test('title updates', async () => { await click($('button')); await click($('button')); expect(document.title).toBe('2 clicks') })
test('button text', () => expect(text('button')).toBe('Clicks: 2'))`,
          hint: 'useEffect(() => { document.title = `${count} clicks` }, [count])',
          solution:
            'function App() {\n  const [count, setCount] = useState(0)\n\n  useEffect(() => {\n    document.title = `${count} clicks`\n  }, [count])\n\n  return <button onClick={() => setCount((c) => c + 1)}>Clicks: {count}</button>\n}\n',
        },
      ],
    },
    {
      id: 'react-5',
      title: 'BOSS: The Todo Dragon',
      boss: true,
      minutes: 25,
      steps: [
        {
          kind: 'concept',
          title: 'Controlled inputs',
          eli5: 'In a controlled input, **React holds the pen**. Every keystroke goes to state first, then React writes it back into the box.',
          body: `
A **controlled input** gets its value from state and reports every change back:

\`\`\`
const [draft, setDraft] = useState('')
<input value={draft} onChange={e => setDraft(e.target.value)} />
\`\`\`
React state is the single source of truth — the DOM just displays it. Submitting a form:

\`\`\`
<form onSubmit={e => { e.preventDefault(); add(draft) }}>
\`\`\`
\`preventDefault\` stops the browser's default behavior (a full page reload!).
`,
        },
        {
          kind: 'code',
          lang: 'react',
          title: 'Slay the dragon',
          instructions: `
Build a quest log:
- a \`<form>\` with an \`<input>\` and a submit \`<button>\` labelled \`Add\`. Submitting adds the trimmed text as a new quest (ignore empty input) and clears the input.
- each quest renders as an \`<li>\` containing its text. Clicking the \`<li>\` toggles it done; done items get \`className="done"\`.
- \`<p id="left">N left</p>\` shows how many quests are **not** done.

Type your state: \`useState<{ id: number; text: string; done: boolean }[]>([])\`
`,
          starter: `type Quest = { id: number; text: string; done: boolean }\n\nfunction App() {\n  const [quests, setQuests] = useState<Quest[]>([])\n  const [draft, setDraft] = useState('')\n\n  return (\n    <div>\n      <form>\n        <input />\n        <button>Add</button>\n      </form>\n      <ul></ul>\n      <p id="left"></p>\n    </div>\n  )\n}\n`,
          tests: `const add = async (t) => { await type($('input'), t); await click($('form button')) }
test('starts empty', () => { expect($$('li').length).toBe(0); expect(text('#left')).toBe('0 left') })
test('adds quests', async () => { await add('Learn SQL'); await add('Learn Alembic'); expect($$('li').length).toBe(2); expect(text('#left')).toBe('2 left') })
test('clears the input', () => expect($('input').value).toBe(''))
test('ignores empty', async () => { await add('   '); expect($$('li').length).toBe(2) })
test('toggles done', async () => { await click($$('li')[0]); expect($$('li')[0].className).toBe('done'); expect(text('#left')).toBe('1 left') })
test('toggles back', async () => { await click($$('li')[0]); expect(text('#left')).toBe('2 left') })`,
          hint: "onSubmit: e.preventDefault(); const t = draft.trim(); if (!t) return; setQuests(q => [...q, { id: Date.now(), text: t, done: false }]); setDraft(''). Toggle with map + spread.",
          solution: `type Quest = { id: number; text: string; done: boolean }\n\nfunction App() {\n  const [quests, setQuests] = useState<Quest[]>([])\n  const [draft, setDraft] = useState('')\n  const left = quests.filter((q) => !q.done).length\n\n  function add(e: { preventDefault: () => void }) {\n    e.preventDefault()\n    const text = draft.trim()\n    if (!text) return\n    setQuests((q) => [...q, { id: Date.now() + Math.random(), text, done: false }])\n    setDraft('')\n  }\n\n  function toggle(id: number) {\n    setQuests((q) => q.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))\n  }\n\n  return (\n    <div>\n      <form onSubmit={add}>\n        <input value={draft} onChange={(e) => setDraft(e.target.value)} />\n        <button>Add</button>\n      </form>\n      <ul>\n        {quests.map((q) => (\n          <li key={q.id} className={q.done ? 'done' : ''} onClick={() => toggle(q.id)}>\n            {q.text}\n          </li>\n        ))}\n      </ul>\n      <p id="left">{left} left</p>\n    </div>\n  )\n}\n`,
        },
      ],
    },
  ],
  comingSoon: [
    'Custom hooks: extract & reuse logic',
    'Fetching data (loading/error states, React Query)',
    'Context: avoiding prop drilling',
    'useReducer for complex state',
    'Performance: memo, useMemo, useCallback (and when NOT to)',
    'Routing with React Router',
    'Testing components with React Testing Library',
    'Next.js & server components',
  ],
}
