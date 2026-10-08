import type { Realm } from '../types'

export const javascript: Realm = {
  id: 'js',
  name: 'Variable Village',
  topic: 'JavaScript Fundamentals',
  icon: '🏘️',
  color: '#f7df1e',
  when: 'Month 1',
  blurb: 'Rebuild your JS foundation without autocomplete doing the thinking: values, control flow, arrays, objects, closures.',
  lessons: [
    {
      id: 'js-1',
      title: 'Boot Up: Values & Variables',
      minutes: 10,
      steps: [
        {
          kind: 'concept',
          title: 'Boxes with labels',
          eli5: "A variable is a **labeled box**. You put a value in it and use the label to find it later. `const` = the label is glued on. `let` = you can swap what's inside.",
          body: `
A **variable** is a name that points to a value. JavaScript has a handful of value types:

- \`number\` — \`42\`, \`3.14\` (one type for both!)
- \`string\` — \`"hi"\`, \`'hi'\`, or a *template literal* in backticks that embeds values with \`\${...}\`
- \`boolean\` — \`true\` / \`false\`
- \`undefined\` (nothing assigned yet) and \`null\` (deliberately empty)
- \`object\` — everything else: arrays, functions, \`{ key: value }\`

## let vs const
\`\`\`
const name = 'Carter'  // can't be reassigned
let hp = 100           // can be reassigned
hp = hp - 10
\`\`\`
> Rule of thumb: use \`const\` by default. Reach for \`let\` only when the value must change. Never use \`var\` (it ignores block scope — a classic bug source).
`,
        },
        {
          kind: 'quiz',
          prompt: 'What happens when this runs?',
          code: `const items = ['sword']\nitems.push('shield')\nconsole.log(items)`,
          options: ['TypeError: Assignment to constant variable', "['sword', 'shield']", "['sword']", 'undefined'],
          answer: 1,
          explain:
            "`const` means the *variable* can't be re-pointed to a new value. The array it points to can still be changed (mutated). `items = []` would throw; `items.push()` is fine.",
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your first function',
          instructions: `
Write a function \`greet(name)\` that **returns** the string \`Hello, <name>!\`.

Use a *template literal*: wrap the text in backticks and drop the name in with \`\${name}\`. Click **Run** to execute the tests.
`,
          starter: `function greet(name) {\n  // return something here\n}\n\nconsole.log(greet('Carter'))\n`,
          tests: `test("greet('Carter') returns 'Hello, Carter!'", () => expect(greet('Carter')).toBe('Hello, Carter!'))
test("greet('Ada') returns 'Hello, Ada!'", () => expect(greet('Ada')).toBe('Hello, Ada!'))`,
          hint: 'Inside the function: return `Hello, ${name}!` — note the backticks, not quotes.',
          solution: `function greet(name) {\n  return \`Hello, \${name}!\`\n}\n\nconsole.log(greet('Carter'))\n`,
        },
        {
          kind: 'quiz',
          prompt: 'What does `typeof null` return in JavaScript?',
          options: ["'null'", "'undefined'", "'object'", "'empty'"],
          answer: 2,
          explain:
            "It's a famous bug from the first version of JavaScript in 1995 that can never be fixed without breaking the web. Values were stored with a type tag, and `null` happened to share the tag for objects. Check for null with `x === null`.",
        },
      ],
    },
    {
      id: 'js-2',
      title: 'Control Flow Canyon',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'Making decisions & repeating work',
          eli5: '`if` is a **fork in the road**: go left or right depending on a yes/no question. A loop is a **washing machine cycle**: repeat the same thing until a condition says stop.',
          body: `
\`\`\`
if (hp <= 0) {
  console.log('Game over')
} else if (hp < 20) {
  console.log('Low health!')
} else {
  console.log('Fighting fit')
}

for (let i = 0; i < 3; i++) console.log(i)   // 0 1 2
for (const item of ['a', 'b']) console.log(item)
while (enemies > 0) enemies--
\`\`\`
## === not ==
\`==\` converts types before comparing (\`'1' == 1\` is \`true\`, \`0 == ''\` is \`true\` 😱). Always use \`===\`.

## The % operator
\`a % b\` is the **remainder** after dividing. \`10 % 3 === 1\`, \`9 % 3 === 0\`. "Divisible by 3" means \`n % 3 === 0\`.
`,
        },
        {
          kind: 'quiz',
          prompt: 'What does this log?',
          code: `let total = 0\nfor (let i = 1; i <= 4; i++) {\n  if (i === 3) continue\n  total += i\n}\nconsole.log(total)`,
          options: ['10', '7', '6', '3'],
          answer: 1,
          explain: '`continue` skips the rest of that iteration. So we add 1 + 2 + 4 = 7.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'FizzBuzz (the interview classic)',
          instructions: `
Write \`fizzBuzz(n)\` that returns an **array** of values from 1 to n where:
- multiples of 3 become \`'Fizz'\`
- multiples of 5 become \`'Buzz'\`
- multiples of both become \`'FizzBuzz'\`
- everything else stays a number

\`fizzBuzz(5)\` → \`[1, 2, 'Fizz', 4, 'Buzz']\`
`,
          starter: `function fizzBuzz(n) {\n  const out = []\n  // loop from 1 to n\n  return out\n}\n\nconsole.log(fizzBuzz(15))\n`,
          tests: `test('fizzBuzz(5)', () => expect(fizzBuzz(5)).toEqual([1, 2, 'Fizz', 4, 'Buzz']))
test('15 is FizzBuzz', () => expect(fizzBuzz(15)[14]).toBe('FizzBuzz'))
test('length is n', () => expect(fizzBuzz(30).length).toBe(30))`,
          hint: 'Check the "both" case FIRST (i % 15 === 0), otherwise the % 3 branch will catch 15 before you get there.',
          solution: `function fizzBuzz(n) {\n  const out = []\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) out.push('FizzBuzz')\n    else if (i % 3 === 0) out.push('Fizz')\n    else if (i % 5 === 0) out.push('Buzz')\n    else out.push(i)\n  }\n  return out\n}\n\nconsole.log(fizzBuzz(15))\n`,
        },
      ],
    },
    {
      id: 'js-3',
      title: 'Array Armory: map, filter, reduce',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Transform data without loops',
          eli5: 'Imagine a conveyor belt of fruit. `map` = **paint every fruit**. `filter` = **toss the rotten ones**. `reduce` = **blend them all into one smoothie**.',
          body: `
These three methods are 80% of real-world data wrangling (and React rendering):

\`\`\`
const nums = [1, 2, 3, 4]
nums.map(n => n * 2)              // [2, 4, 6, 8]   — transform each item
nums.filter(n => n % 2 === 0)     // [2, 4]         — keep items that pass
nums.reduce((sum, n) => sum + n, 0) // 10           — boil down to one value
\`\`\`
None of them change the original array — they return a **new** one. That's called being *immutable*, and it's exactly why React likes them.

## How reduce works
\`reduce(fn, start)\` walks the array carrying an *accumulator*: \`0 → 0+1=1 → 1+2=3 → 3+3=6 → 6+4=10\`.
`,
        },
        {
          kind: 'quiz',
          prompt: 'What is the result?',
          code: `[3, 8, 1, 10].filter(n => n > 2).map(n => n * 10)`,
          options: ['[30, 80, 10, 100]', '[30, 80, 100]', '[80, 100]', '[true, true, false, true]'],
          answer: 1,
          explain: 'filter keeps 3, 8, 10 (1 is not > 2), then map multiplies each by 10.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: "Shopkeeper's total",
          instructions: `
A cart is an array of items like \`{ name: 'Potion', price: 5, qty: 3, inStock: true }\`.

Write \`cartTotal(cart)\` that returns the total cost (\`price × qty\`) of **only in-stock items**.
Try to use \`filter\` and \`reduce\` — no \`for\` loops!
`,
          starter: `function cartTotal(cart) {\n  \n}\n\nconst cart = [\n  { name: 'Potion', price: 5, qty: 3, inStock: true },\n  { name: 'Elixir', price: 50, qty: 1, inStock: false },\n  { name: 'Arrow', price: 1, qty: 20, inStock: true },\n]\nconsole.log(cartTotal(cart)) // 35\n`,
          tests: `test('mixed cart = 35', () => expect(cartTotal([
  { name: 'Potion', price: 5, qty: 3, inStock: true },
  { name: 'Elixir', price: 50, qty: 1, inStock: false },
  { name: 'Arrow', price: 1, qty: 20, inStock: true },
])).toBe(35))
test('empty cart = 0', () => expect(cartTotal([])).toBe(0))
test('all out of stock = 0', () => expect(cartTotal([{ name: 'X', price: 9, qty: 9, inStock: false }])).toBe(0))`,
          hint: "cart.filter(i => i.inStock).reduce((sum, i) => sum + i.price * i.qty, 0) — don't forget the 0 starting value or an empty cart breaks.",
          solution: `function cartTotal(cart) {\n  return cart\n    .filter((item) => item.inStock)\n    .reduce((sum, item) => sum + item.price * item.qty, 0)\n}\n`,
        },
      ],
    },
    {
      id: 'js-4',
      title: 'Object Outpost & References',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Objects live somewhere else',
          eli5: 'Numbers are like **photocopies** — give someone a copy and they can scribble on it, yours is fine. Objects are like a **house address** — give someone the address and they can repaint the actual house.',
          body: `
Primitives (numbers, strings, booleans) are **copied** when you assign them. Objects and arrays are not — the variable holds a **reference** (think: an address) to the object in memory.

\`\`\`
let a = 5
let b = a
b++            // a is still 5

const hero = { hp: 100 }
const sameHero = hero   // copies the ADDRESS, not the object
sameHero.hp = 1
console.log(hero.hp)    // 1 😱 — same object!
\`\`\`
To copy an object, spread it: \`const clone = { ...hero }\` (a *shallow* copy — nested objects are still shared).

> This is the #1 reason React state "doesn't update": you mutated the same object, so React sees the same reference and assumes nothing changed.
`,
        },
        {
          kind: 'quiz',
          prompt: 'What does this log?',
          code: `function levelUp(player) {\n  player.level++\n}\nconst p = { level: 1 }\nlevelUp(p)\nconsole.log(p.level)`,
          options: ['1', '2', 'undefined', 'TypeError'],
          answer: 1,
          explain:
            'The function receives a reference to the same object, so `player.level++` changes the original `p`. Functions that do this have *side effects*.',
        },
        {
          kind: 'quiz',
          prompt: 'What does `[1, 2] === [1, 2]` evaluate to?',
          options: ['true', 'false', 'TypeError', 'undefined'],
          answer: 1,
          explain:
            '`===` on objects compares references (addresses), not contents. Two separate arrays live at two different addresses, so they are not equal — even with identical contents.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Word counter',
          instructions: `
Write \`countWords(text)\` that returns an object mapping each **lowercased** word to how many times it appears.

\`countWords('the cat and THE hat')\` → \`{ the: 2, cat: 1, and: 1, hat: 1 }\`

Split on whitespace with \`text.split(/\\s+/)\` and ignore empty strings.
`,
          starter: `function countWords(text) {\n  const counts = {}\n  \n  return counts\n}\n\nconsole.log(countWords('the cat and THE hat'))\n`,
          tests: `test('counts repeated words', () => expect(countWords('the cat and THE hat')).toEqual({ the: 2, cat: 1, and: 1, hat: 1 }))
test('empty string gives {}', () => expect(countWords('')).toEqual({}))
test('extra spaces are ignored', () => expect(countWords('  a  a ')).toEqual({ a: 2 }))`,
          hint: 'for (const w of text.toLowerCase().split(/\\s+/)) { if (!w) continue; counts[w] = (counts[w] ?? 0) + 1 }',
          solution: `function countWords(text) {\n  const counts = {}\n  for (const w of text.toLowerCase().split(/\\s+/)) {\n    if (!w) continue\n    counts[w] = (counts[w] ?? 0) + 1\n  }\n  return counts\n}\n`,
        },
        {
          kind: 'explain',
          prompt: 'In your own words: why does changing `sameHero.hp` also change `hero.hp`? What would you do to avoid it?',
          keyPoints: [
            'Objects are stored by reference',
            'Assignment copies the reference, not the object',
            'Use spread `{ ...obj }` (or structuredClone for deep copies) to make a new object',
          ],
        },
      ],
    },
    {
      id: 'js-5',
      title: 'BOSS: The Closure Hydra',
      boss: true,
      minutes: 20,
      steps: [
        {
          kind: 'concept',
          title: 'Functions remember where they were born',
          eli5: "A closure is a function carrying a **backpack**. When it's created, it stuffs the variables around it into the backpack and keeps them forever.",
          body: `
A **closure** is a function bundled with the variables from the scope where it was created. Even after the outer function returns, the inner function keeps them alive.

\`\`\`
function makeGreeter(greeting) {
  return (name) => \`\${greeting}, \${name}\`   // remembers greeting
}
const hi = makeGreeter('Hi')
hi('Ada')  // 'Hi, Ada'
\`\`\`
Closures power React hooks, event handlers, debounce/throttle, and private state.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Head 1: makeCounter',
          instructions: `
Write \`makeCounter()\` that returns an object with three methods:
- \`increment()\` — adds 1 and returns the new count
- \`decrement()\` — subtracts 1 and returns the new count
- \`value()\` — returns the current count

Each counter must have its **own** private count (no globals!).
`,
          starter: `function makeCounter() {\n  \n}\n\nconst c = makeCounter()\nc.increment()\nc.increment()\nconsole.log(c.value()) // 2\n`,
          tests: `test('increments', () => { const c = makeCounter(); c.increment(); expect(c.increment()).toBe(2) })
test('decrements', () => { const c = makeCounter(); expect(c.decrement()).toBe(-1) })
test('counters are independent', () => { const a = makeCounter(); const b = makeCounter(); a.increment(); expect(b.value()).toBe(0) })`,
          hint: 'Declare `let count = 0` inside makeCounter, then return { increment: () => ++count, ... }.',
          solution: `function makeCounter() {\n  let count = 0\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    value: () => count,\n  }\n}\n`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Head 2: once()',
          instructions: `
Write \`once(fn)\` that returns a new function which calls \`fn\` **only the first time** it's called. Later calls return the first result without calling \`fn\` again.

Real-world use: "initialize the app once", "only submit the payment once".
`,
          starter: `function once(fn) {\n  \n}\n\nconst init = once(() => { console.log('booting...'); return 42 })\nconsole.log(init(), init())\n`,
          tests: `test('returns the first result', () => { const f = once(() => 7); f(); expect(f()).toBe(7) })
test('calls fn only once', () => { let n = 0; const f = once(() => ++n); f(); f(); f(); expect(n).toBe(1) })
test('passes arguments through', () => { const f = once((a, b) => a + b); expect(f(2, 3)).toBe(5) })`,
          hint: 'Keep two closure variables: `let called = false` and `let result`. Use rest args: `(...args) => fn(...args)`.',
          solution: `function once(fn) {\n  let called = false\n  let result\n  return (...args) => {\n    if (!called) {\n      called = true\n      result = fn(...args)\n    }\n    return result\n  }\n}\n`,
        },
        {
          kind: 'quiz',
          prompt: 'Final strike. What does this log?',
          code: `const fns = []\nfor (var i = 0; i < 3; i++) fns.push(() => i)\nconsole.log(fns.map(f => f()))`,
          options: ['[0, 1, 2]', '[3, 3, 3]', '[2, 2, 2]', '[undefined, undefined, undefined]'],
          answer: 1,
          explain:
            "`var` is function-scoped, so all three closures share ONE `i`, which is 3 when they finally run. With `let`, each loop iteration gets its own `i` and you'd get [0, 1, 2]. This is why `var` is banned in modern code.",
        },
      ],
    },
  ],
  comingSoon: [
    'Destructuring, spread & rest',
    'Promises & async/await',
    'Error handling with try/catch',
    'ES modules: import/export',
    'The DOM & events',
    'fetch() and talking to APIs',
    'Classes & prototypes (how `this` really works)',
  ],
}
