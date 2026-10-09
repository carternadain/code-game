import type { Realm } from '../types'

/** Week 1, before any JavaScript: what a computer is, how code reaches it, and how to trace code like it does. */
export const powerOn: Realm = {
  id: 'start',
  name: 'Power On',
  topic: 'How Computers & Code Work (no code yet)',
  icon: '🔌',
  glyph: 'CPU',
  color: '#8f9bb3',
  when: 'Week 1',
  blurb: 'Before you write a line: what a computer actually does, how your words become something it can run, and why JavaScript works the way it does.',
  lessons: [
    {
      id: 'start-1',
      title: 'What a Computer Actually Does',
      minutes: 10,
      steps: [
        {
          kind: 'concept',
          title: 'A very fast, very literal chef',
          eli5: 'A computer is a **kitchen**. The **CPU** is the chef who does every step. **RAM** is the countertop: small, fast, wiped clean when the power goes off. **Storage** (your SSD) is the pantry: huge and permanent, but slower to reach.',
          body: `
Every computer, from your phone to an AWS server, has the same three main parts:

- **CPU** (processor): does the work. It can only do tiny, simple steps: add two numbers, compare two numbers, copy a number, jump to another step. But it does **billions per second**. "3 GHz" means about 3 billion ticks a second.
- **RAM** (memory): where the running program and its data live *right now*. Fast, but forgets everything when the power turns off.
- **Storage** (SSD / disk): where files and apps are kept permanently. Slower, but it remembers.

## Everything is numbers
Text, images, music, your code: inside the computer they're all stored as numbers. The letter \`A\` is 65. A pixel is three numbers (red, green, blue). Smart programs are just huge piles of tiny dumb steps, done very fast.
`,
        },
        {
          kind: 'visual',
          title: 'The CPU, one tiny step at a time',
          code: `LOAD 5 into box A
LOAD 3 into box B
ADD A and B, put it in box C
SHOW box C on the screen`,
          frames: [
            {
              caption:
                'This is roughly what the CPU really runs: super simple instructions. (Real ones are numbers, but the idea is the same.) Its own tiny "boxes" are called **registers**.',
              lanes: [
                { title: 'CPU boxes (registers)', items: ['A = ?', 'B = ?', 'C = ?'] },
                { title: 'Screen', items: [] },
              ],
            },
            {
              line: 1,
              caption: 'Step 1: put **5** in box A.',
              lanes: [
                { title: 'CPU boxes (registers)', items: ['A = 5', 'B = ?', 'C = ?'], highlight: [0] },
                { title: 'Screen', items: [] },
              ],
            },
            {
              line: 2,
              caption: 'Step 2: put **3** in box B.',
              lanes: [
                { title: 'CPU boxes (registers)', items: ['A = 5', 'B = 3', 'C = ?'], highlight: [1] },
                { title: 'Screen', items: [] },
              ],
            },
            {
              line: 3,
              caption: 'Step 3: add them. 5 + 3 = **8**, into box C.',
              lanes: [
                { title: 'CPU boxes (registers)', items: ['A = 5', 'B = 3', 'C = 8'], highlight: [2] },
                { title: 'Screen', items: [] },
              ],
            },
            {
              line: 4,
              caption: 'Step 4: show it. Four tiny steps just to print 8. A modern CPU does about **3 billion** of these every second.',
              lanes: [
                { title: 'CPU boxes (registers)', items: ['A = 5', 'B = 3', 'C = 8'] },
                { title: 'Screen', items: ['8'], highlight: [0] },
              ],
            },
          ],
        },
        {
          kind: 'visual',
          title: 'What happens when you open an app',
          frames: [
            {
              caption: 'The app sits in **storage** (the pantry). It stays there even when the computer is off.',
              lanes: [
                { title: 'Storage (SSD)', items: ['📦 Spotify', '📦 Chrome', '📄 notes.txt'], highlight: [1] },
                { title: 'RAM (countertop)', items: [] },
                { title: 'CPU (chef)', items: [] },
              ],
            },
            {
              caption: 'You click Chrome. A copy of it is **loaded into RAM**, because the CPU can only work with things on the countertop.',
              lanes: [
                { title: 'Storage (SSD)', items: ['📦 Spotify', '📦 Chrome', '📄 notes.txt'] },
                { title: 'RAM (countertop)', items: ['Chrome (running)'], highlight: [0] },
                { title: 'CPU (chef)', items: [] },
              ],
            },
            {
              caption: 'The CPU reads Chrome\'s instructions from RAM, one after another, billions per second. That\'s "running a program".',
              lanes: [
                { title: 'Storage (SSD)', items: ['📦 Spotify', '📦 Chrome', '📄 notes.txt'] },
                { title: 'RAM (countertop)', items: ['Chrome (running)'] },
                { title: 'CPU (chef)', items: ["doing Chrome's steps…"], highlight: [0] },
              ],
            },
            {
              caption: 'Power cut! RAM is wiped, so anything you didn\'t **save to storage** is gone. That\'s why "save" exists.',
              lanes: [
                { title: 'Storage (SSD)', items: ['📦 Spotify', '📦 Chrome', '📄 notes.txt'], highlight: [2] },
                { title: 'RAM (countertop)', items: [] },
                { title: 'CPU (chef)', items: [] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: "You're typing a doc and the power goes out. Why is your unsaved work gone?",
          options: [
            'The CPU deleted it',
            'It only existed in RAM, which is wiped when the power goes off',
            'Storage is cleared every restart',
            'The monitor forgot it',
          ],
          answer: 1,
          explain: 'Unsaved work lives on the countertop (RAM). Saving copies it to the pantry (storage), which keeps it without power.',
        },
        {
          kind: 'quiz',
          prompt: 'The CPU can only do tiny steps like "add" and "compare". So how does it run something as complex as a video game?',
          options: [
            'It has a special game chip for each game',
            'Programs are huge numbers of tiny steps, done billions of times per second',
            'The internet runs it',
            'It guesses',
          ],
          answer: 1,
          explain: 'Every program, no matter how fancy, breaks down into simple steps. Programming is the skill of breaking a big problem into small steps.',
        },
      ],
    },
    {
      id: 'start-2',
      title: 'From Your Words to the CPU',
      minutes: 10,
      steps: [
        {
          kind: 'concept',
          title: 'Why programming languages exist',
          eli5: 'The CPU only speaks **machine code** (numbers). You speak English. A programming language is the **middle ground**: precise enough for a translator program to turn it into machine code, but readable enough for humans.',
          body: `
Writing raw machine code by hand looks like \`10110000 01100001\`. Nobody wants that. So we write in a **programming language** like JavaScript or Python, and another program **translates** it:

1. **You write source code**: \`console.log(2 + 3)\`. To the computer, this is just text.
2. **A translator program reads it.** For JavaScript in Chrome, that's an **engine** called **V8**.
3. **It turns your text into machine instructions** the CPU understands.
4. **The CPU runs those instructions**, and \`5\` appears on the screen.

## Why programming languages are so picky
The translator isn't smart like a person. A missing \`)\` or a typo in a name and it stops with an **error**. That's not the computer being mean; it just can't guess what you meant.
`,
        },
        {
          kind: 'visual',
          title: 'The journey of console.log(2 + 3)',
          frames: [
            {
              caption: "You type this. To the computer, it's just a string of characters, like a text message.",
              lanes: [
                { title: '1. Your code (text)', items: ['console.log(2 + 3)'], highlight: [0] },
                { title: '2. Engine (V8)', items: [] },
                { title: '3. CPU', items: [] },
                { title: 'Screen', items: [] },
              ],
            },
            {
              caption: 'The engine chops the text into words it knows, called **tokens**. Like reading a sentence word by word.',
              lanes: [
                { title: '1. Your code (text)', items: ['console.log(2 + 3)'] },
                { title: '2. Engine (V8)', layout: 'row', items: ['console', '.', 'log', '(', '2', '+', '3', ')'], highlight: [4, 5, 6] },
                { title: '3. CPU', items: [] },
                { title: 'Screen', items: [] },
              ],
            },
            {
              caption:
                'It figures out the **meaning**: "add 2 and 3, then give the answer to console.log". If the grammar is wrong (say a missing `)`), this is where you get a **SyntaxError**.',
              lanes: [
                { title: '1. Your code (text)', items: ['console.log(2 + 3)'] },
                { title: '2. Engine (V8)', items: ['print( add(2, 3) )'], highlight: [0] },
                { title: '3. CPU', items: [] },
                { title: 'Screen', items: [] },
              ],
            },
            {
              caption: 'It turns that into **machine instructions**: the tiny steps from the last lesson.',
              lanes: [
                { title: '1. Your code (text)', items: ['console.log(2 + 3)'] },
                { title: '2. Engine (V8)', items: ['print( add(2, 3) )'] },
                { title: '3. CPU', items: ['LOAD 2', 'LOAD 3', 'ADD → 5', 'SHOW'], highlight: [2] },
                { title: 'Screen', items: [] },
              ],
            },
            {
              caption: 'The CPU runs them, and **5** appears. All of that happens in a few thousandths of a second.',
              lanes: [
                { title: '1. Your code (text)', items: ['console.log(2 + 3)'] },
                { title: '2. Engine (V8)', items: ['print( add(2, 3) )'] },
                { title: '3. CPU', items: ['LOAD 2', 'LOAD 3', 'ADD → 5', 'SHOW'] },
                { title: 'Screen', items: ['5'], highlight: [0] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'In Google Chrome, what actually reads and runs your JavaScript?',
          options: ['The CPU reads the text directly', 'The V8 engine translates it into instructions the CPU runs', "Google's servers", 'HTML'],
          answer: 1,
          explain:
            "The CPU can't read text. V8 (Chrome, Edge, and Node.js all use it) translates your code into machine instructions. Firefox has its own engine called SpiderMonkey; Safari's is JavaScriptCore.",
        },
        {
          kind: 'quiz',
          prompt: 'You forget a closing `)`. When does the error show up?',
          options: ['Never, it guesses', 'When the engine reads your code, before anything runs', 'Only after the program finishes', 'The next day'],
          answer: 1,
          explain:
            "Grammar mistakes are **SyntaxErrors**: the engine can't understand the code, so nothing runs at all. Mistakes that happen *while* running (like using a variable that doesn't exist) are runtime errors.",
        },
        {
          kind: 'explain',
          prompt: 'Why do we need programming languages at all? Why not talk to the CPU in English, or in machine code?',
          keyPoints: [
            'The CPU only understands machine code (numbers)',
            'Machine code is too hard for humans to write and read',
            'English is too vague for a translator to turn into exact steps',
            'A language is precise enough to translate, readable enough for humans',
          ],
        },
      ],
    },
    {
      id: 'start-3',
      title: "Where JavaScript Lives (and Why It's Weird)",
      minutes: 10,
      steps: [
        {
          kind: 'concept',
          title: 'The three languages of every web page',
          eli5: "A web page is a **house**. **HTML** is the frame and walls (what's there). **CSS** is the paint and furniture (how it looks). **JavaScript** is the electricity (what happens when you flip a switch).",
          body: `
- **HTML**: the structure. "There's a heading, a paragraph, a button."
- **CSS**: the style. "The button is blue, rounded, and centered."
- **JavaScript**: the behavior. "When the button is clicked, add the item to the cart."

## A quick history (it explains a lot)
In **1995**, Brendan Eich created JavaScript in about **10 days** so web pages could react to clicks without reloading. It spread to every browser, and here's the catch: **websites from 1996 still have to work today**. So mistakes from the rush can never be removed, only worked around. That's why JS has odd corners (\`typeof null\` is \`'object'\`), and why you'll learn "use \`===\`, not \`==\`" and "use \`let\`/\`const\`, not \`var\`".

## JavaScript outside the browser
In **2009**, Node.js took Chrome's V8 engine and let JavaScript run on servers and laptops, outside any web page. That's why one language now powers frontends (React) *and* backends.
`,
        },
        {
          kind: 'visual',
          title: 'What happens when you click "Add to cart"',
          code: `<button id="add">Add to cart</button>
<p id="count">Cart: 0</p>

button.addEventListener('click', () => {
  cartCount = cartCount + 1
  countText.textContent = 'Cart: ' + cartCount
})`,
          frames: [
            {
              line: 1,
              caption: '**HTML** puts a button and a line of text on the page. On its own, the button does nothing.',
              lanes: [
                { title: 'Page (what you see)', items: ['[ Add to cart ]', 'Cart: 0'] },
                { title: 'JavaScript', items: [] },
              ],
            },
            {
              line: 4,
              caption: '**JavaScript** says: "when this button is clicked, run these steps." It sets up the plan and waits.',
              lanes: [
                { title: 'Page (what you see)', items: ['[ Add to cart ]', 'Cart: 0'], highlight: [0] },
                { title: 'JavaScript', items: ['waiting for a click…', 'cartCount = 0'], highlight: [0] },
              ],
            },
            {
              line: 5,
              caption: 'You click! The browser runs the steps: cartCount goes from 0 to **1**.',
              lanes: [
                { title: 'Page (what you see)', items: ['[ Add to cart ] 👆', 'Cart: 0'] },
                { title: 'JavaScript', items: ['click handler running', 'cartCount = 1'], highlight: [1] },
              ],
            },
            {
              line: 6,
              caption:
                "JavaScript changes the text on the page. No reload. That was the whole point of JavaScript in 1995, and it's what React does for you at scale.",
              lanes: [
                { title: 'Page (what you see)', items: ['[ Add to cart ]', 'Cart: 1'], highlight: [1] },
                { title: 'JavaScript', items: ['waiting for a click…', 'cartCount = 1'] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Which language makes "the button turns green when you hover over it"?',
          options: ['HTML', 'CSS', 'JavaScript', 'SQL'],
          answer: 1,
          explain: 'Looks and simple hover effects are CSS. (JavaScript *could* do it, but CSS is the right tool.)',
        },
        {
          kind: 'quiz',
          prompt: 'Which language makes "clicking the button adds the item to your cart"?',
          options: ['HTML', 'CSS', 'JavaScript', 'None, the browser does it'],
          answer: 2,
          explain: "Doing something in response to an action, and changing the page afterward, is behavior. That's JavaScript's job.",
        },
        {
          kind: 'quiz',
          prompt: "Why doesn't JavaScript just fix its weird old behaviors?",
          options: ['Nobody noticed them', 'It would break millions of existing websites that depend on them', "They're not bugs", "It's illegal"],
          answer: 1,
          explain:
            '"Don\'t break the web" is the golden rule. New, better features get added (like `let`, `const`, `===`), and the old ones stay around for old sites.',
        },
      ],
    },
    {
      id: 'start-4',
      title: 'BOSS: Think Like the Computer',
      boss: true,
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Tracing: the superpower nobody teaches',
          eli5: "Tracing is **following GPS directions one turn at a time** instead of guessing where you'll end up. You become the computer: read one line, update your notes, move to the next.",
          body: `
Most beginners **read** code like a story and guess what it does. Pros **trace** it: they pretend to be the computer.

## How to trace
1. Draw two columns on paper: **Boxes** (variables and their current values) and **Output**.
2. Start at line 1. Do exactly what it says. Nothing more.
3. Update your boxes: cross out the old value, write the new one.
4. Go to the next line. Repeat until the end.

That's exactly what the "Watch it happen" animations in this app do. They're tracing *for* you, so you can learn to do it yourself.

> When code surprises you, don't stare at it. Trace it, or add \`console.log\` lines to see the real values. Guessing is how bugs survive.
`,
        },
        {
          kind: 'visual',
          title: 'A trace, step by step',
          code: `let coins = 10
let price = 4
coins = coins - price
price = price * 2
console.log(coins, price)`,
          frames: [
            {
              line: 1,
              caption: 'Line 1: a box called coins, holding **10**.',
              lanes: [
                { title: 'Boxes', items: ['coins = 10'], highlight: [0] },
                { title: 'Output', items: [] },
              ],
            },
            {
              line: 2,
              caption: 'Line 2: a box called price, holding **4**.',
              lanes: [
                { title: 'Boxes', items: ['coins = 10', 'price = 4'], highlight: [1] },
                { title: 'Output', items: [] },
              ],
            },
            {
              line: 3,
              caption: 'Line 3: right side first. coins − price = 10 − 4 = **6**. Put 6 in coins (10 is crossed out).',
              lanes: [
                { title: 'Boxes', items: ['coins = 6   (was 10)', 'price = 4'], highlight: [0] },
                { title: 'Output', items: [] },
              ],
            },
            {
              line: 4,
              caption: "Line 4: price × 2 = 4 × 2 = **8**. Put 8 in price. (coins doesn't change, it's still 6.)",
              lanes: [
                { title: 'Boxes', items: ['coins = 6', 'price = 8   (was 4)'], highlight: [1] },
                { title: 'Output', items: [] },
              ],
            },
            {
              line: 5,
              caption: "Line 5: print what's in the boxes **right now**: 6 and 8.",
              lanes: [
                { title: 'Boxes', items: ['coins = 6', 'price = 8'] },
                { title: 'Output', items: ['6 8'], highlight: [0] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Your turn. Trace it (grab paper if it helps). What prints?',
          code: `let a = 3\nlet b = a + 2\na = b * 2\nconsole.log(a, b)`,
          options: ['3 5', '10 5', '6 5', '10 10'],
          answer: 1,
          explain: "a = 3 → b = 3 + 2 = 5 → a = 5 × 2 = 10. b never changed after line 2, so it's still 5. Output: `10 5`.",
        },
        {
          kind: 'quiz',
          prompt: 'The swap trap. What prints?',
          code: `let x = 1\nlet y = 2\nx = y\ny = x\nconsole.log(x, y)`,
          options: ['2 1', '2 2', '1 1', '1 2'],
          answer: 1,
          explain:
            "After `x = y`, x is 2, and the old 1 is **gone**. Then `y = x` copies that 2 back into y. Both are 2. To truly swap, you need a third box: `let temp = x; x = y; y = temp`. Tracing catches this; reading usually doesn't.",
        },
        {
          kind: 'quiz',
          prompt: 'Last one. What prints?',
          code: `let score = 0\nscore = score + 5\nscore = score + 5\nlet bonus = score * 2\nscore = 1\nconsole.log(score, bonus)`,
          options: ['1 2', '10 20', '1 20', '11 20'],
          answer: 2,
          explain:
            "score goes 0 → 5 → 10. bonus = 10 × 2 = 20. Then score is set to 1. Changing score later **doesn't** go back and change bonus: bonus was calculated once and saved. Output: `1 20`.",
        },
        {
          kind: 'explain',
          prompt: 'Explain how to trace a piece of code, as if teaching a friend who has never coded.',
          keyPoints: [
            'Go one line at a time, in order',
            'Keep a list of each variable and its current value',
            'Work out the right side of = first, then store it',
            'Write down what gets printed',
          ],
        },
      ],
    },
  ],
  comingSoon: [
    'What the internet actually is',
    'Files, folders and the terminal',
    'Reading an error message without panicking',
    'How to search and read docs like a pro',
  ],
}
