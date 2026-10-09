import type { Realm } from '../types'

/** How to think: a problem-solving method, decomposition, and the big programming paradigms. */
export const thinking: Realm = {
  id: 'think',
  name: 'Thinking Dojo',
  topic: 'Problem Solving & Programming Styles',
  icon: '🥋',
  glyph: '?→!',
  color: '#c56cf0',
  when: 'Month 1–2 (side quest)',
  blurb:
    "How to work through a problem when you have no idea where to start, and the big styles of code you'll see at work: imperative, functional and object-oriented.",
  lessons: [
    {
      id: 'think-1',
      title: 'How to Solve Any Coding Problem',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Five steps, every time',
          eli5: 'Solving a coding problem is like **assembling IKEA furniture**: read the instructions first, look at the picture of the finished thing, lay out the parts, build one step at a time, then wiggle it to check it holds.',
          body: `
Staring at an empty editor and "just starting to type" is how you get stuck. Pros follow a process, even if it's only in their head:

1. **Understand.** Say the problem in your own words. What goes **in**? What should come **out**?
2. **Examples by hand.** Work 2–3 tiny examples on paper, including a weird one (empty list? one item? negative numbers?).
3. **Plan in plain English.** Write the steps as comments *before* any code. This is called **pseudocode**.
4. **Code in small steps.** Turn one comment into code, run it, check it. Then the next.
5. **Check & clean up.** Test the weird cases. Then make it readable.

> Steps 1–3 feel slow. They're not. Most "I'm stuck" moments are really "I skipped step 1 or 2".
`,
        },
        {
          kind: 'visual',
          title: 'The method on a real problem',
          code: `// Problem: return the highest score in a list
function highestScore(scores) {
  // start with the first score as the "best so far"
  let best = scores[0]
  // look at every score
  for (const s of scores) {
    // if it beats the best so far, it's the new best
    if (s > best) best = s
  }
  // after checking them all, best is the answer
  return best
}`,
          frames: [
            {
              line: 1,
              caption: '**1. Understand.** In: a list of numbers. Out: one number, the biggest. In my words: "find the top score".',
              lanes: [
                { title: 'Step', items: ['1. Understand'], highlight: [0] },
                { title: 'My notes', items: ['IN: [7, 12, 3]', 'OUT: 12'] },
              ],
            },
            {
              line: 1,
              caption: "**2. Examples by hand.** How would *I* do it on paper? I'd scan left to right and remember the biggest so far.",
              lanes: [
                { title: 'Step', items: ['2. Examples by hand'], highlight: [0] },
                { title: 'My notes', items: ['[7, 12, 3] → 12', '[5] → 5', '[-4, -2] → -2  (weird case!)'], highlight: [2] },
              ],
            },
            {
              line: 3,
              caption: '**3. Plan in plain English.** Write the steps as comments first. No code yet. Notice the comments on the left are the whole plan.',
              lanes: [
                { title: 'Step', items: ['3. Plan (pseudocode)'], highlight: [0] },
                { title: 'My notes', items: ['remember first score as best', 'look at every score', 'if bigger, it becomes best', 'return best'] },
              ],
            },
            {
              line: 4,
              caption: '**4. Code one comment at a time.** "Start with the first score" becomes `let best = scores[0]`.',
              lanes: [
                { title: 'Step', items: ['4. Code in small steps'], highlight: [0] },
                {
                  title: 'My notes',
                  items: ['✔ remember first score as best', 'look at every score', 'if bigger, it becomes best', 'return best'],
                  highlight: [0],
                },
              ],
            },
            {
              line: 8,
              caption: 'Next comments become a loop and an `if`. Each line of code matches a line of the plan.',
              lanes: [
                { title: 'Step', items: ['4. Code in small steps'], highlight: [0] },
                {
                  title: 'My notes',
                  items: ['✔ remember first score as best', '✔ look at every score', '✔ if bigger, it becomes best', 'return best'],
                  highlight: [1, 2],
                },
              ],
            },
            {
              line: 11,
              caption:
                "**5. Check.** Run the examples from step 2, *including the weird one*. `[-4, -2]` gives -2. If we had started `best` at 0, we'd wrongly get 0. Step 2 caught a bug before it happened.",
              lanes: [
                { title: 'Step', items: ['5. Check & clean up'], highlight: [0] },
                { title: 'My notes', items: ['[7, 12, 3] → 12 ✔', '[5] → 5 ✔', '[-4, -2] → -2 ✔'], highlight: [2] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: "You read a problem and have no idea how to start. What's the best first move?",
          options: ['Start typing and see what happens', 'Ask AI for the answer', 'Work a tiny example by hand and notice what YOU did', 'Look for a library'],
          answer: 2,
          explain:
            'How you solve a small example on paper is usually the algorithm. Your job is then to write those steps down so the computer can follow them.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Guided: plan first, then code',
          instructions: `
Write \`countVowels(word)\` that returns how many vowels (\`a e i o u\`) are in a word.

The **plan is already written as comments**. Turn each comment into code, one at a time. Hint: \`'aeiou'.includes(letter)\` tells you if a letter is a vowel.
`,
          starter: `function countVowels(word) {\n  // 1. start a counter at 0\n\n  // 2. look at every letter in the word (lowercase it first)\n\n    // 3. if the letter is a vowel, add 1 to the counter\n\n  // 4. return the counter\n}\n\nconsole.log(countVowels('Banana')) // 3\n`,
          tests: `test("countVowels('Banana') is 3", () => expect(countVowels('Banana')).toBe(3))
test("countVowels('sky') is 0", () => expect(countVowels('sky')).toBe(0))
test('handles capitals', () => expect(countVowels('AEIOU')).toBe(5))
test('empty word is 0', () => expect(countVowels('')).toBe(0))`,
          hint: "let count = 0 · for (const letter of word.toLowerCase()) { if ('aeiou'.includes(letter)) count = count + 1 } · return count",
          solution: `function countVowels(word) {\n  // 1. start a counter at 0\n  let count = 0\n  // 2. look at every letter in the word (lowercase it first)\n  for (const letter of word.toLowerCase()) {\n    // 3. if the letter is a vowel, add 1 to the counter\n    if ('aeiou'.includes(letter)) count = count + 1\n  }\n  // 4. return the counter\n  return count\n}\n\nconsole.log(countVowels('Banana')) // 3\n`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your turn: write the plan yourself',
          instructions: `
Write \`longestWord(sentence)\` that returns the longest word in a sentence. If two words tie, return the **first** one.

\`longestWord('I love learning code')\` → \`'learning'\`

**Write your plan as comments first** (steps 1–3), then code it. \`sentence.split(' ')\` turns a sentence into a list of words.
`,
          starter: `function longestWord(sentence) {\n  // write your plan here as comments first\n\n}\n`,
          tests: `test("longestWord('I love learning code')", () => expect(longestWord('I love learning code')).toBe('learning'))
test('one word', () => expect(longestWord('hello')).toBe('hello'))
test('a tie returns the first one', () => expect(longestWord('cat dog')).toBe('cat'))`,
          hint: 'Like highestScore: let best = words[0], loop over words, if (w.length > best.length) best = w. Using > (not >=) keeps the first one on a tie.',
          solution: `function longestWord(sentence) {\n  // split into words, keep the longest so far, return it\n  const words = sentence.split(' ')\n  let best = words[0]\n  for (const w of words) {\n    if (w.length > best.length) best = w\n  }\n  return best\n}\n`,
        },
      ],
    },
    {
      id: 'think-2',
      title: 'Break It Down',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'Big problems are just small problems stacked up',
          eli5: '"Clean the whole house" is overwhelming. "Clean the kitchen" is easier. "Wipe the counter" is something you can do **right now**. Keep splitting until each piece is that obvious.',
          body: `
This skill is called **decomposition**, and it's most of what senior engineers do all day.

When a task feels too big, ask: **"What smaller pieces would make this easy?"** Then split each piece again until every one is a small function you could write in a few lines.

## Why small functions win
- Each one is easy to write, test and understand on its own.
- You can reuse them.
- When something breaks, you know which piece to look at.

> A good function does **one thing**, and its name says what that thing is.
`,
        },
        {
          kind: 'visual',
          title: 'Splitting a problem into a tree',
          frames: [
            {
              caption: 'The task: **"Show a player\'s rank from their list of quest scores."** Too big to write in one go.',
              lanes: [{ title: 'The big problem', items: ['getRankLabel(scores)'], highlight: [0] }],
            },
            {
              caption: 'Ask: what would make this easy? If I had the **total**, and a way to turn a total into a **rank**, I could just combine them.',
              lanes: [
                { title: 'The big problem', items: ['getRankLabel(scores)'] },
                { title: 'Smaller pieces', items: ['total(scores) → number', 'rankFor(total) → "Gold"'], highlight: [0, 1] },
              ],
            },
            {
              caption: 'Each piece is now tiny and obvious. `total` adds up a list. `rankFor` is a couple of `if`s.',
              lanes: [
                { title: 'The big problem', items: ['getRankLabel(scores)'] },
                { title: 'Smaller pieces', items: ['total(scores) → number', 'rankFor(total) → "Gold"'] },
                { title: 'How each works', items: ['add every score', '≥100 Gold, ≥50 Silver, else Bronze'], highlight: [0, 1] },
              ],
            },
            {
              caption:
                'Build the small pieces first, test each one, then the big one is a single line: `rankFor(total(scores))`. Bottom up, one piece at a time.',
              lanes: [
                { title: 'The big problem', items: ['rankFor(total(scores)) ✔'], highlight: [0] },
                { title: 'Smaller pieces', items: ['total ✔', 'rankFor ✔'] },
              ],
            },
          ],
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Build the pieces, then combine them',
          instructions: `
1. \`total(scores)\` returns the sum of a list of numbers.
2. \`rankFor(points)\` returns \`'Gold'\` for 100 or more, \`'Silver'\` for 50 or more, otherwise \`'Bronze'\`.
3. \`getRankLabel(scores)\` returns the rank for the total of the scores, **using your two functions** (one line!).
`,
          starter: `function total(scores) {\n  \n}\n\nfunction rankFor(points) {\n  \n}\n\nfunction getRankLabel(scores) {\n  \n}\n\nconsole.log(getRankLabel([40, 30, 35])) // Gold\n`,
          tests: `test('total adds up', () => expect(total([40, 30, 35])).toBe(105))
test('total of empty list is 0', () => expect(total([])).toBe(0))
test('rankFor', () => expect([rankFor(100), rankFor(50), rankFor(49)]).toEqual(['Gold', 'Silver', 'Bronze']))
test('getRankLabel', () => expect(getRankLabel([40, 30, 35])).toBe('Gold'))
test('getRankLabel uses the pieces', () => { const src = getRankLabel.toString(); if (!src.includes('total(') || !src.includes('rankFor(')) throw new Error('Call total() and rankFor() inside getRankLabel') })`,
          hint: "total: let sum = 0; for (const s of scores) sum = sum + s; return sum. rankFor: if (points >= 100) return 'Gold' ... getRankLabel: return rankFor(total(scores))",
          solution: `function total(scores) {\n  let sum = 0\n  for (const s of scores) sum = sum + s\n  return sum\n}\n\nfunction rankFor(points) {\n  if (points >= 100) return 'Gold'\n  if (points >= 50) return 'Silver'\n  return 'Bronze'\n}\n\nfunction getRankLabel(scores) {\n  return rankFor(total(scores))\n}\n\nconsole.log(getRankLabel([40, 30, 35])) // Gold\n`,
        },
      ],
    },
    {
      id: 'think-3',
      title: 'Programming Styles: Three Ways to Cook',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'Same meal, different recipe styles',
          eli5: '**Imperative** is a recipe that says *exactly* how: "crack 2 eggs, whisk 30 seconds, pour". **Declarative** says *what* you want: "scrambled eggs, please". **Object-oriented** organizes the kitchen into stations that each own their tools and jobs.',
          body: `
A **paradigm** is a style of organizing code. Most real JavaScript mixes all three, so you need to recognize each.

## Imperative: step-by-step instructions
You tell the computer **how**, one step at a time: loops, counters, changing variables.

## Declarative / functional: describe the result
You say **what** you want, using functions like \`filter\`, \`map\` and \`reduce\`. You don't manage counters yourself. SQL and React are declarative too.

## Object-oriented (OOP): bundle data with behavior
You model "things" as **objects** that hold their own data and the functions that work on it: \`account.deposit(50)\`.

Here's the same task in two styles, "get the names of adult users":
\`\`\`
// imperative: HOW
const names = []
for (const u of users) {
  if (u.age >= 18) names.push(u.name)
}

// declarative / functional: WHAT
const names = users.filter(u => u.age >= 18).map(u => u.name)
\`\`\`
Neither is "wrong". Declarative is often shorter and easier to read; imperative gives you fine control.
`,
        },
        {
          kind: 'visual',
          title: 'Same job, two styles, side by side',
          code: `const scores = [40, 95, 70]

// IMPERATIVE: you manage every step
const passed = []
for (const s of scores) {
  if (s >= 60) passed.push(s)
}

// DECLARATIVE: you describe the result
const passed2 = scores.filter(s => s >= 60)`,
          frames: [
            {
              line: 4,
              caption: 'Imperative: make an empty list yourself, then manage the loop yourself.',
              lanes: [
                { title: 'Imperative (how)', items: ['passed = []'], highlight: [0] },
                { title: 'Declarative (what)', items: [] },
              ],
            },
            {
              line: 6,
              caption: 'Check each score and push it in by hand. 40 fails, 95 passes, 70 passes. You are the one moving things around.',
              lanes: [
                { title: 'Imperative (how)', items: ['passed = [95, 70]', 'checked 40 ✘', 'checked 95 ✔', 'checked 70 ✔'], highlight: [0] },
                { title: 'Declarative (what)', items: [] },
              ],
            },
            {
              line: 10,
              caption: 'Declarative: one line that reads like English: "scores, filtered to the ones ≥ 60". `filter` does the looping and pushing for you.',
              lanes: [
                { title: 'Imperative (how)', items: ['passed = [95, 70]'] },
                { title: 'Declarative (what)', items: ['passed2 = [95, 70]'], highlight: [0] },
              ],
            },
            {
              line: 10,
              caption:
                "Same result. Declarative code says **what** you want, so readers understand it faster. That's why modern JS (and React) leans this way.",
              lanes: [
                { title: 'Imperative (how)', items: ['5 lines, a loop, a push'] },
                { title: 'Declarative (what)', items: ['1 line, reads like a sentence'], highlight: [0] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Which style is this?',
          code: `SELECT name FROM users WHERE age >= 18`,
          options: ['Imperative', 'Declarative', 'Object-oriented', 'None of these'],
          answer: 1,
          explain: 'SQL is the classic declarative language: you describe *what* rows you want and the database figures out *how* to get them.',
        },
        {
          kind: 'quiz',
          prompt: 'Which style is this?',
          code: `const cart = new Cart()\ncart.addItem('sword')\ncart.checkout()`,
          options: ['Imperative', 'Functional', 'Object-oriented', 'SQL'],
          answer: 2,
          explain:
            'A `Cart` **object** holds its own data (the items) and its own behavior (`addItem`, `checkout`). Data + methods bundled together is the core of OOP.',
        },
      ],
    },
    {
      id: 'think-4',
      title: 'Functional Programming',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Pure functions and data that never changes',
          eli5: "A **pure function** is a **vending machine**: same button, same snack, every time, and it doesn't rearrange the room while it works. Functional programming builds programs out of these predictable machines, passing data from one to the next like an assembly line.",
          body: `
Functional programming (FP) is a style built on a few ideas:

## 1. Pure functions
Same input → **always** the same output, and **no side effects** (it doesn't change anything outside itself).
\`\`\`
function add(a, b) { return a + b }          // pure ✔

let total = 0
function addToTotal(n) { total = total + n }  // impure ✘ changes something outside
\`\`\`

## 2. Immutability: don't change data, make new data
\`\`\`
cart.push('shield')            // ✘ mutates the original
const newCart = [...cart, 'shield']   // ✔ new array, original untouched
\`\`\`
The \`...\` (spread) copies everything from \`cart\` into a new array.

## 3. Functions are values
You can pass a function into another function: \`scores.filter(s => s >= 60)\`. \`s => s >= 60\` is an **arrow function**, a short way to write a small function.

## 4. Pipelines
Chain small functions so data flows through them: \`map\` (transform each), \`filter\` (keep some), \`reduce\` (combine into one).

> Why care? Pure functions are easy to test and reason about, and React is built on these ideas: never mutate state, always make a new copy.
`,
        },
        {
          kind: 'visual',
          title: 'Data flowing through a pipeline',
          code: `const cart = [
  { name: 'Potion', price: 5, qty: 2 },
  { name: 'Sword', price: 80, qty: 1 },
  { name: 'Arrow', price: 1, qty: 0 },
]
const total = cart
  .filter(item => item.qty > 0)
  .map(item => item.price * item.qty)
  .reduce((sum, n) => sum + n, 0)`,
          frames: [
            {
              line: 1,
              caption: 'The data: three items in a cart. In FP, this list will **never be changed**. Each step makes a new list.',
              lanes: [
                { title: 'cart (never changes)', items: ['Potion $5 ×2', 'Sword $80 ×1', 'Arrow $1 ×0'] },
                { title: 'Current result', items: [] },
              ],
            },
            {
              line: 7,
              caption: '**filter** keeps only items you actually bought (qty > 0). Arrow is dropped. A new list comes out.',
              lanes: [
                { title: 'cart (never changes)', items: ['Potion $5 ×2', 'Sword $80 ×1', 'Arrow $1 ×0'] },
                { title: 'Current result', items: ['Potion $5 ×2', 'Sword $80 ×1'], highlight: [0, 1] },
              ],
            },
            {
              line: 8,
              caption: '**map** transforms each item into its cost: price × qty. Items in, numbers out.',
              lanes: [
                { title: 'cart (never changes)', items: ['Potion $5 ×2', 'Sword $80 ×1', 'Arrow $1 ×0'] },
                { title: 'Current result', layout: 'row', items: ['10', '80'], highlight: [0, 1] },
              ],
            },
            {
              line: 9,
              caption: '**reduce** combines the list into one value: 0 → 0+10 = 10 → 10+80 = **90**.',
              lanes: [
                { title: 'cart (never changes)', items: ['Potion $5 ×2', 'Sword $80 ×1', 'Arrow $1 ×0'] },
                { title: 'Current result', items: ['90'], highlight: [0] },
              ],
            },
            {
              line: 1,
              caption:
                "Notice the original `cart` is **exactly the same** as when we started. No surprises for any other code that uses it. That's the FP promise.",
              lanes: [
                { title: 'cart (never changes)', items: ['Potion $5 ×2', 'Sword $80 ×1', 'Arrow $1 ×0'], highlight: [0, 1, 2] },
                { title: 'total', items: ['90'] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Pure or impure?',
          code: `function greet(name) {\n  console.log('Hi ' + name)\n}`,
          options: ['Pure: it takes an input', 'Impure: printing to the screen is a side effect', 'Pure: it returns nothing', 'Impure: it uses a string'],
          answer: 1,
          explain:
            "Printing changes something outside the function (the screen). A pure version would `return 'Hi ' + name` and let the caller decide what to do with it. Side effects are fine and necessary; FP just keeps them at the edges.",
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Write pure functions',
          instructions: `
1. \`addItem(cart, item)\` returns a **new** array with \`item\` added to the end. It must **not** change \`cart\`. Use spread: \`[...cart, item]\`.
2. \`cartTotal(cart)\` takes items like \`{ price, qty }\` and returns the total cost, using \`map\` and \`reduce\` (no \`for\` loop!).
`,
          starter: `function addItem(cart, item) {\n  \n}\n\nfunction cartTotal(cart) {\n  \n}\n`,
          tests: `test('addItem returns the new cart', () => expect(addItem(['potion'], 'sword')).toEqual(['potion', 'sword']))
test('addItem does NOT change the original', () => { const c = ['potion']; addItem(c, 'sword'); expect(c).toEqual(['potion']) })
test('cartTotal', () => expect(cartTotal([{ price: 5, qty: 2 }, { price: 80, qty: 1 }])).toBe(90))
test('cartTotal of empty cart is 0', () => expect(cartTotal([])).toBe(0))
test('no for loops (functional style)', () => { if (/\\bfor\\b/.test(addItem.toString() + cartTotal.toString())) throw new Error('Use map/reduce instead of a for loop') })`,
          hint: 'addItem: return [...cart, item] · cartTotal: return cart.map(i => i.price * i.qty).reduce((sum, n) => sum + n, 0)',
          solution: `function addItem(cart, item) {\n  return [...cart, item]\n}\n\nfunction cartTotal(cart) {\n  return cart.map((i) => i.price * i.qty).reduce((sum, n) => sum + n, 0)\n}\n`,
        },
      ],
    },
    {
      id: 'think-5',
      title: 'Object-Oriented Programming',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Blueprints and the things built from them',
          eli5: "A **class** is a **cookie cutter** (the blueprint). Each **object** is a cookie made with it. Every cookie has the same shape, but you can decorate each one differently, and eating one doesn't affect the others.",
          body: `
OOP organizes code around **objects** that bundle **data** (properties) with **behavior** (methods).

\`\`\`
class Hero {
  constructor(name) {      // runs when you make a new Hero
    this.name = name       // 'this' = the specific hero being built
    this.hp = 100
  }

  takeDamage(amount) {     // a method: something a Hero can DO
    this.hp = this.hp - amount
  }
}

const ada = new Hero('Ada')     // build one hero from the blueprint
const linus = new Hero('Linus') // build another
ada.takeDamage(30)
console.log(ada.hp, linus.hp)   // 70 100: each object has its own data
\`\`\`

## The big ideas
- **Encapsulation**: an object manages its own data; other code asks it to do things (\`ada.takeDamage(30)\`) instead of reaching in.
- **Instances**: one class, many independent objects.
- **Inheritance**: \`class Mage extends Hero\` gets everything Hero has, plus its own extras. (Use sparingly.)

You'll see OOP in Python (SQLAlchemy models are classes!), Java, C#, and older JavaScript/React code.
`,
        },
        {
          kind: 'visual',
          title: 'One blueprint, many objects',
          code: `class Hero {
  constructor(name) {
    this.name = name
    this.hp = 100
  }
  takeDamage(amount) {
    this.hp = this.hp - amount
  }
}
const ada = new Hero('Ada')
const linus = new Hero('Linus')
ada.takeDamage(30)`,
          frames: [
            {
              line: 1,
              caption: 'The class is just a **blueprint**. No hero exists yet.',
              lanes: [
                { title: 'Blueprint: Hero', items: ['has: name, hp', 'can: takeDamage()'], highlight: [0, 1] },
                { title: 'Objects in memory', items: [] },
              ],
            },
            {
              line: 10,
              caption: "`new Hero('Ada')` builds an object. The constructor runs: `this` is the new hero, so it gets name Ada and hp 100.",
              lanes: [
                { title: 'Blueprint: Hero', items: ['has: name, hp', 'can: takeDamage()'] },
                { title: 'Objects in memory', items: ['ada → { name: Ada, hp: 100 }'], highlight: [0] },
              ],
            },
            {
              line: 11,
              caption: 'Same blueprint, **separate object**: Linus gets his own name and his own hp.',
              lanes: [
                { title: 'Blueprint: Hero', items: ['has: name, hp', 'can: takeDamage()'] },
                { title: 'Objects in memory', items: ['ada → { name: Ada, hp: 100 }', 'linus → { name: Linus, hp: 100 }'], highlight: [1] },
              ],
            },
            {
              line: 7,
              caption: "`ada.takeDamage(30)`: inside the method, `this` means **ada**, so only Ada's hp drops. Linus is untouched.",
              lanes: [
                { title: 'Blueprint: Hero', items: ['has: name, hp', 'can: takeDamage()'] },
                { title: 'Objects in memory', items: ['ada → { name: Ada, hp: 70 }', 'linus → { name: Linus, hp: 100 }'], highlight: [0] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Inside a method, what does `this` refer to?',
          options: ['The class itself', 'The specific object the method was called on', 'The whole program', 'The last object created'],
          answer: 1,
          explain: 'In `ada.takeDamage(30)`, `this` is `ada`. In `linus.takeDamage(5)`, `this` is `linus`. Same method, different object.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Build a BankAccount class',
          instructions: `
Write a class \`BankAccount\`:
- \`constructor(owner)\` sets \`this.owner\` and starts \`this.balance\` at \`0\`
- \`deposit(amount)\` adds to the balance
- \`withdraw(amount)\` subtracts from the balance, **but only if there's enough money**. Return \`true\` if it worked, \`false\` if not.

Each account must keep its own balance.
`,
          starter: `class BankAccount {\n  constructor(owner) {\n    \n  }\n\n  deposit(amount) {\n    \n  }\n\n  withdraw(amount) {\n    \n  }\n}\n\nconst acct = new BankAccount('Ada')\nacct.deposit(50)\nconsole.log(acct.balance) // 50\n`,
          tests: `test('starts at 0 with an owner', () => { const a = new BankAccount('Ada'); expect([a.owner, a.balance]).toEqual(['Ada', 0]) })
test('deposit adds', () => { const a = new BankAccount('Ada'); a.deposit(50); a.deposit(25); expect(a.balance).toBe(75) })
test('withdraw works when there is enough', () => { const a = new BankAccount('Ada'); a.deposit(50); expect(a.withdraw(20)).toBe(true); expect(a.balance).toBe(30) })
test('withdraw refuses when there is not enough', () => { const a = new BankAccount('Ada'); a.deposit(10); expect(a.withdraw(20)).toBe(false); expect(a.balance).toBe(10) })
test('accounts are independent', () => { const a = new BankAccount('A'); const b = new BankAccount('B'); a.deposit(99); expect(b.balance).toBe(0) })`,
          hint: 'constructor: this.owner = owner; this.balance = 0. deposit: this.balance = this.balance + amount. withdraw: if (amount > this.balance) return false; this.balance = this.balance - amount; return true',
          solution: `class BankAccount {\n  constructor(owner) {\n    this.owner = owner\n    this.balance = 0\n  }\n\n  deposit(amount) {\n    this.balance = this.balance + amount\n  }\n\n  withdraw(amount) {\n    if (amount > this.balance) return false\n    this.balance = this.balance - amount\n    return true\n  }\n}\n\nconst acct = new BankAccount('Ada')\nacct.deposit(50)\nconsole.log(acct.balance) // 50\n`,
        },
      ],
    },
    {
      id: 'think-6',
      title: 'BOSS: Spot the Paradigm',
      boss: true,
      minutes: 15,
      steps: [
        {
          kind: 'quiz',
          prompt: 'Name the style.',
          code: `let total = 0\nfor (let i = 0; i < prices.length; i++) {\n  total = total + prices[i]\n}`,
          options: ['Imperative', 'Functional', 'Object-oriented', 'Declarative SQL'],
          answer: 0,
          explain: "A counter, a loop and a variable changed step by step: you're telling the computer exactly **how**. Classic imperative.",
        },
        {
          kind: 'quiz',
          prompt: 'Name the style.',
          code: `const total = prices.reduce((sum, p) => sum + p, 0)`,
          options: ['Imperative', 'Functional', 'Object-oriented', 'None'],
          answer: 1,
          explain: 'One expression, no variables changed, a function passed into `reduce`. Functional style, doing the same job as the loop above.',
        },
        {
          kind: 'quiz',
          prompt: 'Which one is a pure function?',
          options: [
            'function now() { return Date.now() }',
            'function save(user) { db.insert(user) }',
            'function square(n) { return n * n }',
            'function roll() { return Math.random() }',
          ],
          answer: 2,
          explain:
            '`square(3)` is always 9 and touches nothing else. `Date.now()` and `Math.random()` give different answers each call, and `db.insert` changes the outside world.',
        },
        {
          kind: 'quiz',
          prompt: "A React component does `items.push(newItem); setItems(items)` and the screen doesn't update. Which FP rule was broken?",
          options: ['Use classes', 'Immutability: make a new array instead of mutating the old one', 'Use more loops', 'Functions must return strings'],
          answer: 1,
          explain:
            'React compares the old and new values. Mutating the same array means "nothing changed" as far as React can tell. `setItems([...items, newItem])` makes a new array, so React re-renders.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Refactor imperative → functional',
          instructions: `
This works, but it's imperative. Rewrite \`adultNames(users)\` in **functional style**: use \`filter\` and \`map\`, no \`for\` loop, no \`push\`.

It returns the names of users aged 18 or over, in order.
`,
          starter: `function adultNames(users) {\n  const names = []\n  for (const u of users) {\n    if (u.age >= 18) names.push(u.name)\n  }\n  return names\n}\n`,
          tests: `const people = [{ name: 'Ada', age: 36 }, { name: 'Kid', age: 9 }, { name: 'Linus', age: 18 }]
test('returns adult names in order', () => expect(adultNames(people)).toEqual(['Ada', 'Linus']))
test('empty list', () => expect(adultNames([])).toEqual([]))
test('functional style: no for, no push', () => { const src = adultNames.toString(); if (/\\bfor\\b|push/.test(src)) throw new Error('Use filter and map instead of a loop and push') })`,
          hint: 'return users.filter(u => u.age >= 18).map(u => u.name)',
          solution: `function adultNames(users) {\n  return users.filter((u) => u.age >= 18).map((u) => u.name)\n}\n`,
        },
        {
          kind: 'explain',
          prompt: 'Explain the difference between imperative, functional and object-oriented code, with a one-line example idea for each.',
          keyPoints: [
            'Imperative: step-by-step instructions (loops, changing variables)',
            'Functional: pure functions, no mutation, map/filter/reduce',
            'OOP: objects bundle data with methods',
            'Real code mixes them',
          ],
        },
      ],
    },
  ],
  comingSoon: [
    'Recursion: functions that call themselves',
    "Reading other people's code",
    'Naming things well',
    'Rubber duck debugging',
    'Composition vs inheritance',
  ],
}
