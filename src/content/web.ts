import type { Lesson, Realm } from '../types'
import { FAKE_API } from './fakeServer'

/** Async JavaScript, HTTP, JSON and calling APIs. Sits between TypeScript and React. */
export const web: Realm = {
  id: 'web',
  name: 'Signal Tower',
  topic: 'Async, HTTP & APIs',
  icon: '📡',
  glyph: 'API',
  color: '#00a8a8',
  when: 'Month 2',
  blurb: 'Promises, async/await, fetch, JSON and HTTP: how your code talks to servers, and what to do when they are slow or broken.',
  lessons: [
    // ─────────────────────────────────────────────── web-1
    {
      id: 'web-1',
      title: 'Promises: an IOU for a Value Later',
      minutes: 12,
      uses: ['cs-4', 'cs-2', 'js-b7'],
      steps: [
        {
          kind: 'concept',
          title: 'Why JavaScript needs promises',
          eli5: 'A promise is the **buzzer a burger shop gives you**. You don\'t stand at the counter blocking everyone. You get a buzzer (the promise), sit down, chat with friends, and when it buzzes your food (the value) is ready. Or it buzzes red: "sorry, out of burgers" (an error).',
          body: `
Remember the event loop (cs-4)? JavaScript has **one thread**. If it stood still waiting 2 seconds for a server, the whole page would freeze. No clicks, no scrolling.

So slow things (timers, network) happen **in the background**, and you get told when they're done.

## The old way: callbacks
"Here's a function. Call it when you're done."
\`\`\`
setTimeout(() => console.log('done!'), 1000)
\`\`\`
Fine for one step. Ten steps deep, it turns into a pyramid of nested functions nobody can read.

## The new way: a Promise
A **Promise** is an object that stands for "a value that isn't here *yet*". It is always in one of **3 states**:
- **pending**: still waiting (the buzzer is on the table)
- **fulfilled**: done, here's the value (buzz! food)
- **rejected**: it failed, here's the error (red buzz)

Once a promise is fulfilled or rejected, it is **settled** and never changes again.

## Making one and using one
\`\`\`
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

wait(1000).then(() => console.log('1 second later'))
\`\`\`
- \`new Promise(...)\` gives you a \`resolve\` function. Call it to say "done!".
- (There's also \`reject\`, the 2nd argument, to say "it failed".)
- \`.then(fn)\` = "when it's fulfilled, run fn with the value".
- \`.catch(fn)\` = "if it's rejected, run fn with the error".

> Key idea: code **after** \`.then(...)\` does not wait. Only the function *inside* \`.then\` waits.
`,
        },
        {
          kind: 'visual',
          title: 'A promise goes from pending to fulfilled',
          code: `function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

console.log('order placed')
wait(1000).then(() => console.log('burger!'))
console.log('chatting...')`,
          frames: [
            {
              line: 5,
              caption: 'Normal code runs top to bottom on the **call stack**. Print "order placed".',
              lanes: [
                { title: 'Call stack', layout: 'stack', items: ['main'], highlight: [0] },
                { title: 'Browser (background)', items: [] },
                { title: 'Queue', layout: 'row', items: [] },
                { title: 'Output', items: ['order placed'], highlight: [0] },
              ],
            },
            {
              line: 2,
              caption: '`wait(1000)` creates a Promise in the **pending** state and hands the timer to the browser. It does not wait here.',
              lanes: [
                { title: 'Call stack', layout: 'stack', items: ['main', 'wait(1000)'], highlight: [1] },
                { title: 'Browser (background)', items: ['⏱ timer 1000ms'], highlight: [0] },
                { title: 'Queue', layout: 'row', items: [] },
                { title: 'Output', items: ['order placed', 'promise: ⏳ pending'], highlight: [1] },
              ],
            },
            {
              line: 6,
              caption: '`.then(...)` just **saves** the callback for later: "when this promise is fulfilled, run this".',
              lanes: [
                { title: 'Call stack', layout: 'stack', items: ['main'] },
                { title: 'Browser (background)', items: ['⏱ timer 1000ms', 'saved: () => log("burger!")'], highlight: [1] },
                { title: 'Queue', layout: 'row', items: [] },
                { title: 'Output', items: ['order placed', 'promise: ⏳ pending'] },
              ],
            },
            {
              line: 7,
              caption: 'JavaScript keeps going! "chatting..." prints **before** the burger. The page stays responsive.',
              lanes: [
                { title: 'Call stack', layout: 'stack', items: ['main'], highlight: [0] },
                { title: 'Browser (background)', items: ['⏱ timer 1000ms', 'saved: () => log("burger!")'] },
                { title: 'Queue', layout: 'row', items: [] },
                { title: 'Output', items: ['order placed', 'promise: ⏳ pending', 'chatting...'], highlight: [2] },
              ],
            },
            {
              caption: '1 second later the timer fires and calls `resolve()`. The promise is now **fulfilled**. Its `.then` callback joins the queue.',
              lanes: [
                { title: 'Call stack', layout: 'stack', items: [] },
                { title: 'Browser (background)', items: [] },
                { title: 'Queue', layout: 'row', items: ['() => log("burger!")'], highlight: [0] },
                { title: 'Output', items: ['order placed', 'promise: ✔ fulfilled', 'chatting...'], highlight: [1] },
              ],
            },
            {
              line: 6,
              caption: 'The stack is empty, so the event loop moves the callback onto the stack. "burger!" prints last.',
              lanes: [
                { title: 'Call stack', layout: 'stack', items: ['() => log("burger!")'], highlight: [0] },
                { title: 'Browser (background)', items: [] },
                { title: 'Queue', layout: 'row', items: [] },
                { title: 'Output', items: ['order placed', 'promise: ✔ fulfilled', 'chatting...', 'burger!'], highlight: [3] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'What does this print, in order?',
          code: `console.log('A')
wait(100).then(() => console.log('B'))
console.log('C')`,
          options: ['A B C', 'A C B', 'B A C', 'A C (B never prints)'],
          answer: 1,
          explain: '`.then` only saves the callback. JavaScript carries on and prints C right away. B prints 100ms later, when the promise is fulfilled.',
        },
        {
          kind: 'quiz',
          prompt: 'Spot the bug. What gets logged?',
          code: `const value = wait(100).then(() => 5)
console.log(value)`,
          options: ['5', 'undefined', 'Promise { <pending> }', 'An error'],
          answer: 2,
          explain:
            "`value` is the **buzzer**, not the burger. The 5 doesn't exist yet when line 2 runs. To use it, go inside: `wait(100).then(() => 5).then((n) => console.log(n))`. Next lesson, `await` makes this much nicer.",
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Guided: build wait(ms)',
          instructions: `
Write \`wait(ms)\` that returns a **Promise** which is fulfilled after \`ms\` milliseconds.

Follow the comments. The pattern is:
\`\`\`
return new Promise((resolve) => {
  // call resolve when you're done
})
\`\`\`
\`setTimeout(resolve, ms)\` calls \`resolve\` for you after \`ms\` milliseconds.
`,
          starter: `function wait(ms) {
  // 1. return a new Promise
  // 2. its function gets "resolve" as an input
  // 3. inside, use setTimeout to call resolve after ms milliseconds
}

wait(500).then(() => console.log('half a second later!'))
`,
          tests: `test('wait returns a Promise', () => expect(wait(1) instanceof Promise).toBe(true))
test('wait(60) takes about 60ms', async () => {
  const start = performance.now()
  await wait(60)
  expect(performance.now() - start).toBeGreaterThan(50)
})`,
          hint: 'return new Promise((resolve) => setTimeout(resolve, ms))',
          solution: `function wait(ms) {
  // 1. return a new Promise
  // 2. its function gets "resolve" as an input
  // 3. inside, use setTimeout to call resolve after ms milliseconds
  return new Promise((resolve) => setTimeout(resolve, ms))
}

wait(500).then(() => console.log('half a second later!'))
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your turn: delayedValue(value, ms)',
          instructions: `
Write \`delayedValue(value, ms)\` that returns a Promise which, after \`ms\` milliseconds, is **fulfilled with \`value\`**.

\`\`\`
delayedValue('gold', 100).then((v) => console.log(v)) // 'gold' (after 100ms)
\`\`\`
Whatever you pass to \`resolve(...)\` becomes the value that \`.then\` receives.

Right now it hands the value back instantly, with no promise at all. Fix it.
`,
          starter: `function delayedValue(value, ms) {
  return value
}

delayedValue('gold', 100).then((v) => console.log(v))
`,
          tests: `test('returns a Promise', () => expect(delayedValue(1, 1) instanceof Promise).toBe(true))
test('is fulfilled with the value', async () => expect(await delayedValue('gold', 5)).toBe('gold'))
test('works with objects', async () => expect(await delayedValue({ hp: 10 }, 5)).toEqual({ hp: 10 }))
test('waits ms first', async () => {
  const start = performance.now()
  await delayedValue('x', 60)
  expect(performance.now() - start).toBeGreaterThan(50)
})
test('can be chained with .then', async () => expect(await delayedValue(2, 5).then((n) => n * 10)).toBe(20))`,
          hint: 'Like wait, but call resolve WITH the value: setTimeout(() => resolve(value), ms)',
          solution: `function delayedValue(value, ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}

delayedValue('gold', 100).then((v) => console.log(v))
`,
        },
      ],
    },

    // ─────────────────────────────────────────────── web-2
    {
      id: 'web-2',
      title: 'async/await: Async Code That Reads Top to Bottom',
      minutes: 15,
      uses: ['web-1', 'cs-4', 'js-3'],
      steps: [
        {
          kind: 'concept',
          title: 'await = "pause this recipe until it\'s ready"',
          eli5: 'A chef is making soup. The water has to boil. With `await`, the chef **puts a bookmark in the soup recipe** and goes to chop salad for another order. When the water boils, the chef comes back to the bookmark and continues. Nobody stands staring at the pot.',
          body: `
\`.then\` chains work, but they get messy. \`async\`/\`await\` lets you write the same thing like normal top-to-bottom code:
\`\`\`
// with .then
function loadHero() {
  return getHero(1).then((hero) => hero.name)
}

// with await: same thing, easier to read
async function loadHero() {
  const hero = await getHero(1)
  return hero.name
}
\`\`\`
## The rules
- \`await\` only works inside a function marked \`async\`.
- \`await somePromise\` **pauses just this function** until the promise settles, then gives you the value.
- The rest of the program keeps running. The page does **not** freeze.
- An \`async\` function **always returns a Promise**. Even \`return 5\` becomes a promise of 5.

## Errors: try / catch
If the awaited promise is **rejected**, \`await\` throws. Catch it like any other error:
\`\`\`
try {
  const hero = await getHero(99)
} catch (err) {
  console.log('Could not load:', err.message)
}
\`\`\`
## One after another vs all at once
\`\`\`
// sequential: 100 + 100 + 100 = 300ms
const a = await getItem(1)
const b = await getItem(2)
const c = await getItem(3)

// parallel: start all 3, then wait for all: ~100ms
const [a, b, c] = await Promise.all([getItem(1), getItem(2), getItem(3)])
\`\`\`
\`Promise.all\` takes an array of promises and gives back **one** promise of an array of results, **in the same order**. If any one rejects, the whole thing rejects.

> Use sequential when step 2 needs the result of step 1. Use \`Promise.all\` when the jobs don't depend on each other.
`,
        },
        {
          kind: 'visual',
          title: 'Sequential vs parallel: a timeline',
          frames: [
            {
              caption: "Three jobs, each takes **100ms**. They don't depend on each other. Let's race two styles.",
              lanes: [
                { title: 'Time', layout: 'row', items: ['0ms', '100ms', '200ms', '300ms'], highlight: [0] },
                { title: 'Sequential (await, await, await)', items: [] },
                { title: 'Parallel (Promise.all)', items: [] },
              ],
            },
            {
              caption: 'Sequential: `await getItem(1)` waits the full 100ms before even **starting** job 2. Parallel: all 3 start at once.',
              lanes: [
                { title: 'Time', layout: 'row', items: ['0ms', '100ms', '200ms', '300ms'], highlight: [0] },
                { title: 'Sequential (await, await, await)', items: ['job 1 ⏳'], highlight: [0] },
                { title: 'Parallel (Promise.all)', items: ['job 1 ⏳', 'job 2 ⏳', 'job 3 ⏳'], highlight: [0, 1, 2] },
              ],
            },
            {
              caption: 'At 100ms: parallel is **done**, all three results ready. Sequential has finished only job 1 and just started job 2.',
              lanes: [
                { title: 'Time', layout: 'row', items: ['0ms', '100ms', '200ms', '300ms'], highlight: [1] },
                { title: 'Sequential (await, await, await)', items: ['job 1 ✔', 'job 2 ⏳'], highlight: [1] },
                { title: 'Parallel (Promise.all)', items: ['job 1 ✔', 'job 2 ✔', 'job 3 ✔', '🏁 done at 100ms'], highlight: [3] },
              ],
            },
            {
              caption: 'At 200ms: sequential finishes job 2, starts job 3. Still waiting.',
              lanes: [
                { title: 'Time', layout: 'row', items: ['0ms', '100ms', '200ms', '300ms'], highlight: [2] },
                { title: 'Sequential (await, await, await)', items: ['job 1 ✔', 'job 2 ✔', 'job 3 ⏳'], highlight: [2] },
                { title: 'Parallel (Promise.all)', items: ['job 1 ✔', 'job 2 ✔', 'job 3 ✔', '🏁 done at 100ms'] },
              ],
            },
            {
              caption: 'At 300ms sequential is finally done. **3× slower** for the same work. With 10 jobs it would be 10× slower.',
              lanes: [
                { title: 'Time', layout: 'row', items: ['0ms', '100ms', '200ms', '300ms'], highlight: [3] },
                { title: 'Sequential (await, await, await)', items: ['job 1 ✔', 'job 2 ✔', 'job 3 ✔', '🐢 done at 300ms'], highlight: [3] },
                { title: 'Parallel (Promise.all)', items: ['job 1 ✔', 'job 2 ✔', 'job 3 ✔', '🏁 done at 100ms'], highlight: [3] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Each getItem takes 100ms. About how long does load() take?',
          code: `async function load() {
  const a = await getItem(1)
  const b = await getItem(2)
  const c = await getItem(3)
  return [a, b, c]
}`,
          options: ['100ms', '300ms', "0ms, await doesn't wait", 'It never finishes'],
          answer: 1,
          explain:
            'Each `await` waits for its job to finish before the next line even starts the next job. 100 + 100 + 100 = 300ms. `Promise.all` would take about 100ms.',
        },
        {
          kind: 'quiz',
          prompt: 'Spot the bug. What does this print?',
          code: `async function showName() {
  const hero = getHero(1)   // getHero returns a Promise
  console.log(hero.name)
}`,
          options: ["The hero's name", 'undefined', 'A syntax error', 'Promise { <pending> }'],
          answer: 1,
          explain:
            'Forgot `await`! `hero` is the Promise (the buzzer), and a Promise has no `.name`, so you get `undefined`. Fix: `const hero = await getHero(1)`. This is one of the most common async bugs.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Guided: await one thing, then another',
          instructions: `
\`getHero()\` and \`getQuest()\` pretend to talk to a server (each takes 30ms and returns a Promise).

1. Finish \`loadBoth()\`: await the hero, await the quest, return a sentence like \`'Ada takes on Slay the Bug Dragon'\`.
2. Finish \`safeLoad(fn)\`: call \`fn()\` and await it inside a \`try\`. If it works, return the value. If it throws, return \`'Error: ' + err.message\`.
`,
          starter: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// pretend server calls (already done for you)
function getHero() {
  return wait(30).then(() => ({ name: 'Ada' }))
}
function getQuest() {
  return wait(30).then(() => ({ title: 'Slay the Bug Dragon' }))
}

async function loadBoth() {
  // 1. const hero = await getHero()
  // 2. const quest = await ... (you finish it)
  // 3. return \`\${hero.name} takes on \${quest.title}\`
}

async function safeLoad(fn) {
  // try {
  //   return await fn()
  // } catch (err) {
  //   return 'Error: ' + err.message
  // }
}

loadBoth().then(console.log)
`,
          tests: `test('loadBoth returns the sentence', async () => expect(await loadBoth()).toBe('Ada takes on Slay the Bug Dragon'))
test('safeLoad returns the value when it works', async () => expect(await safeLoad(() => wait(5).then(() => 42))).toBe(42))
test('safeLoad catches a rejection', async () => expect(await safeLoad(() => Promise.reject(new Error('boom')))).toBe('Error: boom'))`,
          hint: 'const hero = await getHero(); const quest = await getQuest(); return `${hero.name} takes on ${quest.title}`. For safeLoad, remove the // from the try/catch lines.',
          solution: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// pretend server calls (already done for you)
function getHero() {
  return wait(30).then(() => ({ name: 'Ada' }))
}
function getQuest() {
  return wait(30).then(() => ({ title: 'Slay the Bug Dragon' }))
}

async function loadBoth() {
  const hero = await getHero()
  const quest = await getQuest()
  return \`\${hero.name} takes on \${quest.title}\`
}

async function safeLoad(fn) {
  try {
    return await fn()
  } catch (err) {
    return 'Error: ' + err.message
  }
}

loadBoth().then(console.log)
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your turn: loadAll in parallel',
          instructions: `
\`loadAll(ids, getItem)\` gets an array of ids and a function \`getItem(id)\` that returns a Promise.
It must return (a promise of) an array of all the items, **in the same order as \`ids\`**.

The starter **works**, but it loads them one at a time. 🐢 Make it load them **all at once** with \`Promise.all\`.

Tip: \`ids.map(getItem)\` gives you an array of promises. That's exactly what \`Promise.all\` wants.
`,
          starter: `async function loadAll(ids, getItem) {
  const results = []
  for (const id of ids) {
    results.push(await getItem(id)) // waits for each one before starting the next
  }
  return results
}
`,
          tests: `const slowItem = (ms) => (id) => new Promise((r) => setTimeout(() => r('item' + id), ms))
test('returns all the items', async () => expect(await loadAll([1, 2, 3], slowItem(5))).toEqual(['item1', 'item2', 'item3']))
test('keeps the order of ids', async () => {
  const getItem = (id) => new Promise((r) => setTimeout(() => r(id * 10), (4 - id) * 15))
  expect(await loadAll([1, 2, 3], getItem)).toEqual([10, 20, 30])
})
test('runs them all at the same time', async () => {
  let running = 0
  let most = 0
  const getItem = async (id) => {
    running++
    most = Math.max(most, running)
    await new Promise((r) => setTimeout(r, 20))
    running--
    return id
  }
  await loadAll([1, 2, 3, 4], getItem)
  expect(most).toBe(4)
})
test('3 jobs of 60ms take about 60ms, not 180ms', async () => {
  const start = performance.now()
  await loadAll([1, 2, 3], slowItem(60))
  expect(performance.now() - start).toBeLessThan(150)
})
test('an empty list gives []', async () => expect(await loadAll([], slowItem(5))).toEqual([]))`,
          hint: 'return Promise.all(ids.map(getItem)) — or: const promises = ids.map((id) => getItem(id)); return await Promise.all(promises)',
          solution: `async function loadAll(ids, getItem) {
  // start every job right away, then wait for all of them
  const promises = ids.map((id) => getItem(id))
  return await Promise.all(promises)
}
`,
        },
      ],
    },

    // ─────────────────────────────────────────────── web-3
    {
      id: 'web-3',
      title: 'HTTP: How the Browser Talks to Servers',
      minutes: 14,
      uses: ['web-2', 'js-4', 'js-2'],
      steps: [
        {
          kind: 'concept',
          title: 'Requests and responses',
          eli5: 'HTTP is like **ordering at a drive-thru**. You say *what kind* of thing you want to do ("I\'d like to order", the method), *which item* (the URL), any extra notes ("no pickles", headers) and maybe a filled-in form (the body). The window hands back a **status** ("here you go" or "we\'re out of that") plus your food (the body).',
          body: `
Every time your app talks to a server it sends a **request** and gets back a **response**.

## A request has
- **method**: what you want to do (GET, POST...)
- **URL**: which thing, e.g. \`/api/quests/1\`
- **headers**: extra notes, e.g. \`Content-Type: application/json\`
- **body** (optional): data you send, e.g. a new quest

## A response has
- **status**: a number saying how it went, e.g. \`200\`
- **headers**: notes back from the server
- **body**: the data, usually JSON

## Methods map to CRUD
- **GET** = Read. "Give me the quests." (no body)
- **POST** = Create. "Here's a new quest."
- **PATCH** = Update part of something. "Mark quest 1 done."
- **DELETE** = Delete. "Remove quest 3."

## Status codes: the first digit tells the story
- **2xx success**: \`200 OK\`, \`201 Created\`, \`204 No Content\` (worked, nothing to send back)
- **3xx redirect**: "it moved, look over there"
- **4xx YOU messed up**: \`400 Bad Request\` (bad data), \`401 Unauthorized\` (not logged in), \`404 Not Found\`
- **5xx the SERVER messed up**: \`500 Internal Server Error\`

## JSON: data as text
Requests and responses travel as **text**. JSON is a text format that looks like JS objects:
\`\`\`
const quest = { title: 'Write the Docs', reward: 50 }
const text = JSON.stringify(quest)   // '{"title":"Write the Docs","reward":50}'  (a string!)
const back = JSON.parse(text)        // a real object again
back.reward                          // 50
\`\`\`
> stringify = object → text (to send). parse = text → object (when it arrives).
`,
        },
        {
          kind: 'visual',
          title: 'One round trip',
          frames: [
            {
              caption: 'Your code wants to create a quest. It builds a **request**: method, URL, headers, and the body as JSON text.',
              lanes: [
                { title: 'Browser', items: ['POST /api/quests', 'Content-Type: application/json', 'body: \'{"title":"Docs"}\''], highlight: [0, 1, 2] },
                { title: 'The wire', items: [] },
                { title: 'Server', items: [] },
              ],
            },
            {
              caption: "The request travels over the internet as plain **text**. Objects can't travel, only text can. That's why we stringify.",
              lanes: [
                { title: 'Browser', items: [] },
                { title: 'The wire', items: ['→ POST /api/quests', '→ \'{"title":"Docs"}\''], highlight: [0, 1] },
                { title: 'Server', items: [] },
              ],
            },
            {
              caption: 'The server reads the method + URL to pick what to do, parses the body, and saves the new quest with id 4.',
              lanes: [
                { title: 'Browser', items: [] },
                { title: 'The wire', items: [] },
                { title: 'Server', items: ['POST /api/quests → "create"', 'JSON.parse(body)', 'saved as id 4 ✔'], highlight: [2] },
              ],
            },
            {
              caption: 'The server sends a **response**: status `201 Created` and the new quest as JSON text.',
              lanes: [
                { title: 'Browser', items: [] },
                { title: 'The wire', items: ['← 201 Created', '← \'{"id":4,"title":"Docs"}\''], highlight: [0] },
                { title: 'Server', items: [] },
              ],
            },
            {
              caption: 'The browser checks the status (2xx = success!) and parses the text back into a real object your code can use.',
              lanes: [
                { title: 'Browser', items: ['status 201 → ok ✔', 'JSON.parse(text)', '{ id: 4, title: "Docs" }'], highlight: [2] },
                { title: 'The wire', items: [] },
                { title: 'Server', items: [] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'You ask for `/api/quests/999` and that quest does not exist. Which status should the server send?',
          options: ['200', '404', '500', '201'],
          answer: 1,
          explain:
            "404 Not Found: you (the client) asked for something that isn't there. 4xx means the request was the problem. 500 would mean the server itself crashed.",
        },
        {
          kind: 'quiz',
          prompt: 'Which method + status pair fits "create a new quest" best?',
          options: ['GET → 200', 'DELETE → 204', 'POST → 201', 'PATCH → 404'],
          answer: 2,
          explain:
            'POST creates things, and 201 Created says "done, and here is the new thing". GET reads, PATCH updates, DELETE removes (often with 204 No Content).',
        },
        {
          kind: 'quiz',
          prompt: 'What does this print?',
          code: `const text = JSON.stringify({ reward: 50 })
console.log(typeof text, text.reward)`,
          options: ['object 50', 'string 50', 'string undefined', 'object undefined'],
          answer: 2,
          explain:
            '`JSON.stringify` turns the object into **text**: `\'{"reward":50}\'`. A string has no `.reward`. You need `JSON.parse(text).reward` to get 50 back.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Guided: describeStatus(code)',
          instructions: `
Write \`describeStatus(code)\` that turns a status code into its family:

- 200–299 → \`'success'\`
- 300–399 → \`'redirect'\`
- 400–499 → \`'client error'\`
- 500–599 → \`'server error'\`
- anything else → \`'unknown'\`

The first rule is done for you. Copy its shape for the rest.
`,
          starter: `function describeStatus(code) {
  if (code >= 200 && code < 300) return 'success'
  // 300s → 'redirect'

  // 400s → 'client error'

  // 500s → 'server error'

  // anything else → 'unknown'
}

console.log(describeStatus(404)) // client error
`,
          tests: `test('200 and 204 are success', () => expect([describeStatus(200), describeStatus(204)]).toEqual(['success', 'success']))
test('301 is redirect', () => expect(describeStatus(301)).toBe('redirect'))
test('401 and 404 are client error', () => expect([describeStatus(401), describeStatus(404)]).toEqual(['client error', 'client error']))
test('500 is server error', () => expect(describeStatus(500)).toBe('server error'))
test('42 is unknown', () => expect(describeStatus(42)).toBe('unknown'))`,
          hint: "if (code >= 300 && code < 400) return 'redirect' ... and at the very end: return 'unknown'",
          solution: `function describeStatus(code) {
  if (code >= 200 && code < 300) return 'success'
  // 300s → 'redirect'
  if (code >= 300 && code < 400) return 'redirect'
  // 400s → 'client error'
  if (code >= 400 && code < 500) return 'client error'
  // 500s → 'server error'
  if (code >= 500 && code < 600) return 'server error'
  // anything else → 'unknown'
  return 'unknown'
}

console.log(describeStatus(404)) // client error
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your turn: build a request, read a response',
          instructions: `
No network yet. Just the shapes. This is exactly what \`fetch\` will need next lesson.

1. \`makeRequest(method, url, data)\` returns an object \`{ method, url, headers, body }\`:
   - \`headers\` is \`{ 'Content-Type': 'application/json' }\`
   - \`body\` is \`data\` turned into **JSON text**
   - if \`data\` is \`undefined\` (like a GET), leave \`body\` out (\`undefined\`)
2. \`readResponse(status, text)\` returns \`{ ok, data }\`:
   - \`ok\` is \`true\` for any 2xx status
   - \`data\` is the parsed JSON, or \`null\` if \`text\` is empty (a 204 has no body!)

The starter has 3 bugs. Find them.
`,
          starter: `function makeRequest(method, url, data) {
  return { method, url, body: data }
}

function readResponse(status, text) {
  return { ok: status === 200, data: text }
}
`,
          tests: `test('POST body is JSON text', () => expect(makeRequest('POST', '/api/quests', { title: 'Docs' }).body).toBe('{"title":"Docs"}'))
test('has the JSON Content-Type header', () => expect(makeRequest('POST', '/x', {}).headers).toEqual({ 'Content-Type': 'application/json' }))
test('keeps method and url', () => { const r = makeRequest('PATCH', '/api/quests/1', { done: true }); expect([r.method, r.url]).toEqual(['PATCH', '/api/quests/1']) })
test('GET has no body', () => expect(makeRequest('GET', '/api/quests').body).toBe(undefined))
test('201 is ok and data is parsed', () => expect(readResponse(201, '{"id":4}')).toEqual({ ok: true, data: { id: 4 } }))
test('404 is not ok', () => expect(readResponse(404, '{"error":"nope"}').ok).toBe(false))
test('204 with empty text gives null data', () => expect(readResponse(204, '')).toEqual({ ok: true, data: null }))`,
          hint: 'body: data === undefined ? undefined : JSON.stringify(data). ok: status >= 200 && status < 300. data: text ? JSON.parse(text) : null',
          solution: `function makeRequest(method, url, data) {
  return {
    method,
    url,
    headers: { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
  }
}

function readResponse(status, text) {
  return {
    ok: status >= 200 && status < 300,
    data: text ? JSON.parse(text) : null,
  }
}
`,
        },
      ],
    },

    // ─────────────────────────────────────────────── web-4
    {
      id: 'web-4',
      title: 'fetch: Calling a Real(ish) API',
      minutes: 15,
      uses: ['web-2', 'web-3', 'js-4'],
      steps: [
        {
          kind: 'concept',
          title: 'fetch = send a request, get a Promise of a response',
          eli5: '`fetch` is a **delivery driver**. You give them an address, they come back with a box. Big rule: the driver **always hands you the box**, even if it says "WRONG ADDRESS" inside. *You* have to check the label (`res.ok`) before opening it.',
          body: `
\`\`\`
async function getQuests() {
  const res = await fetch('/api/quests')   // 1. wait for the response to arrive
  const quests = await res.json()          // 2. wait for the body, parse the JSON
  return quests
}
\`\`\`
Two awaits: the status and headers arrive first, the body can take longer.

## What's on the response
- \`res.status\`: the number, e.g. 200 or 404
- \`res.ok\`: \`true\` if the status is 2xx
- \`await res.json()\`: the body, parsed from JSON

## ⚠ THE classic bug
**fetch does NOT reject on 404 or 500.** It only rejects if there was no response at all (offline). A 404 is still "a response", so your code happily carries on with the error body as if it were data.

Always check:
\`\`\`
const res = await fetch(\`/api/quests/\${id}\`)
if (!res.ok) throw new Error(\`Could not load quest \${id}: HTTP \${res.status}\`)
return await res.json()
\`\`\`
## Sending data: POST
\`\`\`
const res = await fetch('/api/quests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Write tests', reward: 100 }),
})
\`\`\`
- \`method\`: default is GET, so say POST
- \`headers\`: tell the server "this body is JSON"
- \`body\`: must be **text**, so \`JSON.stringify\` it

> In these challenges a **pretend server** is running inside the page. Its \`fetch\` behaves like the real one: delays, status codes, JSON.
`,
        },
        {
          kind: 'visual',
          title: 'Why you must check res.ok',
          code: `async function getQuest(id) {
  const res = await fetch(\`/api/quests/\${id}\`)
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
  return await res.json()
}

getQuest(99)`,
          frames: [
            {
              line: 7,
              caption: "We ask for quest **99**. It doesn't exist.",
              lanes: [
                { title: 'Your code', items: ['getQuest(99)'], highlight: [0] },
                { title: 'Server', items: ['quests: 1, 2, 3'] },
                { title: 'res', items: [] },
              ],
            },
            {
              line: 2,
              caption: '`fetch` sends `GET /api/quests/99` and the function pauses at `await`.',
              lanes: [
                { title: 'Your code', items: ['getQuest(99)', '⏳ await fetch(...)'], highlight: [1] },
                { title: 'Server', items: ['quests: 1, 2, 3', '← GET /api/quests/99'], highlight: [1] },
                { title: 'res', items: [] },
              ],
            },
            {
              line: 2,
              caption: 'The server answers **404**. Surprise: the promise is still **fulfilled**, not rejected. A 404 is a perfectly good *response*.',
              lanes: [
                { title: 'Your code', items: ['getQuest(99)', '✔ fetch fulfilled'], highlight: [1] },
                { title: 'Server', items: ['quests: 1, 2, 3', '→ 404 Not Found'], highlight: [1] },
                { title: 'res', items: ['status: 404', 'ok: false', 'body: {"error":"quest 99 not found"}'], highlight: [1] },
              ],
            },
            {
              line: 3,
              caption: 'Our check catches it: `res.ok` is false, so we **throw** a clear error.',
              lanes: [
                { title: 'Your code', items: ['getQuest(99)', '✖ throw Error("HTTP 404")'], highlight: [1] },
                { title: 'Server', items: ['quests: 1, 2, 3'] },
                { title: 'res', items: ['status: 404', 'ok: false'], highlight: [1] },
              ],
            },
            {
              line: 4,
              caption:
                'Without line 3 we\'d return `{ error: "quest 99 not found" }` as if it were a quest. The bug would show up much later, somewhere confusing.',
              lanes: [
                { title: 'Your code', items: ['without the check:', 'quest.title → undefined 🤔'], highlight: [1] },
                { title: 'Server', items: ['quests: 1, 2, 3'] },
                { title: 'res', items: ['status: 404', 'ok: false'] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Quest 99 does not exist (the server answers 404). What happens?',
          code: `async function getQuest(id) {
  const res = await fetch(\`/api/quests/\${id}\`)
  return await res.json()
}

getQuest(99).then((q) => console.log('Got:', q))`,
          options: ['fetch rejects, so nothing is logged', 'It logs Got: { error: "quest 99 not found" }', 'It logs Got: undefined', 'It throws a SyntaxError'],
          answer: 1,
          explain:
            'fetch only rejects when there is no response at all. A 404 still has a JSON body, so the error object is returned as if it were a quest. Always check `res.ok`.',
        },
        {
          kind: 'quiz',
          prompt: 'Spot the bug. The server answers 400 "Body must be a JSON string". Why?',
          code: `await fetch('/api/quests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: { title: 'Write tests' },
})`,
          options: ['POST should be lowercase', 'The body is an object, not JSON text', 'The URL needs an id', 'Content-Type should be text/html'],
          answer: 1,
          explain: "Only text travels over the wire. Wrap it: `body: JSON.stringify({ title: 'Write tests' })`.",
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Guided: getQuests()',
          setup: FAKE_API,
          instructions: `
A pretend server is running. It has this route:
- \`GET /api/quests\` → \`200\` and an array of quests like \`{ id, title, reward, done }\`

Finish \`getQuests()\` so it fetches the list and returns the array. Follow the comments.
`,
          starter: `async function getQuests() {
  // 1. const res = await fetch('/api/quests')
  // 2. const quests = await res.json()
  // 3. return quests
}

getQuests().then((quests) => console.log(quests))
`,
          tests: `test('returns 3 quests', async () => expect((await getQuests()).length).toBe(3))
test('the first quest is the Bug Dragon', async () => expect((await getQuests())[0].title).toBe('Slay the Bug Dragon'))
test('sent GET /api/quests', () => expect(__requests.some((r) => r.method === 'GET' && r.url === '/api/quests')).toBe(true))`,
          hint: "Remove the // from each line. That's it! const res = await fetch('/api/quests'); return await res.json()",
          solution: `async function getQuests() {
  const res = await fetch('/api/quests')
  const quests = await res.json()
  return quests
}

getQuests().then((quests) => console.log(quests))
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your turn: getQuest(id) and createQuest(title, reward)',
          setup: FAKE_API,
          instructions: `
A pretend server is running with these routes:
- \`GET /api/quests/:id\` → \`200\` quest, or \`404 { error }\`
- \`POST /api/quests\` with JSON body \`{ title, reward }\` → \`201\` the new quest, or \`400 { error }\` if the title is empty

1. **getQuest(id)**: if \`res.ok\` is false, **throw an Error** whose message includes the status, e.g. \`Quest 99: HTTP 404\`. Otherwise return the quest.
2. **createQuest(title, reward)**: POST the new quest (method, JSON header, stringified body). Throw if not ok (include the status). Return the created quest.
`,
          starter: `async function getQuest(id) {
  const res = await fetch(\`/api/quests/\${id}\`)
  // TODO: if the response is not ok, throw an Error (include res.status)
  return await res.json()
}

async function createQuest(title, reward) {
  // TODO: POST /api/quests with a JSON body { title, reward }
  // TODO: throw if !res.ok, otherwise return the new quest
}
`,
          tests: `const rejectsWith = async (promise) => { try { await promise } catch (e) { return e } return null }
test('getQuest(1) returns quest 1', async () => expect((await getQuest(1)).title).toBe('Slay the Bug Dragon'))
test('getQuest(99) throws an Error', async () => expect((await rejectsWith(getQuest(99))) instanceof Error).toBe(true))
test('the error message includes 404', async () => expect(String((await rejectsWith(getQuest(99)))?.message)).toContain('404'))
test('createQuest returns the new quest', async () => {
  const q = await createQuest('Refactor the Castle', 120)
  expect([q.id, q.title, q.reward, q.done]).toEqual([4, 'Refactor the Castle', 120, false])
})
test('createQuest sends a POST with JSON', () => {
  const r = __requests.find((x) => x.method === 'POST')
  expect(Boolean(r)).toBe(true)
  expect(r.url).toBe('/api/quests')
  expect(r.headers['Content-Type']).toBe('application/json')
  expect(r.body).toBe(JSON.stringify({ title: 'Refactor the Castle', reward: 120 }))
})
test('the server now has 4 quests', () => expect(__api.quests.length).toBe(4))
test('createQuest with an empty title throws with 400', async () => expect(String((await rejectsWith(createQuest('', 10)))?.message)).toContain('400'))`,
          hint: "if (!res.ok) throw new Error(`Quest ${id}: HTTP ${res.status}`). For the POST: fetch('/api/quests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, reward }) })",
          solution: `async function getQuest(id) {
  const res = await fetch(\`/api/quests/\${id}\`)
  if (!res.ok) throw new Error(\`Quest \${id}: HTTP \${res.status}\`)
  return await res.json()
}

async function createQuest(title, reward) {
  const res = await fetch('/api/quests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, reward }),
  })
  if (!res.ok) throw new Error(\`Could not create quest: HTTP \${res.status}\`)
  return await res.json()
}
`,
        },
      ],
    },

    // ─────────────────────────────────────────────── web-5
    {
      id: 'web-5',
      title: 'When Things Go Wrong: Errors, Retries, Timeouts',
      minutes: 15,
      uses: ['web-4', 'web-2', 'js-2'],
      steps: [
        {
          kind: 'concept',
          title: 'Two very different kinds of failure',
          eli5: "You phone a friend. **No signal at all**: the call never connects (a network error). **They pick up and say \"can't talk, I'm busy\"**: you got an answer, it's just bad news (an HTTP error). If they're busy, try again in a minute, then wait a bit longer. If they say \"wrong number\", calling again won't help.",
          body: `
## 1. Network errors: no response at all
Offline, wrong domain, server unreachable. **fetch rejects** with \`TypeError: Failed to fetch\`. Catch it with \`try/catch\`.

## 2. HTTP errors: a response, but a bad one
The server answered with 4xx or 5xx. fetch **fulfills** and \`res.ok\` is \`false\`. You must check it.

\`\`\`
try {
  const res = await fetch(url)
  if (!res.ok) return \`http error \${res.status}\`   // got an answer, bad news
  return 'ok'
} catch (err) {
  return 'network error'                           // no answer at all
}
\`\`\`
## Retry, but only when it might help
- **5xx** (server hiccup) or a network error: maybe temporary. **Retry.**
- **4xx** (your request is wrong): asking again gets the same answer. **Don't retry.**

## Backoff: wait longer each time
Don't hammer a struggling server. Wait 50ms, then 100ms, then 200ms...
\`\`\`
const delay = 50 * 2 ** (attempt - 1)   // 50, 100, 200, 400...
\`\`\`
## Timeouts
Sometimes a server never answers. Don't make your user wait forever. Race the request against a timer:
\`\`\`
const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timed out')), 5000))
const res = await Promise.race([fetch(url), timeout])
\`\`\`
(In real apps you'd also use \`AbortController\` to cancel the request.)

> And in the UI: always show the user *something*. Loading, error with a "Try again" button, or the data.
`,
        },
        {
          kind: 'visual',
          title: 'Retry with backoff on a flaky server',
          frames: [
            {
              caption: "`fetchWithRetry('/api/flaky', 3)`: up to 3 tries. Attempt 1...",
              lanes: [
                { title: 'Attempts', items: ['#1 GET /api/flaky'], highlight: [0] },
                { title: 'Server says', items: [] },
                { title: 'Decision', items: [] },
              ],
            },
            {
              caption: "**500**: a server error. Might be temporary, so it's worth retrying. Wait **50ms** first.",
              lanes: [
                { title: 'Attempts', items: ['#1 GET /api/flaky'] },
                { title: 'Server says', items: ['500 💥'], highlight: [0] },
                { title: 'Decision', items: ['5xx → retry', '😴 wait 50ms'], highlight: [1] },
              ],
            },
            {
              caption: 'Attempt 2: **500** again. Wait **longer** this time, 100ms. That gives the server room to recover.',
              lanes: [
                { title: 'Attempts', items: ['#1 GET /api/flaky', '#2 GET /api/flaky'], highlight: [1] },
                { title: 'Server says', items: ['500 💥', '500 💥'], highlight: [1] },
                { title: 'Decision', items: ['5xx → retry', '😴 wait 50ms', '5xx → retry', '😴 wait 100ms'], highlight: [3] },
              ],
            },
            {
              caption: 'Attempt 3: **200**! Parse the JSON and return it. The user never knew anything went wrong.',
              lanes: [
                { title: 'Attempts', items: ['#1 GET /api/flaky', '#2 GET /api/flaky', '#3 GET /api/flaky'], highlight: [2] },
                { title: 'Server says', items: ['500 💥', '500 💥', '200 ✔ { ok: true }'], highlight: [2] },
                { title: 'Decision', items: ['5xx → retry', '😴 wait 50ms', '5xx → retry', '😴 wait 100ms', 'ok → return data ✔'], highlight: [4] },
              ],
            },
            {
              caption: 'Compare a **404**: retrying would get the same 404 forever. Give up straight away with a clear error.',
              lanes: [
                { title: 'Attempts', items: ['#1 GET /api/quests/99'], highlight: [0] },
                { title: 'Server says', items: ['404 🚫'], highlight: [0] },
                { title: 'Decision', items: ['4xx → do NOT retry', 'throw Error("HTTP 404")'], highlight: [0, 1] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Which of these responses is worth retrying?',
          options: ['400 Bad Request', '401 Unauthorized', '404 Not Found', '503 Service Unavailable'],
          answer: 3,
          explain:
            '5xx means the server had a problem, which is often temporary. 4xx means your request is wrong. Sending the exact same request again gives the exact same answer.',
        },
        {
          kind: 'quiz',
          prompt: "You're offline. What happens on line 2?",
          code: `try {
  const res = await fetch('https://offline.example/api')
  if (!res.ok) console.log('bad status', res.status)
} catch (err) {
  console.log('caught:', err.message)
}`,
          options: ["It logs 'bad status 0'", "It logs 'caught: Failed to fetch'", 'res.ok is false so nothing logs', 'The page freezes until you go online'],
          answer: 1,
          explain: 'With no response at all, there is no status to check. fetch **rejects** with a TypeError, so we jump straight into catch.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Guided: tell the failures apart',
          setup: FAKE_API,
          instructions: `
A pretend server is running:
- \`/api/quests\` → 200
- \`/api/broken\` → 500
- any unknown route → 404
- \`https://offline.example/...\` → no connection (fetch **rejects**)

Finish \`check(url)\` so it returns:
- \`'ok'\` for a 2xx
- \`'http error 500'\` (or 404, etc.) when \`res.ok\` is false
- \`'network error'\` when fetch itself throws
`,
          starter: `async function check(url) {
  try {
    const res = await fetch(url)
    // 1. if (!res.ok) return \`http error \${res.status}\`
    return 'ok'
  } catch (err) {
    // 2. fetch itself failed (no connection): return 'network error'
  }
}

check('/api/broken').then(console.log)
`,
          tests: `test('/api/quests is ok', async () => expect(await check('/api/quests')).toBe('ok'))
test('/api/broken is http error 500', async () => expect(await check('/api/broken')).toBe('http error 500'))
test('an unknown route is http error 404', async () => expect(await check('/api/nope')).toBe('http error 404'))
test('offline is network error', async () => expect(await check('https://offline.example/quests')).toBe('network error'))`,
          hint: "Remove the // before the if. In catch: return 'network error'",
          solution: `async function check(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return \`http error \${res.status}\`
    return 'ok'
  } catch (err) {
    return 'network error'
  }
}

check('/api/broken').then(console.log)
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your turn: fetchWithRetry(url, tries)',
          setup: FAKE_API,
          instructions: `
A pretend server is running:
- \`/api/flaky\` → 500 the first 2 times, then 200 \`{ ok: true }\`
- \`/api/broken\` → always 500
- \`/api/quests/99\` → 404
- \`https://offline.example/...\` → fetch rejects (network error)

Write \`fetchWithRetry(url, tries = 3)\`. It makes **at most \`tries\` attempts**:
- **2xx** → return the parsed JSON
- **4xx** → throw an Error right away (include the status), **no retry**
- **5xx or network error** → wait, then try again. Wait \`50 * 2 ** (attempt - 1)\` ms (50, 100, 200...)
- out of tries → throw an Error (for a 5xx, include the status)

The starter only tries once. \`wait(ms)\` is there for you.
`,
          starter: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchWithRetry(url, tries = 3) {
  // only one try so far!
  const res = await fetch(url)
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
  return await res.json()
}
`,
          tests: `const rejectsWith = async (promise) => { try { await promise } catch (e) { return e } return null }
const calls = (url) => __requests.filter((r) => r.url === url).length
test('flaky: succeeds on the 3rd try', async () => expect(await fetchWithRetry('/api/flaky', 3)).toEqual({ ok: true }))
test('flaky: made exactly 3 requests', () => expect(calls('/api/flaky')).toBe(3))
test('broken: throws after 3 tries', async () => {
  const err = await rejectsWith(fetchWithRetry('/api/broken', 3))
  expect(err instanceof Error).toBe(true)
  expect(err.message).toContain('500')
  expect(calls('/api/broken')).toBe(3)
})
test('backs off between tries', async () => {
  const start = performance.now()
  await rejectsWith(fetchWithRetry('/api/broken', 3))
  expect(performance.now() - start).toBeGreaterThan(140)
})
test('404: throws without retrying', async () => {
  const err = await rejectsWith(fetchWithRetry('/api/quests/99', 3))
  expect(String(err && err.message)).toContain('404')
  expect(calls('/api/quests/99')).toBe(1)
})
test('offline: retries, then throws', async () => {
  const err = await rejectsWith(fetchWithRetry('https://offline.example/x', 2))
  expect(err instanceof Error).toBe(true)
  expect(calls('https://offline.example/x')).toBe(2)
})`,
          hint: 'Loop for (let attempt = 1; attempt <= tries; attempt++). Wrap ONLY the fetch in try/catch (so your own 4xx throw is not caught). If res.ok return json; if status < 500 throw; otherwise remember the error and, if attempt < tries, await wait(50 * 2 ** (attempt - 1)). After the loop, throw the last error.',
          solution: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchWithRetry(url, tries = 3) {
  let lastError
  for (let attempt = 1; attempt <= tries; attempt++) {
    let res
    try {
      res = await fetch(url)
    } catch (err) {
      lastError = err // network error: worth another try
    }
    if (res && res.ok) return await res.json()
    if (res && res.status < 500) throw new Error(\`HTTP \${res.status} (not retrying)\`)
    if (res) lastError = new Error(\`HTTP \${res.status} after \${attempt} tries\`)
    if (attempt < tries) await wait(50 * 2 ** (attempt - 1))
  }
  throw lastError
}
`,
        },
      ],
    },

    // ─────────────────────────────────────────────── web-6
    {
      id: 'web-6',
      title: 'BOSS: The Quest Board API Client',
      boss: true,
      minutes: 25,
      uses: ['web-4', 'web-5', 'web-3', 'js-4'],
      steps: [
        {
          kind: 'concept',
          title: 'Wrap the wiring in one helper',
          eli5: 'A **TV remote** hides the wiring. You press "volume up", not "send infrared code 0x4F". An API client does the same: your app calls `api.complete(1)`, and all the fetch, headers, JSON and error checks live in one place.',
          body: `
Every call so far repeated the same steps: build the request, stringify, check \`res.ok\`, parse JSON. Put them in **one** helper:
\`\`\`
async function request(method, path, body, headers = {}) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) throw new Error(\`\${method} \${path} failed: HTTP \${res.status}\`)
  if (res.status === 204) return null    // No Content: there is no body!
  return await res.json()
}
\`\`\`
Then each API method is one line.

## Query strings: filters in the URL
\`/api/quests?done=true\` means "GET quests, but only done ones". Everything after \`?\` is \`key=value\` pairs joined with \`&\`.

## 204 No Content
A DELETE often answers **204** with an **empty body**. Calling \`res.json()\` on nothing throws \`SyntaxError: Unexpected end of JSON input\`. Check the status first.

## Auth headers
Private routes want to know who you are. You send a token in a header:
\`\`\`
headers: { Authorization: 'Bearer letmein' }
\`\`\`
No token, or a wrong one, and you get **401 Unauthorized**.
`,
        },
        {
          kind: 'visual',
          title: 'From api calls to HTTP',
          frames: [
            {
              caption: "Your app only sees friendly methods. Here's what each one turns into.",
              lanes: [
                { title: 'Your app calls', items: ['api.list({ done: true })'], highlight: [0] },
                { title: 'HTTP request', items: ['GET /api/quests?done=true'], highlight: [0] },
                { title: 'Response', items: ['200 [ {id: 2, done: true} ]'] },
              ],
            },
            {
              caption: '`create` becomes a POST with a JSON body. The server answers **201 Created** with the new quest.',
              lanes: [
                { title: 'Your app calls', items: ['api.create("Learn fetch", 80)'], highlight: [0] },
                { title: 'HTTP request', items: ['POST /api/quests', 'body: {"title":"Learn fetch","reward":80}'], highlight: [0, 1] },
                { title: 'Response', items: ['201 { id: 4, ... }'] },
              ],
            },
            {
              caption: "`complete` changes one field, so it's a **PATCH** with just `{ done: true }`.",
              lanes: [
                { title: 'Your app calls', items: ['api.complete(1)'], highlight: [0] },
                { title: 'HTTP request', items: ['PATCH /api/quests/1', 'body: {"done":true}'], highlight: [0, 1] },
                { title: 'Response', items: ['200 { id: 1, done: true }'] },
              ],
            },
            {
              caption: "`remove` is a **DELETE**. The answer is **204** with no body. Don't call `.json()` on it!",
              lanes: [
                { title: 'Your app calls', items: ['api.remove(3)'], highlight: [0] },
                { title: 'HTTP request', items: ['DELETE /api/quests/3'], highlight: [0] },
                { title: 'Response', items: ['204 (empty)', 'return null'], highlight: [0, 1] },
              ],
            },
            {
              caption: '`me` sends the token in an `Authorization` header. Right token → 200. Wrong one → 401.',
              lanes: [
                { title: 'Your app calls', items: ['api.me("letmein")'], highlight: [0] },
                { title: 'HTTP request', items: ['GET /api/me', 'Authorization: Bearer letmein'], highlight: [1] },
                { title: 'Response', items: ['200 { name: "Ada" }'] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'The DELETE worked (status 204). Why does this still throw?',
          code: `const res = await fetch('/api/quests/3', { method: 'DELETE' })
if (!res.ok) throw new Error('HTTP ' + res.status)
return await res.json()`,
          options: [
            'DELETE needs a body',
            '204 means "No Content": the body is empty, so res.json() has nothing to parse',
            '204 is an error code',
            'fetch cannot send DELETE',
          ],
          answer: 1,
          explain: 'Parsing an empty string as JSON throws `SyntaxError: Unexpected end of JSON input`. Check `res.status === 204` and return `null` instead.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Step 1: the request() helper',
          setup: FAKE_API,
          instructions: `
A pretend server is running with \`/api/quests\` (GET, POST), \`/api/quests/:id\` (GET, PATCH, DELETE).

Finish \`request(method, path, body, headers = {})\`:
1. Call \`fetch(path, { method, headers, body })\`:
   - headers: \`'Content-Type': 'application/json'\` plus any extra \`headers\` passed in (spread them: \`...headers\`)
   - body: \`JSON.stringify(body)\`, but only if \`body\` is not \`undefined\`
2. If \`!res.ok\`, throw an Error. Include the status **and** the server's error message (it's in the JSON body as \`error\`), e.g. \`HTTP 404: quest 99 not found\`.
3. If the status is \`204\`, return \`null\`.
4. Otherwise return the parsed JSON.
`,
          starter: `async function request(method, path, body, headers = {}) {
  const res = await fetch(path, { method })
  // TODO: send the JSON header (+ extra headers) and the stringified body
  // TODO: if !res.ok, read (await res.json()).error and throw an Error with status + message
  // TODO: if status is 204 return null
  return await res.json()
}
`,
          tests: `const rejectsWith = async (promise) => { try { await promise } catch (e) { return e } return null }
test('GET returns the list', async () => expect((await request('GET', '/api/quests')).length).toBe(3))
test('POST sends JSON and returns the new quest', async () => expect((await request('POST', '/api/quests', { title: 'Boss', reward: 999 })).id).toBe(4))
test('sends the JSON Content-Type', () => expect(__requests.find((r) => r.method === 'POST').headers['Content-Type']).toBe('application/json'))
test('passes extra headers through', async () => {
  await request('GET', '/api/quests/1', undefined, { 'X-Hero': 'Ada' })
  expect(__requests[__requests.length - 1].headers['X-Hero']).toBe('Ada')
})
test('DELETE (204) returns null', async () => expect(await request('DELETE', '/api/quests/3')).toBe(null))
test('404 throws with the status and the server message', async () => {
  const err = await rejectsWith(request('GET', '/api/quests/99'))
  expect(String(err && err.message)).toContain('404')
  expect(String(err && err.message)).toContain('quest 99 not found')
})`,
          hint: "fetch(path, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body) }). On error: const data = await res.json(); throw new Error(`HTTP ${res.status}: ${data.error}`)",
          solution: `async function request(method, path, body, headers = {}) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(\`HTTP \${res.status}: \${data.error}\`)
  }
  if (res.status === 204) return null
  return await res.json()
}
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'BOSS: build the api object',
          setup: FAKE_API,
          instructions: `
A pretend server is running:
- \`GET /api/quests\` (add \`?done=true\` or \`?done=false\` to filter)
- \`POST /api/quests\` body \`{ title, reward }\` → 201
- \`PATCH /api/quests/:id\` body \`{ done: true }\` → 200 the updated quest
- \`DELETE /api/quests/:id\` → 204 (no body), or 404
- \`GET /api/me\` with header \`Authorization: 'Bearer <token>'\` → \`{ name }\`, or 401 (the right token is \`letmein\`)

Your \`request\` helper from step 1 is ready. Fill in the \`api\` methods. Each should be short.
- \`list(filter)\`: no filter → all quests. \`list({ done: true })\` → \`GET /api/quests?done=true\`
- \`create(title, reward)\` → the new quest
- \`complete(id)\` → the updated quest
- \`remove(id)\` → \`null\`
- \`me(token)\` → \`{ name }\`
`,
          starter: `async function request(method, path, body, headers = {}) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(\`HTTP \${res.status}: \${data.error}\`)
  }
  if (res.status === 204) return null
  return await res.json()
}

const api = {
  list(filter = {}) {
    // GET /api/quests, or /api/quests?done=true when filter.done is given
  },
  create(title, reward) {
    // POST /api/quests
  },
  complete(id) {
    // PATCH /api/quests/:id with { done: true }
  },
  remove(id) {
    // DELETE /api/quests/:id
  },
  me(token) {
    // GET /api/me with an Authorization header
  },
}
`,
          tests: `const rejectsWith = async (promise) => { try { await promise } catch (e) { return e } return null }
const last = () => __requests[__requests.length - 1]
test('list() returns all 3 quests', async () => expect((await api.list()).length).toBe(3))
test('list({ done: true }) uses ?done=true', async () => {
  const rows = await api.list({ done: true })
  expect(rows.map((q) => q.title)).toEqual(['Fix Prod at 2am'])
  expect(last().url).toBe('/api/quests?done=true')
})
test('list({ done: false }) returns 2 quests', async () => expect((await api.list({ done: false })).length).toBe(2))
test('create() makes a new quest', async () => {
  const q = await api.create('Learn fetch', 80)
  expect([q.id, q.title, q.reward, q.done]).toEqual([4, 'Learn fetch', 80, false])
  expect(last().method).toBe('POST')
})
test('complete(1) sends a PATCH and returns the done quest', async () => {
  const q = await api.complete(1)
  expect(last().method).toBe('PATCH')
  expect(last().url).toBe('/api/quests/1')
  expect(q.done).toBe(true)
  expect(__api.quests[0].done).toBe(true)
})
test('remove(3) sends DELETE and returns null', async () => {
  expect(await api.remove(3)).toBe(null)
  expect(last().method).toBe('DELETE')
  expect(__api.quests.some((q) => q.id === 3)).toBe(false)
})
test('remove(99) throws with 404', async () => expect(String((await rejectsWith(api.remove(99)))?.message)).toContain('404'))
test('me("letmein") returns Ada', async () => {
  expect(await api.me('letmein')).toEqual({ name: 'Ada' })
  expect(last().headers.Authorization).toBe('Bearer letmein')
})
test('me with a wrong token throws with 401', async () => expect(String((await rejectsWith(api.me('hunter2')))?.message)).toContain('401'))`,
          hint: "list: const q = filter.done === undefined ? '' : `?done=${filter.done}`; return request('GET', '/api/quests' + q). complete: request('PATCH', `/api/quests/${id}`, { done: true }). me: request('GET', '/api/me', undefined, { Authorization: `Bearer ${token}` })",
          solution: `async function request(method, path, body, headers = {}) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(\`HTTP \${res.status}: \${data.error}\`)
  }
  if (res.status === 204) return null
  return await res.json()
}

const api = {
  list(filter = {}) {
    const query = filter.done === undefined ? '' : \`?done=\${filter.done}\`
    return request('GET', '/api/quests' + query)
  },
  create(title, reward) {
    return request('POST', '/api/quests', { title, reward })
  },
  complete(id) {
    return request('PATCH', \`/api/quests/\${id}\`, { done: true })
  },
  remove(id) {
    return request('DELETE', \`/api/quests/\${id}\`)
  },
  me(token) {
    return request('GET', '/api/me', undefined, { Authorization: \`Bearer \${token}\` })
  },
}
`,
        },
        {
          kind: 'explain',
          prompt:
            'A teammate\'s code shows "undefined" instead of a quest when the id is wrong, and crashes after deleting. Explain both bugs and how a request() helper prevents them.',
          keyPoints: [
            'fetch does not reject on 4xx/5xx; you must check res.ok and throw',
            'A 204 response has no body, so calling res.json() throws',
            'One helper means the checks, headers and JSON.stringify are written once and used everywhere',
            'Retry 5xx and network errors with backoff, never 4xx',
          ],
        },
      ],
    },
  ],
  comingSoon: [],
}

/** React lesson: loading data with fetch (loading / error / data). Inserted into the React realm. */
export const reactData: Lesson[] = [
  {
    id: 'react-6',
    title: 'Loading Data: Loading, Error, Data',
    minutes: 15,
    uses: ['react-4', 'react-2', 'web-4'],
    steps: [
      {
        kind: 'concept',
        title: 'Fetch in an effect, show one of three screens',
        eli5: 'Ordering food delivery has **three screens** in the app: "🛵 on its way" (loading), "😞 order failed" (error), and "🍕 here\'s your food" (data). Your component is the same: it must always know which screen it\'s on.',
        body: `
Data from a server isn't there on the first render. So a component that loads data has **three states**:
- **loading**: show "Loading…"
- **error**: show what went wrong
- **data**: show the stuff

\`\`\`
function App() {
  const [quests, setQuests] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await fetch('/api/quests')
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
        const data = await res.json()
        if (!ignore) setQuests(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      }
    }
    load()
    return () => { ignore = true }   // cleanup
  }, [])                              // [] = only after the first render

  if (error) return <p role="alert">Error: {error}</p>
  if (!quests) return <p>Loading…</p>
  return <ul>{quests.map((q) => <li key={q.id}>{q.title}</li>)}</ul>
}
\`\`\`
## Why not fetch right in the component body?
Rendering runs your function. If the function fetches and then calls \`setQuests\`, that causes a re-render, which fetches again, which sets state again... **an infinite loop**. Effects run *after* render, and \`[]\` means "only once".

## Why \`async\` goes *inside* the effect
\`useEffect(async () => ...)\` is not allowed: an async function returns a Promise, but React expects the effect to return nothing or a cleanup function. So define \`load\` inside and call it.

## What's \`ignore\` for?
If the component disappears (or the request is replaced by a newer one) before the old response arrives, the cleanup sets \`ignore = true\` so the late answer **doesn't overwrite** newer state. This prevents "race condition" bugs.
`,
      },
      {
        kind: 'visual',
        title: 'The render cycle while loading',
        code: `function App() {
  const [quests, setQuests] = useState(null)
  useEffect(() => {
    fetch('/api/quests')
      .then((res) => res.json())
      .then((data) => setQuests(data))
  }, [])
  if (!quests) return <p>Loading…</p>
  return <ul>{quests.map((q) => <li key={q.id}>{q.title}</li>)}</ul>
}`,
        frames: [
          {
            line: 2,
            caption: '**Render #1.** `quests` starts as `null`. Nothing has been fetched yet.',
            lanes: [
              { title: 'State', items: ['quests: null'], highlight: [0] },
              { title: 'Screen', items: [] },
              { title: 'Network', items: [] },
            ],
          },
          {
            line: 8,
            caption: '`quests` is null, so the component returns **Loading…**. React puts it on the screen.',
            lanes: [
              { title: 'State', items: ['quests: null'] },
              { title: 'Screen', items: ['Loading…'], highlight: [0] },
              { title: 'Network', items: [] },
            ],
          },
          {
            line: 4,
            caption: '**After** the screen is drawn, the effect runs and starts the fetch. The user already sees "Loading…".',
            lanes: [
              { title: 'State', items: ['quests: null'] },
              { title: 'Screen', items: ['Loading…'] },
              { title: 'Network', items: ['⏳ GET /api/quests'], highlight: [0] },
            ],
          },
          {
            line: 6,
            caption: 'The response arrives. `setQuests(data)` stores the list and asks React for a re-render.',
            lanes: [
              { title: 'State', items: ['quests: [3 quests]'], highlight: [0] },
              { title: 'Screen', items: ['Loading…'] },
              { title: 'Network', items: ['✔ 200 OK'], highlight: [0] },
            ],
          },
          {
            line: 9,
            caption: '**Render #2.** Now `quests` has data, so the list renders.',
            lanes: [
              { title: 'State', items: ['quests: [3 quests]'] },
              { title: 'Screen', items: ['• Slay the Bug Dragon', '• Fix Prod at 2am', '• Write the Docs'], highlight: [0, 1, 2] },
              { title: 'Network', items: [] },
            ],
          },
          {
            line: 7,
            caption: 'The deps are `[]`, so the effect does **not** run again. One fetch. No loop.',
            lanes: [
              { title: 'State', items: ['quests: [3 quests]'] },
              { title: 'Screen', items: ['• Slay the Bug Dragon', '• Fix Prod at 2am', '• Write the Docs'] },
              { title: 'Network', items: ['(no new request) ✔'], highlight: [0] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'What happens with this component?',
        code: `function App() {
  const [quests, setQuests] = useState([])
  fetch('/api/quests')
    .then((res) => res.json())
    .then((data) => setQuests(data))
  return <p>{quests.length} quests</p>
}`,
        options: [
          'It fetches once and shows "3 quests"',
          'It fetches, sets state, re-renders, fetches again... forever',
          'It shows "0 quests" forever',
          'React refuses to render it',
        ],
        answer: 1,
        explain:
          'The fetch is in the render itself. Every setQuests triggers a render, and every render starts another fetch. Move it into `useEffect(() => { ... }, [])`.',
      },
      {
        kind: 'quiz',
        prompt: 'Spot the bug: the user sees "Loading…" forever when the server returns 500. Why?',
        code: `useEffect(() => {
  fetch('/api/broken')
    .then((res) => res.json())
    .then((data) => setQuests(data))
    .catch((err) => setError(err.message))
}, [])`,
        options: [
          'The deps should be [quests]',
          'fetch does not reject on 500, so catch never runs; the error body is treated as data',
          'catch must come before then',
          'setError is not a function',
        ],
        answer: 1,
        explain:
          'Same lesson as fetch: check `res.ok` and throw, so the error reaches your `.catch`. Otherwise `{ error: "..." }` gets stored as if it were the list.',
      },
      {
        kind: 'code',
        lang: 'react',
        title: 'Guided: Loading… then the quest list',
        setup: FAKE_API,
        instructions: `
A pretend server is running:
- \`GET /api/quests\` → an array of \`{ id, title, reward, done }\` (after a short delay)

Make \`App\`:
1. show \`<p>Loading…</p>\` while \`quests\` is \`null\`
2. fetch \`/api/quests\` in a \`useEffect\` with \`[]\` deps, then \`setQuests(data)\`
3. render a \`<ul>\` with one \`<li>\` per quest **title**

Follow the comments.
`,
        starter: `function App() {
  const [quests, setQuests] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      // 1. const res = await fetch('/api/quests')
      // 2. const data = await res.json()
      // 3. if (!ignore) setQuests(data)
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  // 4. if quests is null, return <p>Loading…</p>

  // 5. return a <ul> with an <li key={q.id}> for each quest's title
  return <ul></ul>
}
`,
        tests: `test('shows Loading… before the data arrives', () => {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = ReactDOM.createRoot(host)
  ReactDOM.flushSync(() => root.render(React.createElement(__App)))
  const shown = host.textContent
  root.unmount()
  host.remove()
  expect(shown).toContain('Loading')
})
test('renders one li per quest', async () => {
  await tick(100)
  expect($$('#root li').length).toBe(3)
})
test('shows the quest titles', () => expect($$('#root li').map((li) => li.textContent)).toEqual(['Slay the Bug Dragon', 'Fix Prod at 2am', 'Write the Docs']))
test('Loading… is gone once the data is in', () => expect(text('#root').includes('Loading')).toBe(false))`,
        hint: 'Uncomment steps 1–3. Then: if (!quests) return <p>Loading…</p> and return <ul>{quests.map((q) => <li key={q.id}>{q.title}</li>)}</ul>',
        solution: `function App() {
  const [quests, setQuests] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      const res = await fetch('/api/quests')
      const data = await res.json()
      if (!ignore) setQuests(data)
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  if (!quests) return <p>Loading…</p>

  return (
    <ul>
      {quests.map((q) => (
        <li key={q.id}>{q.title}</li>
      ))}
    </ul>
  )
}
`,
      },
      {
        kind: 'code',
        lang: 'react',
        title: 'Your turn: show the error',
        setup: FAKE_API,
        instructions: `
A pretend server is running:
- \`GET /api/broken\` → \`500 { error: 'Something exploded' }\`

This component now loads from \`/api/broken\`. **Run it first**: it crashes, because the error body \`{ error: ... }\` is treated as the list and \`.map\` doesn't exist on it.

Fix it:
1. add an \`error\` state
2. in \`load\`, if \`!res.ok\`, throw an Error with the status (e.g. \`HTTP 500\`)
3. wrap it in \`try/catch\` and \`setError(err.message)\` in the catch
4. if there's an error, render \`<p role="alert">Could not load quests: {error}</p>\`
`,
        starter: `function App() {
  const [quests, setQuests] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      const res = await fetch('/api/broken')
      const data = await res.json()
      if (!ignore) setQuests(data)
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  if (!quests) return <p>Loading…</p>

  return (
    <ul>
      {quests.map((q) => (
        <li key={q.id}>{q.title}</li>
      ))}
    </ul>
  )
}
`,
        tests: `test('shows Loading… first', () => {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = ReactDOM.createRoot(host)
  ReactDOM.flushSync(() => root.render(React.createElement(__App)))
  const shown = host.textContent
  root.unmount()
  host.remove()
  expect(shown).toContain('Loading')
})
test('shows an alert after the request fails', async () => {
  await tick(100)
  expect(Boolean($('#root [role="alert"]'))).toBe(true)
})
test('the alert mentions the 500 status', () => expect(text('#root [role="alert"]')).toContain('500'))
test('no list is shown', () => expect($$('#root li').length).toBe(0))
test('Loading… is gone after the error', () => expect(text('#root').includes('Loading')).toBe(false))`,
        hint: 'const [error, setError] = useState(null). Inside load: try { const res = await fetch(...); if (!res.ok) throw new Error(`HTTP ${res.status}`); ... } catch (err) { if (!ignore) setError(err.message) }. Before the loading check: if (error) return <p role="alert">Could not load quests: {error}</p>',
        solution: `function App() {
  const [quests, setQuests] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await fetch('/api/broken')
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
        const data = await res.json()
        if (!ignore) setQuests(data)
      } catch (err) {
        if (!ignore) setError(err.message)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  if (error) return <p role="alert">Could not load quests: {error}</p>
  if (!quests) return <p>Loading…</p>

  return (
    <ul>
      {quests.map((q) => (
        <li key={q.id}>{q.title}</li>
      ))}
    </ul>
  )
}
`,
      },
    ],
  },
]
