import type { Realm } from '../types'

export const typescript: Realm = {
  id: 'ts',
  name: 'Type Fortress',
  topic: 'TypeScript',
  icon: '🏰',
  color: '#3178c6',
  when: 'Month 2',
  blurb: 'Let the compiler catch your bugs before your users do. Real type-checking: errors block the build, just like CI.',
  lessons: [
    {
      id: 'ts-1',
      title: 'Why Types? (Meet the Compiler)',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'Bugs caught at compile time are free',
          eli5: 'TypeScript is a **spell-checker for your code**. It underlines mistakes *while you type*, instead of your users finding them in production.',
          body: `
JavaScript finds out a value is the wrong type **at runtime** — usually in production, usually at 2am. TypeScript adds a **compile step** that checks types *before* the code runs.

\`\`\`
function area(width: number, height: number): number {
  return width * height
}
area(5, '10')  // ✖ Argument of type 'string' is not assignable to parameter of type 'number'
\`\`\`
## Basic annotations
\`\`\`
let hp: number = 100
let name: string = 'Ada'
let alive: boolean = true
let items: string[] = ['sword']
let maybe: string | null = null   // a union: one OR the other
\`\`\`
TypeScript also **infers** types: \`let hp = 100\` is already \`number\`. Annotate function parameters and return types; let inference do the rest.

> In these challenges, the **Compile & Run** button runs the real TypeScript checker first. Any type error = nothing runs.
`,
        },
        {
          kind: 'code',
          lang: 'typescript',
          title: 'Fix the build',
          instructions: `
This code has **type errors**. Click **Compile & Run** first to see what the compiler says — then fix it.

The function should return the total damage as a **number**: base damage times the multiplier, plus a bonus of 10 if \`critical\` is true.
`,
          starter: `function damage(base: number, multiplier: number, critical: boolean): number {\n  const total = base * multiplier\n  if (critical) {\n    return total + '10'\n  }\n  return total\n}\n\nconst hit: number = damage(20, 1.5, 'yes')\nconsole.log(hit)\n`,
          tests: `test('normal hit', () => expect(damage(20, 2, false)).toBe(40))
test('critical hit adds 10', () => expect(damage(20, 2, true)).toBe(50))
test('returns a number', () => expect(typeof damage(1, 1, true)).toBe('number'))`,
          hint: "Two bugs: '10' is a string (string + number = string concatenation!), and 'yes' isn't a boolean.",
          solution: `function damage(base: number, multiplier: number, critical: boolean): number {\n  const total = base * multiplier\n  if (critical) {\n    return total + 10\n  }\n  return total\n}\n\nconst hit: number = damage(20, 1.5, true)\nconsole.log(hit)\n`,
        },
        {
          kind: 'quiz',
          prompt: 'Your API returns `{ "age": "42" }` but your type says `age: number`. What does TypeScript do at runtime?',
          options: ['Throws a TypeError', 'Converts "42" to 42', 'Nothing — types are erased, the string flows through your code', 'Refuses to compile'],
          answer: 2,
          explain:
            'TypeScript only checks code it can see at compile time. Data from the network is a promise you made to the compiler, not a guarantee. Validate external data at the boundary (zod, valibot, or manual checks).',
        },
      ],
    },
    {
      id: 'ts-2',
      title: 'Interfaces & Optional Fields',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'Describing the shape of objects',
          eli5: 'An interface is a **form template**: "a User must have an id box, a username box, and maybe an email box." TypeScript checks every object fills the form correctly.',
          body: `
\`\`\`
interface Hero {
  id: number
  name: string
  guild?: string          // optional: string | undefined
  readonly createdAt: Date // can't be reassigned
}

type HeroId = number        // a type alias
type Status = 'active' | 'banned' | 'pending'  // a union of string literals
\`\`\`
\`interface\` vs \`type\`: nearly interchangeable for objects. Use \`type\` for unions and aliases. Teams usually pick one style for objects and stick with it.

## Optional chaining & nullish coalescing
\`\`\`
hero.guild?.toUpperCase()   // undefined instead of crashing
hero.guild ?? 'No guild'    // fallback only when null/undefined
\`\`\`
`,
        },
        {
          kind: 'code',
          lang: 'typescript',
          title: 'Typed user profiles',
          instructions: `
1. Define an \`interface User\` with: \`id\` (number), \`username\` (string), optional \`displayName\` (string), and \`role\` which is one of \`'admin' | 'member' | 'guest'\`.
2. Write \`label(user: User): string\` that returns \`displayName\` if set, otherwise \`username\` — and appends \` ⭐\` for admins.

\`label({ id: 1, username: 'ada', role: 'admin' })\` → \`'ada ⭐'\`
`,
          starter: `// 1. interface User { ... }\n\nfunction label(user: User): string {\n  \n}\n\nconsole.log(label({ id: 1, username: 'ada', role: 'admin' }))\n`,
          tests: `test('admin with no display name', () => expect(label({ id: 1, username: 'ada', role: 'admin' })).toBe('ada ⭐'))
test('member with display name', () => expect(label({ id: 2, username: 'bob', displayName: 'Bobby', role: 'member' })).toBe('Bobby'))
test('guest', () => expect(label({ id: 3, username: 'x', role: 'guest' })).toBe('x'))`,
          hint: "const name = user.displayName ?? user.username; return user.role === 'admin' ? name + ' ⭐' : name",
          solution: `interface User {\n  id: number\n  username: string\n  displayName?: string\n  role: 'admin' | 'member' | 'guest'\n}\n\nfunction label(user: User): string {\n  const name = user.displayName ?? user.username\n  return user.role === 'admin' ? \`\${name} ⭐\` : name\n}\n`,
        },
      ],
    },
    {
      id: 'ts-3',
      title: 'Unions & Narrowing',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Discriminated unions: the most useful TS pattern',
          eli5: "Like **labeled envelopes**: check the label (`kind`) first, and then you know exactly what's inside.",
          body: `
Give each variant a literal \`kind\` field, and TypeScript can figure out which one you have:

\`\`\`
type Result =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; data: string[] }

function render(r: Result) {
  switch (r.kind) {
    case 'loading': return 'Spinner'
    case 'error':   return r.message       // TS knows message exists here
    case 'success': return r.data.join(',') // and data exists here
  }
}
\`\`\`
This is called **narrowing**. \`typeof x === 'string'\`, \`Array.isArray(x)\`, \`'key' in obj\` and \`x instanceof Date\` all narrow too.
`,
        },
        {
          kind: 'quiz',
          prompt: 'Inside `if (typeof id === "string") { ... }`, what is the type of `id` if it was declared `id: string | number`?',
          options: ['string | number', 'string', 'number', 'unknown'],
          answer: 1,
          explain: 'The typeof check narrows the union to `string` inside the block, and to `number` in the else branch.',
        },
        {
          kind: 'code',
          lang: 'typescript',
          title: 'Shape areas',
          instructions: `
Define a discriminated union \`Shape\`:
- \`{ kind: 'circle'; radius: number }\`
- \`{ kind: 'rect'; width: number; height: number }\`
- \`{ kind: 'triangle'; base: number; height: number }\`

Write \`area(shape: Shape): number\` using a \`switch\` on \`shape.kind\`. (Circle: \`Math.PI * r * r\`, triangle: \`base * height / 2\`.)
`,
          starter: `type Shape = { kind: 'circle'; radius: number } // add the others with |\n\nfunction area(shape: Shape): number {\n  \n}\n\nconsole.log(area({ kind: 'rect', width: 3, height: 4 }))\n`,
          tests: `test('rect', () => expect(area({ kind: 'rect', width: 3, height: 4 })).toBe(12))
test('triangle', () => expect(area({ kind: 'triangle', base: 10, height: 3 })).toBe(15))
test('circle', () => expect(Math.round(area({ kind: 'circle', radius: 2 }) * 100)).toBe(1257))`,
          hint: "switch (shape.kind) { case 'circle': return Math.PI * shape.radius ** 2; case 'rect': ... }",
          solution: `type Shape =\n  | { kind: 'circle'; radius: number }\n  | { kind: 'rect'; width: number; height: number }\n  | { kind: 'triangle'; base: number; height: number }\n\nfunction area(shape: Shape): number {\n  switch (shape.kind) {\n    case 'circle':\n      return Math.PI * shape.radius ** 2\n    case 'rect':\n      return shape.width * shape.height\n    case 'triangle':\n      return (shape.base * shape.height) / 2\n  }\n}\n`,
        },
      ],
    },
    {
      id: 'ts-4',
      title: 'Generics',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Types as parameters',
          eli5: 'A generic is a **box that remembers what you put in it**. Put in numbers → you get numbers out. Put in strings → strings out. `T` is just "whatever type goes in".',
          body: `
How do you type a function that works on arrays of *anything* but keeps the type? A **generic**: a type variable, usually called \`T\`.

\`\`\`
function last<T>(items: T[]): T | undefined {
  return items[items.length - 1]
}
last([1, 2, 3])        // number | undefined
last(['a', 'b'])       // string | undefined
\`\`\`
You use generics constantly already: \`Array<string>\`, \`Promise<User>\`, \`useState<number>(0)\`, \`Record<string, number>\`.

\`any\` turns the checker OFF. Generics keep it ON. Avoid \`any\`.
`,
        },
        {
          kind: 'code',
          lang: 'typescript',
          title: 'groupBy<T>',
          instructions: `
Write a generic \`groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]>\`.

\`\`\`
groupBy(['apple', 'avocado', 'banana'], s => s[0])
// { a: ['apple', 'avocado'], b: ['banana'] }
\`\`\`
No \`any\` allowed!
`,
          starter: `function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {\n  \n}\n\nconsole.log(groupBy(['apple', 'avocado', 'banana'], (s) => s[0]))\n`,
          tests: `test('groups strings', () => expect(groupBy(['apple', 'avocado', 'banana'], (s) => s[0])).toEqual({ a: ['apple', 'avocado'], b: ['banana'] }))
test('groups objects', () => expect(groupBy([{ c: 'mage', n: 1 }, { c: 'tank', n: 2 }, { c: 'mage', n: 3 }], (h) => h.c).mage.length).toBe(2))
test('empty', () => expect(groupBy([], (x) => String(x))).toEqual({}))`,
          hint: 'const out: Record<string, T[]> = {}; for (const item of items) { const k = keyFn(item); (out[k] ??= []).push(item) }',
          solution: `function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {\n  const out: Record<string, T[]> = {}\n  for (const item of items) {\n    const key = keyFn(item)\n    if (!out[key]) out[key] = []\n    out[key].push(item)\n  }\n  return out\n}\n`,
        },
      ],
    },
    {
      id: 'ts-5',
      title: 'BOSS: The Result Type',
      boss: true,
      minutes: 20,
      steps: [
        {
          kind: 'concept',
          title: 'Errors as values',
          eli5: 'Instead of a function that might **explode** (throw), it hands you a **gift box** that\'s labeled either "✅ here\'s your value" or "❌ here\'s what went wrong". You must check the label before opening.',
          body: `
Exceptions are invisible in a function's type — nothing tells you \`parse()\` might throw. A **Result type** makes failure part of the signature, so the compiler forces callers to handle it:

\`\`\`
type Result<T> = { ok: true; value: T } | { ok: false; error: string }
\`\`\`
Rust and Go are built around this idea. In TS it's a generic + a discriminated union.
`,
        },
        {
          kind: 'code',
          lang: 'typescript',
          title: 'Validate a sign-up form',
          instructions: `
1. Define \`type Result<T> = { ok: true; value: T } | { ok: false; error: string }\`
2. Write \`parseAge(input: string): Result<number>\` — fails with \`'not a number'\` if it isn't an integer, \`'too young'\` if under 13, \`'invalid age'\` if over 120.
3. Write \`parseUsername(input: string): Result<string>\` — trims it; fails with \`'too short'\` if under 3 characters.
`,
          starter: `// type Result<T> = ...\n\nfunction parseAge(input: string): Result<number> {\n  \n}\n\nfunction parseUsername(input: string): Result<string> {\n  \n}\n\nconst r = parseAge('42')\nif (r.ok) console.log('age', r.value)\nelse console.log('error', r.error)\n`,
          tests: `test('valid age', () => expect(parseAge('42')).toEqual({ ok: true, value: 42 }))
test('not a number', () => expect(parseAge('abc')).toEqual({ ok: false, error: 'not a number' }))
test('decimal is not an integer', () => expect(parseAge('4.5')).toEqual({ ok: false, error: 'not a number' }))
test('too young', () => expect(parseAge('9')).toEqual({ ok: false, error: 'too young' }))
test('too old', () => expect(parseAge('200')).toEqual({ ok: false, error: 'invalid age' }))
test('username trimmed', () => expect(parseUsername('  ada  ')).toEqual({ ok: true, value: 'ada' }))
test('username too short', () => expect(parseUsername(' a ')).toEqual({ ok: false, error: 'too short' }))`,
          hint: "const n = Number(input); if (!Number.isInteger(n) || input.trim() === '') return { ok: false, error: 'not a number' }",
          solution: `type Result<T> = { ok: true; value: T } | { ok: false; error: string }\n\nfunction parseAge(input: string): Result<number> {\n  const n = Number(input)\n  if (input.trim() === '' || !Number.isInteger(n)) return { ok: false, error: 'not a number' }\n  if (n < 13) return { ok: false, error: 'too young' }\n  if (n > 120) return { ok: false, error: 'invalid age' }\n  return { ok: true, value: n }\n}\n\nfunction parseUsername(input: string): Result<string> {\n  const name = input.trim()\n  if (name.length < 3) return { ok: false, error: 'too short' }\n  return { ok: true, value: name }\n}\n`,
        },
      ],
    },
  ],
  comingSoon: [
    'Utility types: Partial, Pick, Omit, Record',
    'Typing async code & API responses',
    'Runtime validation with zod',
    'tsconfig.json explained (strict mode!)',
    'Type guards & assertion functions',
    'keyof, typeof & mapped types',
  ],
}
