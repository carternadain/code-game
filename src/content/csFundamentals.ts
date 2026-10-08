import type { Realm } from '../types'

export const csFundamentals: Realm = {
  id: 'cs',
  name: 'The Engine Room',
  topic: 'How Code Runs (CS Fundamentals)',
  icon: '⚙️',
  glyph: '01',
  color: '#ff8c42',
  when: 'Month 1–2',
  blurb: 'Go behind the curtain: compilers, the call stack, memory, the event loop, and how computers store numbers.',
  lessons: [
    {
      id: 'cs-1',
      title: 'What Is a Program, Really?',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'From text to electricity',
          eli5: 'Your code is a **recipe in English**. The CPU only speaks **robot**. A compiler translates the whole cookbook up front; an interpreter translates one line at a time while cooking.',
          body: `
Your CPU only understands **machine code**: numbered instructions like "add these two registers" or "jump to address 0x4F". Everything else is translation.

## The pipeline (JavaScript in Chrome's V8 engine)
1. **Lexing** — the source text is chopped into *tokens*: \`const\`, \`x\`, \`=\`, \`5\`
2. **Parsing** — tokens become an **AST** (abstract syntax tree): a tree describing the program's structure
3. **Interpreting** — V8's interpreter (Ignition) turns the AST into *bytecode* and runs it immediately
4. **JIT compiling** — functions that run a lot ("hot" code) get compiled to optimized machine code (TurboFan)

## Three strategies
- **Compiled ahead of time** (C, Rust, Go): translate everything to machine code *before* running. Fast, but you rebuild for every platform.
- **Interpreted** (classic Python): read and execute line by line at runtime. Flexible, slower.
- **JIT** (JavaScript, Java, C#): start interpreting, compile hot spots on the fly. Best of both.

> TypeScript is *transpiled*: \`tsc\` checks your types, then deletes them and outputs plain JavaScript. Types never exist at runtime!
`,
        },
        {
          kind: 'quiz',
          prompt: 'You write TypeScript. What actually runs in the browser?',
          options: ['TypeScript, interpreted directly', 'JavaScript, after the types are stripped out', 'WebAssembly', 'Machine code produced by tsc'],
          answer: 1,
          explain:
            "Browsers don't understand TypeScript. The compiler type-checks and then emits JavaScript with the types erased. That's why a type like `User` can't protect you from bad JSON at runtime — you need runtime validation (e.g. zod) for that.",
        },
        {
          kind: 'quiz',
          prompt: 'What is an AST?',
          options: [
            'A tree data structure representing the grammatical structure of your code',
            'A list of CPU instructions',
            'A type of database index',
            'The compiled output of a C program',
          ],
          answer: 0,
          explain:
            'Abstract Syntax Tree. `1 + 2 * 3` becomes a `+` node whose right child is a `*` node. Prettier, ESLint, Babel and TypeScript all work by reading and rewriting ASTs. (Paste code into astexplorer.net to see one!)',
        },
        {
          kind: 'explain',
          prompt: 'Explain the difference between a compiled language and an interpreted one. Where does JavaScript fit?',
          keyPoints: [
            'Compiled: translated to machine code before running',
            'Interpreted: executed on the fly by another program',
            'JavaScript uses a JIT: interprets first, compiles hot code to machine code at runtime',
          ],
        },
      ],
    },
    {
      id: 'cs-2',
      title: 'The Call Stack',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'A stack of plates',
          eli5: 'Every function call puts a **plate on a stack**. You can only work on the top plate. When a function finishes, its plate comes off.',
          body: `
When a function is called, the engine pushes a **stack frame** (its arguments + local variables + where to return to) onto the **call stack**. When it returns, the frame is popped off.

\`\`\`
function a() { b() }
function b() { c() }
function c() { console.trace() }
a()
// stack (top first): c → b → a → (global)
\`\`\`
That's exactly what an error's **stack trace** shows you: the stack at the moment it broke. Read it top to bottom to find where it happened and how you got there.

## Recursion & stack overflow
A function that calls itself adds a frame each time. Forget the **base case** and the stack fills up: \`RangeError: Maximum call stack size exceeded\` — a literal stack overflow.
`,
        },
        {
          kind: 'quiz',
          prompt: 'What order are these logged in?',
          code: `function outer() {\n  console.log('A')\n  inner()\n  console.log('C')\n}\nfunction inner() { console.log('B') }\nouter()`,
          options: ['A B C', 'A C B', 'B A C', 'C B A'],
          answer: 0,
          explain: 'outer() logs A, then pushes inner() onto the stack. inner logs B and is popped. Control returns to the exact spot in outer, which logs C.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Recursion: sum a nested list',
          instructions: `
Write a **recursive** function \`deepSum(arr)\` that adds up every number in an array that can contain nested arrays to any depth.

\`deepSum([1, [2, [3, 4]], 5])\` → \`15\`

Use \`Array.isArray(x)\` to detect a nested array — and call \`deepSum\` on it.
`,
          starter: `function deepSum(arr) {\n  let total = 0\n  for (const x of arr) {\n    \n  }\n  return total\n}\n\nconsole.log(deepSum([1, [2, [3, 4]], 5]))\n`,
          tests: `test('nested', () => expect(deepSum([1, [2, [3, 4]], 5])).toBe(15))
test('flat', () => expect(deepSum([1, 2, 3])).toBe(6))
test('empty arrays', () => expect(deepSum([[], [[]]])).toBe(0))
test('very deep', () => expect(deepSum([[[[[[[10]]]]]]])).toBe(10))`,
          hint: 'if (Array.isArray(x)) total += deepSum(x); else total += x. The base case is a plain number.',
          solution: `function deepSum(arr) {\n  let total = 0\n  for (const x of arr) {\n    total += Array.isArray(x) ? deepSum(x) : x\n  }\n  return total\n}\n`,
        },
      ],
    },
    {
      id: 'cs-3',
      title: 'Stack vs Heap: Where Data Lives',
      minutes: 10,
      steps: [
        {
          kind: 'concept',
          title: 'Two kinds of memory',
          eli5: "The stack is your **desk** (small, tidy, cleared when you're done). The heap is the **warehouse** (huge, for big stuff). A garbage collector is the **janitor** who throws out boxes nobody's using.",
          body: `
- **Stack** — small, fast, organized. Holds stack frames: local primitives and *references*. Freed automatically when a function returns.
- **Heap** — big, flexible, messy. Holds objects, arrays, closures — anything whose size or lifetime isn't known up front.

\`\`\`
function spawn() {
  const level = 1                 // stack
  const hero = { name: 'Ada' }    // the object is on the HEAP;
                                  // 'hero' (a reference) is on the stack
  return hero
}
\`\`\`
## Garbage collection
In C you \`free()\` heap memory yourself. JS, Python, Java use a **garbage collector**: it periodically finds objects that nothing references anymore and reclaims them ("mark and sweep").

> Memory leaks in JS = something still references data you're done with: forgotten event listeners, timers, ever-growing caches, closures holding big objects.
`,
        },
        {
          kind: 'quiz',
          prompt: 'Which one is a classic memory leak in a React app?',
          options: [
            'Using const instead of let',
            'Adding a window event listener in useEffect and never removing it',
            'Creating an array inside a function',
            'Returning JSX from a component',
          ],
          answer: 1,
          explain:
            'The listener (and everything its closure references) stays alive on `window` after the component unmounts. Every mount adds another. Always return a cleanup function from useEffect that removes it.',
        },
        {
          kind: 'quiz',
          prompt: 'When can the garbage collector free an object?',
          options: [
            'When the function that created it returns',
            'When it has not been used for 60 seconds',
            'When nothing reachable references it anymore',
            'Never — you must delete it',
          ],
          answer: 2,
          explain:
            "Reachability is the rule: starting from roots (globals, the current stack), anything the GC can't reach by following references is garbage. An object returned from a function is still reachable, so it survives.",
        },
      ],
    },
    {
      id: 'cs-4',
      title: 'The Event Loop',
      minutes: 18,
      steps: [
        {
          kind: 'concept',
          title: 'One thread, many things happening',
          eli5: "JavaScript is **one chef** in a kitchen. Slow stuff (the oven timer, a delivery) runs in the background, and when it's ready it **waits in line** until the chef's hands are free. Promises get the **VIP line**.",
          body: `
JavaScript runs on **one thread** — it can only do one thing at a time. So how does it wait for network requests without freezing?

1. Your code runs on the **call stack** until the stack is empty.
2. Slow stuff (timers, fetch, file reads) is handed to the browser/Node, which does it in the background.
3. When it's done, a callback is put in a **queue**.
4. The **event loop** checks: is the stack empty? Then run all **microtasks** (Promise callbacks, \`await\` continuations), then ONE **macrotask** (setTimeout, I/O, clicks). Repeat.

\`\`\`
console.log('1')
setTimeout(() => console.log('timeout'), 0)
Promise.resolve().then(() => console.log('promise'))
console.log('2')
// 1, 2, promise, timeout
\`\`\`
Even a 0ms timeout waits for the stack to clear AND all microtasks to finish.

> If you run a heavy loop on the main thread, NOTHING else happens — no clicks, no rendering. That's a "frozen tab". (It's also why this app runs your code in a Web Worker.)
`,
        },
        {
          kind: 'quiz',
          prompt: 'What is the output order?',
          code: `setTimeout(() => console.log('A'), 0)\nconsole.log('B')\nqueueMicrotask(() => console.log('C'))\n;(async () => {\n  console.log('D')\n  await null\n  console.log('E')\n})()\nconsole.log('F')`,
          options: ['B D F C E A', 'B C D E F A', 'A B C D E F', 'B D F A C E'],
          answer: 0,
          explain:
            'Synchronous first: B, D (async functions run synchronously until the first await), F. Then microtasks in order: C, E. Finally the macrotask: A.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Build sleep() and run tasks in sequence',
          instructions: `
1. Write \`sleep(ms)\` that returns a **Promise** that resolves after \`ms\` milliseconds (use \`setTimeout\`).
2. Write \`async function runInOrder(tasks)\` where \`tasks\` is an array of functions that return promises. Run them **one after another** (not in parallel) and return an array of their results.

This is what \`await\` inside a \`for...of\` loop is for.
`,
          starter: `function sleep(ms) {\n  \n}\n\nasync function runInOrder(tasks) {\n  const results = []\n  \n  return results\n}\n\nrunInOrder([\n  () => sleep(30).then(() => 'first'),\n  () => sleep(10).then(() => 'second'),\n]).then(console.log)\n`,
          tests: `test('sleep waits', async () => { const t = Date.now(); await sleep(50); expect(Date.now() - t >= 45).toBe(true) })
test('sleep returns a promise', () => expect(sleep(1) instanceof Promise).toBe(true))
test('runs in order', async () => {
  const log = []
  const r = await runInOrder([
    () => sleep(30).then(() => { log.push('slow'); return 1 }),
    () => sleep(5).then(() => { log.push('fast'); return 2 }),
  ])
  expect(r).toEqual([1, 2])
  expect(log).toEqual(['slow', 'fast'])
})`,
          hint: 'sleep: return new Promise(resolve => setTimeout(resolve, ms)). runInOrder: for (const task of tasks) results.push(await task())',
          solution: `function sleep(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms))\n}\n\nasync function runInOrder(tasks) {\n  const results = []\n  for (const task of tasks) {\n    results.push(await task())\n  }\n  return results\n}\n`,
        },
        {
          kind: 'explain',
          prompt: 'Explain the event loop to a friend: why does `setTimeout(fn, 0)` not run immediately?',
          keyPoints: [
            'JS is single-threaded with one call stack',
            'Callbacks wait in queues until the stack is empty',
            'Microtasks (promises) run before macrotasks (timers)',
          ],
        },
      ],
    },
    {
      id: 'cs-5',
      title: 'BOSS: Bits, Bytes & 0.1 + 0.2',
      boss: true,
      minutes: 20,
      steps: [
        {
          kind: 'concept',
          title: 'Everything is numbers, every number is bits',
          eli5: "A bit is a **light switch**: off (0) or on (1). Line up 8 switches and you can show 256 different patterns — that's a byte. Everything — text, images, emoji — is just patterns of switches.",
          body: `
A **bit** is 0 or 1. A **byte** is 8 bits (256 possible values). Binary works like decimal, but each place is a power of 2:

\`\`\`
13 in binary = 1101
             = 1×8 + 1×4 + 0×2 + 1×1
\`\`\`
**Converting to binary:** repeatedly divide by 2 and collect the remainders, then read them backwards. 13 → r1, 6 → r0, 3 → r1, 1 → r1 → \`1101\`.

## Text is numbers too
\`'A'\` is 65. UTF-8 encodes every character (including 🐉) as 1–4 bytes. That's why \`'🐉'.length === 2\` in JS (it uses UTF-16 internally).

## Why 0.1 + 0.2 !== 0.3
Numbers are stored as 64-bit floating point (IEEE 754). 0.1 in binary is a repeating fraction (like 1/3 in decimal), so it gets rounded. Result: \`0.30000000000000004\`.
> Never store money as floats. Store cents as integers (\`1999\` not \`19.99\`), or use a decimal type in your database.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Write your own toBinary',
          instructions: `
Write \`toBinary(n)\` that converts a non-negative integer to a binary **string** — without using \`toString(2)\`!

\`toBinary(13)\` → \`'1101'\`, \`toBinary(0)\` → \`'0'\`

Then write \`fromBinary(str)\` that goes the other way (no \`parseInt(str, 2)\`!).
`,
          starter: `function toBinary(n) {\n  \n}\n\nfunction fromBinary(str) {\n  \n}\n\nconsole.log(toBinary(13), fromBinary('1101'))\n`,
          tests: `test('toBinary(13)', () => expect(toBinary(13)).toBe('1101'))
test('toBinary(0)', () => expect(toBinary(0)).toBe('0'))
test('toBinary(255)', () => expect(toBinary(255)).toBe('11111111'))
test('fromBinary(1101)', () => expect(fromBinary('1101')).toBe(13))
test('round trip 1000', () => expect(fromBinary(toBinary(1000))).toBe(1000))
test("didn't cheat", () => expect(/toString\\(2\\)|parseInt/.test(toBinary.toString() + fromBinary.toString())).toBe(false))`,
          hint: 'toBinary: while (n > 0) { bits = (n % 2) + bits; n = Math.floor(n / 2) }. fromBinary: for each char, value = value * 2 + Number(char).',
          solution: `function toBinary(n) {\n  if (n === 0) return '0'\n  let bits = ''\n  while (n > 0) {\n    bits = (n % 2) + bits\n    n = Math.floor(n / 2)\n  }\n  return bits\n}\n\nfunction fromBinary(str) {\n  let value = 0\n  for (const ch of str) value = value * 2 + Number(ch)\n  return value\n}\n`,
        },
        {
          kind: 'quiz',
          prompt: 'How many different values can 1 byte hold?',
          options: ['8', '128', '255', '256'],
          answer: 3,
          explain: "2⁸ = 256 values: 0 through 255. That's why colors are #00–#FF per channel and why old games had a level-256 glitch.",
        },
        {
          kind: 'quiz',
          prompt: 'A checkout shows $0.30000000000000004. Best fix?',
          options: [
            'Use Math.round on the final total',
            'Store and compute prices as integer cents',
            'Use toFixed(2) everywhere',
            "Switch to Python, it doesn't have this problem",
          ],
          answer: 1,
          explain:
            "Integers are exact in floating point (up to 2⁵³). Do all math in cents and only format as dollars for display. (Python has the exact same float issue — it's the hardware format.)",
        },
      ],
    },
  ],
  comingSoon: [
    'How the internet works: packets, IP, TCP',
    'Processes vs threads (and why Node is single-threaded)',
    'Character encoding: ASCII, Unicode, UTF-8',
    'How Git stores data (blobs, trees, commits)',
    'Operating systems 101: files, memory, scheduling',
    'Compilers deep dive: build a tiny tokenizer',
  ],
}
