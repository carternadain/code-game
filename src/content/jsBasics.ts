import type { Lesson } from '../types'

/**
 * The on-ramp: seven small lessons that build JavaScript up one idea at a time,
 * so nothing (especially functions) appears before it has been taught.
 * Early challenges are fill-in-the-blank: replace each ___ with real code.
 */
export const jsBasics: Lesson[] = [
  {
    id: 'js-b1',
    title: 'Hello, Computer',
    minutes: 8,
    steps: [
      {
        kind: 'concept',
        title: 'Code is a list of instructions',
        eli5: 'Code is a **recipe**. The computer reads it **top to bottom**, one line at a time, and does exactly what each line says. Nothing more, nothing less.',
        body: `
Here's a whole program:

\`\`\`
console.log('Hello!')
console.log('I am learning to code.')
\`\`\`

\`console.log(...)\` means **print this on the screen**. Whatever you put inside the parentheses shows up in the **Output** panel.

- Each line runs in order: first \`Hello!\`, then the second line.
- Text goes inside **quotes**: \`'Hello!'\`. The quotes tell JavaScript "this is text, not code".
- Numbers don't need quotes: \`console.log(42)\`.

> You'll use \`console.log\` constantly, even as a senior dev. It's how you peek inside your program to see what's going on.
`,
      },
      {
        kind: 'quiz',
        prompt: 'What does this print?',
        code: `console.log(2 + 2)`,
        options: ['2 + 2', '4', '22', 'Nothing'],
        answer: 1,
        explain: 'No quotes, so JavaScript treats it as math and works it out first: `2 + 2` is `4`, and `4` gets printed.',
      },
      {
        kind: 'quiz',
        prompt: 'And this one? Look closely at the quotes.',
        code: `console.log('2 + 2')`,
        options: ['4', '2 + 2', "'2 + 2'", 'An error'],
        answer: 1,
        explain: 'The quotes make it **text**, so JavaScript prints those exact characters instead of doing math. The quotes themselves are not printed.',
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your first program',
        instructions: `
Replace each \`___\` so the program prints two lines:

1. \`Hello, world!\` (exactly that, with the comma and the !)
2. your own name

Remember the quotes around text. Then press **Run**.
`,
        starter: `console.log(___)\nconsole.log(___)\n`,
        tests: `test('line 1 is Hello, world!', () => expect(printed()[0]).toBe('Hello, world!'))
test('line 2 is your name', () => { if (!printed()[1] || printed()[1] === 'Hello, world!') throw new Error('Print your name on the second line') })`,
        hint: "console.log('Hello, world!') on the first line, and console.log('Carter') (your name, in quotes) on the second.",
        solution: `console.log('Hello, world!')\nconsole.log('Carter')\n`,
      },
    ],
  },
  {
    id: 'js-b2',
    title: 'Values: Text, Numbers, True/False',
    minutes: 10,
    steps: [
      {
        kind: 'concept',
        title: 'The three basic kinds of values',
        eli5: 'Every value has a **type**, like how a kitchen has liquids, solids and spices. Text, numbers and yes/no are different kinds of things, and JavaScript treats each kind differently.',
        body: `
## 1. Strings (text)
Anything in quotes. \`'Ada'\`, \`"hello"\`, \`'123'\` (yes, that's text too, because of the quotes).

Glue strings together with \`+\`:
\`\`\`
console.log('Level ' + 7)   // Level 7
\`\`\`

## 2. Numbers
No quotes. You can do math: \`+\` add, \`-\` subtract, \`*\` multiply, \`/\` divide.
\`\`\`
console.log(12 * 3)   // 36
\`\`\`

## 3. Booleans (true / false)
Just two values: \`true\` and \`false\`. Comparisons give you a boolean:
\`\`\`
console.log(10 > 3)   // true
console.log(2 === 5)  // false   (=== means "is exactly equal to")
\`\`\`

> Anything after \`//\` is a **comment**: a note for humans. JavaScript ignores it.
`,
      },
      {
        kind: 'quiz',
        prompt: 'The classic beginner trap. What does this print?',
        code: `console.log('5' + 5)`,
        options: ['10', '55', 'An error', "'5' + 5"],
        answer: 1,
        explain:
          "`'5'` is **text** (it has quotes). Text `+` anything means *glue them together*, so you get the text `55`. This bug shows up in real apps when a form gives you `'5'` instead of `5`.",
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Print three kinds of values',
        instructions: `
Fill in the blanks so the program prints:

1. the result of **12 times 3** (use \`*\`, let JavaScript do the math)
2. the text \`Level 7\`, made by gluing \`'Level '\` and the number \`7\` with \`+\`
3. whether **10 is greater than 3** (use \`>\`)
`,
        starter: `// 1. 12 times 3\nconsole.log(___)\n\n// 2. 'Level ' glued to 7\nconsole.log(___)\n\n// 3. is 10 greater than 3?\nconsole.log(___)\n`,
        tests: `test('prints 36', () => expect(printed()[0]).toBe('36'))
test('prints Level 7', () => expect(printed()[1]).toBe('Level 7'))
test('prints true', () => expect(printed()[2]).toBe('true'))`,
        hint: "console.log(12 * 3) · console.log('Level ' + 7) · console.log(10 > 3)",
        solution: `// 1. 12 times 3\nconsole.log(12 * 3)\n\n// 2. 'Level ' glued to 7\nconsole.log('Level ' + 7)\n\n// 3. is 10 greater than 3?\nconsole.log(10 > 3)\n`,
      },
    ],
  },
  {
    id: 'js-b3',
    title: 'Variables: Labeled Boxes',
    minutes: 12,
    steps: [
      {
        kind: 'concept',
        title: 'Save a value so you can use it later',
        eli5: 'A variable is a **box with a label on it**. You put a value in the box, and later you use the label to get it back out.',
        body: `
\`\`\`
let hp = 100
console.log(hp)   // 100
\`\`\`

Read it as: "make a box labeled \`hp\`, put \`100\` in it". After that, writing \`hp\` means "whatever is in the hp box".

## Changing what's in the box
\`\`\`
hp = hp - 30      // take what's in hp, subtract 30, put the answer back in hp
console.log(hp)   // 70
\`\`\`
\`=\` doesn't mean "equals" like in math. It means **"put the thing on the right into the box on the left"**.

## let vs const
- \`let\` makes a box you can change later.
- \`const\` makes a box that's **sealed**. Trying \`name = 'Bob'\` after \`const name = 'Ada'\` is an error.

> Rule of thumb: use \`const\` by default, \`let\` only when the value needs to change. (Skip \`var\`: it's the old way and causes bugs.)
`,
      },
      {
        kind: 'visual',
        title: 'Watch the boxes change',
        code: `let hp = 100
hp = hp - 30
const name = 'Ada'
console.log(name, hp)
name = 'Bob'`,
        frames: [
          {
            line: 1,
            caption: 'A box labeled **hp** is made, and **100** goes inside.',
            lanes: [
              { title: 'Boxes (variables)', items: ['hp = 100'], highlight: [0] },
              { title: 'Output', items: [] },
            ],
          },
          {
            line: 2,
            caption: "Right side first: take what's in hp (100), subtract 30 → **70**. Then put 70 back into the hp box.",
            lanes: [
              { title: 'Boxes (variables)', items: ['hp = 70'], highlight: [0] },
              { title: 'Output', items: [] },
            ],
          },
          {
            line: 3,
            caption: "A **sealed** box (const) labeled **name** gets 'Ada'.",
            lanes: [
              { title: 'Boxes (variables)', items: ['hp = 70', "name = 'Ada'  🔒"], highlight: [1] },
              { title: 'Output', items: [] },
            ],
          },
          {
            line: 4,
            caption: "Using a label gets what's inside. console.log prints both, separated by a space.",
            lanes: [
              { title: 'Boxes (variables)', items: ['hp = 70', "name = 'Ada'  🔒"] },
              { title: 'Output', items: ['Ada 70'], highlight: [0] },
            ],
          },
          {
            line: 5,
            caption: "**Error!** name is a const box, so it can't be changed. *TypeError: Assignment to constant variable.*",
            lanes: [
              { title: 'Boxes (variables)', items: ['hp = 70', "name = 'Ada'  🔒"], highlight: [1] },
              { title: 'Output', items: ['Ada 70', '✖ TypeError'], highlight: [1] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'What happens when this runs?',
        code: `const items = ['sword']\nitems.push('shield')\nconsole.log(items)`,
        options: ['TypeError: Assignment to constant variable', "['sword', 'shield']", "['sword']", 'undefined'],
        answer: 1,
        explain:
          "`const` seals the *box*, so you can't put a different list in it (`items = []` would be an error). But you can still add things to the list that's already inside. `push` adds `'shield'` to the end, and the comma is just how JavaScript prints a list: it separates item 0 from item 1. (Lists get their own lesson next.)",
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Make your hero',
        instructions: `
1. Make a **const** variable called \`heroName\` holding your hero's name (text, so use quotes).
2. Make a **let** variable called \`hp\` that starts at \`100\`.
3. The hero takes a hit: **subtract 25** from \`hp\` (\`hp = hp - 25\`).
4. Print \`heroName\`, then print \`hp\`.
`,
        starter: `const heroName = ___\nlet hp = ___\n\n// take 25 damage\n___\n\nconsole.log(heroName)\nconsole.log(hp)\n`,
        tests: `test('heroName is some text', () => { if (typeof heroName !== 'string' || !heroName) throw new Error('heroName should be text in quotes, like \\'Ada\\'') })
test('hp ends at 75', () => expect(hp).toBe(75))
test('prints the name, then 75', () => expect(printed()).toEqual([heroName, '75']))`,
        hint: "const heroName = 'Ada' · let hp = 100 · hp = hp - 25",
        solution: `const heroName = 'Ada'\nlet hp = 100\n\n// take 25 damage\nhp = hp - 25\n\nconsole.log(heroName)\nconsole.log(hp)\n`,
      },
    ],
  },
  {
    id: 'js-b4',
    title: 'Arrays: A List in One Box',
    minutes: 12,
    steps: [
      {
        kind: 'concept',
        title: 'Many values, one variable',
        eli5: 'An array is an **egg carton**: one container with numbered slots. The first slot is number **0**, not 1.',
        body: `
\`\`\`
const loot = ['potion', 'sword', 'map']
\`\`\`
Square brackets \`[ ]\` make a list. Commas separate the items.

## Getting an item: its index (slot number)
\`\`\`
console.log(loot[0])   // potion   ← counting starts at 0!
console.log(loot[2])   // map
\`\`\`

## How many items?
\`\`\`
console.log(loot.length)   // 3
\`\`\`

## Adding to the end
\`\`\`
loot.push('shield')    // now ['potion', 'sword', 'map', 'shield']
\`\`\`

The \`.\` means "use something that belongs to this list". \`loot.length\` is the list's size; \`loot.push(...)\` is something the list can *do*.
`,
      },
      {
        kind: 'visual',
        title: 'Slots in the carton',
        code: `const loot = ['potion', 'sword']
console.log(loot[0])
loot.push('shield')
console.log(loot.length)`,
        frames: [
          {
            line: 1,
            caption: 'One box, **loot**, holds a list with two slots: **0** and **1**.',
            lanes: [
              { title: 'loot', layout: 'row', items: ['0: potion', '1: sword'] },
              { title: 'Output', items: [] },
            ],
          },
          {
            line: 2,
            caption: '`loot[0]` means "slot 0" → **potion**. The first slot is 0, not 1.',
            lanes: [
              { title: 'loot', layout: 'row', items: ['0: potion', '1: sword'], highlight: [0] },
              { title: 'Output', items: ['potion'], highlight: [0] },
            ],
          },
          {
            line: 3,
            caption: '`push` adds a new slot **at the end**: slot 2 = shield.',
            lanes: [
              { title: 'loot', layout: 'row', items: ['0: potion', '1: sword', '2: shield'], highlight: [2] },
              { title: 'Output', items: ['potion'] },
            ],
          },
          {
            line: 4,
            caption: '`length` counts the items: **3**. (The last slot number is always length − 1.)',
            lanes: [
              { title: 'loot', layout: 'row', items: ['0: potion', '1: sword', '2: shield'] },
              { title: 'Output', items: ['potion', '3'], highlight: [1] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'What does this print?',
        code: `const letters = ['a', 'b', 'c']\nconsole.log(letters[1])`,
        options: ["'a'", 'b', 'c', 'undefined'],
        answer: 1,
        explain: 'Slot 0 is `a`, slot 1 is `b`. Counting from 0 feels weird for a week, then it becomes automatic.',
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Pack your bag',
        instructions: `
1. Add \`'shield'\` to the end of \`loot\` with \`push\`.
2. Print the **first** item.
3. Print how many items are in the list now.
`,
        starter: `const loot = ['potion', 'sword']\n\n// 1. add 'shield'\n___\n\n// 2. print the first item\nconsole.log(___)\n\n// 3. print how many items\nconsole.log(___)\n`,
        tests: `test("loot is ['potion', 'sword', 'shield']", () => expect(loot).toEqual(['potion', 'sword', 'shield']))
test('prints potion first', () => expect(printed()[0]).toBe('potion'))
test('prints 3', () => expect(printed()[1]).toBe('3'))`,
        hint: "loot.push('shield') · console.log(loot[0]) · console.log(loot.length)",
        solution: `const loot = ['potion', 'sword']\n\n// 1. add 'shield'\nloot.push('shield')\n\n// 2. print the first item\nconsole.log(loot[0])\n\n// 3. print how many items\nconsole.log(loot.length)\n`,
      },
    ],
  },
  {
    id: 'js-b5',
    title: 'Functions 1: Name It Once, Use It Anytime',
    minutes: 12,
    steps: [
      {
        kind: 'concept',
        title: 'A function is a saved recipe',
        eli5: 'A function is a **recipe card**. Writing the card (defining) doesn\'t cook anything. Cooking happens only when you say "make it!" (calling). And you can cook the same card as many times as you want.',
        body: `
## Step 1: define it (write the recipe card)
\`\`\`
function cheer() {
  console.log('Go team!')
}
\`\`\`
- \`function\` = "I'm making a recipe"
- \`cheer\` = its name
- \`()\` = where inputs go (empty for now, more on that next lesson)
- \`{ ... }\` = the steps, the **body**. Everything inside runs together.

**Defining does nothing by itself.** Nothing is printed yet.

## Step 2: call it (cook it)
\`\`\`
cheer()   // Go team!
cheer()   // Go team!
\`\`\`
Name + \`()\` = **run it now**. JavaScript jumps into the function, runs the body, then comes back to where it left off.

> Why bother? Write the steps once, use them in 50 places. Fix a bug once, it's fixed everywhere.
`,
      },
      {
        kind: 'visual',
        title: 'Watch JavaScript jump into the function and back',
        code: `function cheer() {
  console.log('Go team!')
}

console.log('Start')
cheer()
cheer()
console.log('End')`,
        frames: [
          {
            line: 1,
            caption: 'JavaScript reads the recipe card and **files it away** under the name cheer. Nothing runs yet.',
            lanes: [
              { title: 'Saved recipes', items: ['cheer()'], highlight: [0] },
              { title: 'Output', items: [] },
            ],
          },
          {
            line: 5,
            caption: 'It skips over the body and continues with the next real instruction: print **Start**.',
            lanes: [
              { title: 'Saved recipes', items: ['cheer()'] },
              { title: 'Output', items: ['Start'], highlight: [0] },
            ],
          },
          {
            line: 6,
            caption: '`cheer()` = call it! JavaScript **jumps** to the function...',
            lanes: [
              { title: 'Saved recipes', items: ['cheer()  ← running'], highlight: [0] },
              { title: 'Output', items: ['Start'] },
            ],
          },
          {
            line: 2,
            caption: '...runs the body: prints **Go team!** ...',
            lanes: [
              { title: 'Saved recipes', items: ['cheer()  ← running'], highlight: [0] },
              { title: 'Output', items: ['Start', 'Go team!'], highlight: [1] },
            ],
          },
          {
            line: 7,
            caption: '...then **comes back** to the line after the call. Another `cheer()`, so it jumps in again.',
            lanes: [
              { title: 'Saved recipes', items: ['cheer()  ← running'], highlight: [0] },
              { title: 'Output', items: ['Start', 'Go team!'] },
            ],
          },
          {
            line: 2,
            caption: 'Same recipe, cooked a second time: **Go team!** again.',
            lanes: [
              { title: 'Saved recipes', items: ['cheer()  ← running'], highlight: [0] },
              { title: 'Output', items: ['Start', 'Go team!', 'Go team!'], highlight: [2] },
            ],
          },
          {
            line: 8,
            caption: 'Back out, last line: **End**. One recipe, used twice.',
            lanes: [
              { title: 'Saved recipes', items: ['cheer()'] },
              { title: 'Output', items: ['Start', 'Go team!', 'Go team!', 'End'], highlight: [3] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'Careful. What does this print?',
        code: `function wave() {\n  console.log('bye!')\n}\n\nconsole.log('hi')`,
        options: ['hi', 'bye! then hi', 'hi then bye!', 'Nothing'],
        answer: 0,
        explain:
          "`wave` is defined but never **called** (there's no `wave()` anywhere), so its body never runs. Only `hi` is printed. Forgetting to call a function is a super common bug.",
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your first function',
        instructions: `
1. Inside the function \`battleCry\`, print \`For glory!\`
2. Below the function, **call** \`battleCry\` two times.

You should see \`For glory!\` printed twice.
`,
        starter: `// 1. Define the function (write the recipe card)\nfunction battleCry() {\n  // print 'For glory!' here\n  ___\n}\n\n// 2. Call it two times (cook it twice)\n___\n___\n`,
        tests: `test('battleCry is a function', () => expect(typeof battleCry).toBe('function'))
test('prints For glory! twice', () => expect(printed()).toEqual(['For glory!', 'For glory!']))
test('calling it again prints again', () => { const before = printed().length; battleCry(); expect(printed().length).toBe(before + 1) })`,
        hint: "Inside the braces: console.log('For glory!'). Below the function, two lines that each say battleCry()",
        solution: `// 1. Define the function (write the recipe card)\nfunction battleCry() {\n  // print 'For glory!' here\n  console.log('For glory!')\n}\n\n// 2. Call it two times (cook it twice)\nbattleCry()\nbattleCry()\n`,
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your turn: countdown',
        instructions: `
No blanks this time. Write it yourself:

1. Define a function called \`countdown\` that prints \`3\`, then \`2\`, then \`1\`, then \`Go!\` (four lines).
2. Call it **once**.
`,
        starter: `// Write the countdown function here, then call it\n\n`,
        tests: `test('countdown is a function', () => expect(typeof countdown).toBe('function'))
test('prints 3, 2, 1, Go!', () => expect(printed()).toEqual(['3', '2', '1', 'Go!']))
test('calling it again prints 4 more lines', () => { countdown(); expect(printed().length).toBe(8) })`,
        hint: "function countdown() { ... } with four console.log lines inside: console.log(3) ... console.log('Go!'). Then countdown() on its own line below.",
        solution: `function countdown() {\n  console.log(3)\n  console.log(2)\n  console.log(1)\n  console.log('Go!')\n}\n\ncountdown()\n`,
      },
    ],
  },
  {
    id: 'js-b6',
    title: 'Functions 2: Inputs (Parameters)',
    minutes: 12,
    steps: [
      {
        kind: 'concept',
        title: 'Same recipe, different ingredients',
        eli5: 'A coffee shop has one recipe for "latte", but **your order** fills in the details: size, milk, name on the cup. Parameters are the blanks on the order form.',
        body: `
\`\`\`
function greet(name) {
  console.log('Hello, ' + name)
}

greet('Ada')     // Hello, Ada
greet('Linus')   // Hello, Linus
\`\`\`

- \`name\` in the parentheses is a **parameter**: a variable that only exists inside the function.
- When you call \`greet('Ada')\`, the value \`'Ada'\` (called an **argument**) gets put into the \`name\` box for that run.
- Next call, \`name\` gets a fresh value.

## More than one input
Separate them with commas. They fill in **in order**:
\`\`\`
function attack(target, damage) {
  console.log(target + ' takes ' + damage + ' damage')
}
attack('Goblin', 12)   // Goblin takes 12 damage
\`\`\`
`,
      },
      {
        kind: 'visual',
        title: 'Filling in the blanks',
        code: `function greet(name) {
  console.log('Hello, ' + name)
}

greet('Ada')
greet('Linus')`,
        frames: [
          {
            line: 1,
            caption: 'The recipe is filed away. It has one blank, called **name**.',
            lanes: [
              { title: 'Inside greet', items: ['name = (empty)'] },
              { title: 'Output', items: [] },
            ],
          },
          {
            line: 5,
            caption: "`greet('Ada')`: jump into greet, and **'Ada' fills the name blank**.",
            lanes: [
              { title: 'Inside greet', items: ["name = 'Ada'"], highlight: [0] },
              { title: 'Output', items: [] },
            ],
          },
          {
            line: 2,
            caption: "'Hello, ' + name → 'Hello, ' + 'Ada' → **Hello, Ada**",
            lanes: [
              { title: 'Inside greet', items: ["name = 'Ada'"] },
              { title: 'Output', items: ['Hello, Ada'], highlight: [0] },
            ],
          },
          {
            line: 6,
            caption: "New call, fresh blank: **'Linus'** goes into name this time.",
            lanes: [
              { title: 'Inside greet', items: ["name = 'Linus'"], highlight: [0] },
              { title: 'Output', items: ['Hello, Ada'] },
            ],
          },
          {
            line: 2,
            caption: 'Same recipe, different input, different result: **Hello, Linus**.',
            lanes: [
              { title: 'Inside greet', items: ["name = 'Linus'"] },
              { title: 'Output', items: ['Hello, Ada', 'Hello, Linus'], highlight: [1] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'What does this print?',
        code: `function add(a, b) {\n  console.log(a + b)\n}\n\nadd(2, 5)`,
        options: ['a + b', '7', '25', 'Nothing'],
        answer: 1,
        explain: "The call fills the blanks in order: `a` gets 2, `b` gets 5. They're numbers (no quotes), so `a + b` is math: 7.",
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Greet the party',
        instructions: `
1. Finish \`greet(name)\` so it prints \`Hello, \` + the name + \`!\` (so \`greet('Ada')\` prints \`Hello, Ada!\`).
2. Call \`greet\` twice, with two different names.
`,
        starter: `function greet(name) {\n  console.log(___)\n}\n\n// call greet with two different names\n___\n___\n`,
        tests: `test('prints two greetings', () => expect(printed().length).toBe(2))
test('greetings look like Hello, NAME!', () => { for (const line of printed()) if (!/^Hello, .+!$/.test(line)) throw new Error('Got "' + line + '" (should look like Hello, Ada!)') })
test("greet('Zed') prints Hello, Zed!", () => { greet('Zed'); expect(printed().at(-1)).toBe('Hello, Zed!') })`,
        hint: "console.log('Hello, ' + name + '!') inside. Then greet('Ada') and greet('Linus') below.",
        solution: `function greet(name) {\n  console.log('Hello, ' + name + '!')\n}\n\n// call greet with two different names\ngreet('Ada')\ngreet('Linus')\n`,
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your turn: two inputs',
        instructions: `
Write it from scratch:

1. A function \`attack(target, damage)\` that prints \`TARGET takes DAMAGE damage\`. So \`attack('Goblin', 12)\` prints \`Goblin takes 12 damage\`.
2. Call it twice: once for a \`'Goblin'\` taking \`12\`, once for a \`'Dragon'\` taking \`40\`.
`,
        starter: `// Write attack(target, damage) here, then call it twice\n\n`,
        tests: `test('attack is a function with 2 inputs', () => { expect(typeof attack).toBe('function'); expect(attack.length).toBe(2) })
test('prints both attacks', () => expect(printed()).toEqual(['Goblin takes 12 damage', 'Dragon takes 40 damage']))
test("attack('Slime', 3) works too", () => { attack('Slime', 3); expect(printed().at(-1)).toBe('Slime takes 3 damage') })`,
        hint: "function attack(target, damage) { console.log(target + ' takes ' + damage + ' damage') } — mind the spaces inside the quotes.",
        solution: `function attack(target, damage) {\n  console.log(target + ' takes ' + damage + ' damage')\n}\n\nattack('Goblin', 12)\nattack('Dragon', 40)\n`,
      },
    ],
  },
  {
    id: 'js-b7',
    title: 'Functions 3: Outputs (return)',
    minutes: 15,
    steps: [
      {
        kind: 'concept',
        title: 'return hands a value back',
        eli5: "`return` is a **vending machine dropping the snack into your hand**: you can eat it, save it, share it. `console.log` is the machine just **showing a picture** of the snack on its screen: nice to look at, but you can't do anything with it.",
        body: `
So far our functions *printed* things. Usually, you want a function to **give you back** an answer you can keep using:

\`\`\`
function double(n) {
  return n * 2
}

const result = double(5)   // double(5) becomes 10
console.log(result + 1)    // 11
\`\`\`

- \`return\` sends a value **back to the place that called the function**.
- \`double(5)\` is *replaced* by whatever it returns (10), so \`const result = double(5)\` puts 10 in the result box.
- \`return\` also **ends the function** immediately. Lines after it don't run.

## console.log vs return
- **console.log**: *you* see the value in the Output panel. The code can't use it afterward.
- **return**: the *code that called the function* gets the value, and can store it, do math with it, or pass it on.

> Most real functions **return** values and don't print anything. Printing is for you, the human, to peek at what's happening.
`,
      },
      {
        kind: 'visual',
        title: 'The value travels back',
        code: `function double(n) {
  return n * 2
}

const result = double(5)
console.log(result + 1)`,
        frames: [
          {
            line: 5,
            caption: 'To fill the **result** box, JavaScript first needs to know what `double(5)` is. So it calls double.',
            lanes: [
              { title: 'Inside double', items: [] },
              { title: 'Boxes', items: ['result = ⏳ waiting'], highlight: [0] },
              { title: 'Output', items: [] },
            ],
          },
          {
            line: 1,
            caption: 'Inside double, the blank **n** gets 5.',
            lanes: [
              { title: 'Inside double', items: ['n = 5'], highlight: [0] },
              { title: 'Boxes', items: ['result = ⏳ waiting'] },
              { title: 'Output', items: [] },
            ],
          },
          {
            line: 2,
            caption: '`return n * 2` → **10** is handed back, and the function is done.',
            lanes: [
              { title: 'Inside double', items: ['n = 5', 'return 10  ↩'], highlight: [1] },
              { title: 'Boxes', items: ['result = ⏳ waiting'] },
              { title: 'Output', items: [] },
            ],
          },
          {
            line: 5,
            caption: '`double(5)` is **replaced by 10**, and 10 goes into the result box. Notice: nothing was printed!',
            lanes: [
              { title: 'Inside double', items: [] },
              { title: 'Boxes', items: ['result = 10'], highlight: [0] },
              { title: 'Output', items: [] },
            ],
          },
          {
            line: 6,
            caption: "Now we *use* the returned value: result + 1 = **11**. That's the power of return.",
            lanes: [
              { title: 'Inside double', items: [] },
              { title: 'Boxes', items: ['result = 10'] },
              { title: 'Output', items: ['11'], highlight: [0] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'This function prints instead of returning. What gets printed?',
        code: `function five() {\n  console.log(5)\n}\n\nconst result = five()\nconsole.log(result)`,
        options: ['5 then 5', '5 then undefined', 'undefined then 5', 'Just 5'],
        answer: 1,
        explain:
          'Calling `five()` prints 5. But it never **returns** anything, so `five()` is replaced by `undefined` ("nothing"), and result holds undefined. If you ever see a surprise `undefined`, check for a missing `return`.',
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Functions that answer back',
        instructions: `
Write two functions that **return** (not print) their answer:

1. \`double(n)\` returns \`n\` times 2. So \`double(4)\` returns \`8\`.
2. \`greet(name)\` returns the text \`Hello, NAME!\`. So \`greet('Ada')\` returns \`'Hello, Ada!'\`.

The \`console.log\` lines at the bottom are already written, so you can see your answers.
`,
        starter: `function double(n) {\n  ___\n}\n\nfunction greet(name) {\n  ___\n}\n\nconsole.log(double(4))\nconsole.log(greet('Ada'))\n`,
        tests: `test('double(4) returns 8', () => expect(double(4)).toBe(8))
test('double(21) returns 42', () => expect(double(21)).toBe(42))
test("greet('Ada') returns 'Hello, Ada!'", () => expect(greet('Ada')).toBe('Hello, Ada!'))
test("greet('Linus') returns 'Hello, Linus!'", () => expect(greet('Linus')).toBe('Hello, Linus!'))`,
        hint: "return n * 2 · return 'Hello, ' + name + '!'",
        solution: `function double(n) {\n  return n * 2\n}\n\nfunction greet(name) {\n  return 'Hello, ' + name + '!'\n}\n\nconsole.log(double(4))\nconsole.log(greet('Ada'))\n`,
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your turn: functions using functions',
        instructions: `
From scratch, and a little harder:

1. \`area(width, height)\` **returns** width times height.
2. \`isBigRoom(width, height)\` **returns** \`true\` if the room's area is more than \`100\`, otherwise \`false\`. **Use your \`area\` function inside it** instead of doing the math again.

Tip: a comparison like \`x > 100\` already *is* true or false, so you can return it directly.
`,
        starter: `// Write area and isBigRoom here\n\n`,
        tests: `test('area(5, 4) returns 20', () => expect(area(5, 4)).toBe(20))
test('area(12, 10) returns 120', () => expect(area(12, 10)).toBe(120))
test('isBigRoom(12, 10) returns true', () => expect(isBigRoom(12, 10)).toBe(true))
test('isBigRoom(10, 10) returns false (100 is not MORE than 100)', () => expect(isBigRoom(10, 10)).toBe(false))
test('isBigRoom uses area()', () => { if (!isBigRoom.toString().includes('area(')) throw new Error('Call area(width, height) inside isBigRoom') })`,
        hint: 'function area(width, height) { return width * height } · function isBigRoom(width, height) { return area(width, height) > 100 }',
        solution: `function area(width, height) {\n  return width * height\n}\n\nfunction isBigRoom(width, height) {\n  return area(width, height) > 100\n}\n`,
      },
      {
        kind: 'explain',
        prompt: 'In your own words: what is the difference between `console.log` and `return` inside a function?',
        keyPoints: [
          'console.log only shows a value on the screen, for you',
          'return hands the value back to the code that called the function',
          'A function without return gives back undefined',
          'return also stops the function',
        ],
      },
    ],
  },
  {
    id: 'js-b8',
    title: 'Template Literals: Easier Text',
    minutes: 12,
    steps: [
      {
        kind: 'concept',
        title: 'Drop values straight into text',
        eli5: 'Gluing text with `+` is like building a sentence out of cut-up magazine letters. A **template literal** is a **fill-in-the-blank form**: write the whole sentence, and leave slots where the values go.',
        body: `
Gluing with \`+\` gets messy fast (and it's easy to forget a space):
\`\`\`
'Ada' + ' is level ' + 7 + ' with ' + 80 + ' HP'
\`\`\`

A **template literal** uses **backticks** \` \` \` (the key above Tab, left of 1) instead of quotes. Inside, \`\${ }\` is a slot: whatever is in the slot gets dropped into the text.
\`\`\`
const name = 'Ada'
const level = 7
console.log(\`\${name} is level \${level}\`)   // Ada is level 7
\`\`\`

## You can put any expression in a slot
\`\`\`
console.log(\`Next level: \${level + 1}\`)   // Next level: 8
\`\`\`

> Quotes \`'...'\` = plain text. Backticks \`\\\`...\\\`\` = text with slots. Slots only work with backticks.
`,
      },
      {
        kind: 'quiz',
        prompt: 'Which line prints `Ada has 3 potions`?',
        code: `const name = 'Ada'\nconst potions = 3`,
        options: [
          "console.log('${name} has ${potions} potions')",
          'console.log(`${name} has ${potions} potions`)',
          'console.log(`name has potions potions`)',
          'console.log("${name}" + " has potions")',
        ],
        answer: 1,
        explain:
          'Slots `${...}` only work inside **backticks**. With normal quotes (option A) you get the literal characters `${name}` printed, which is a very common slip.',
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Guided: a greeting with slots',
        instructions: `
Finish \`greet(name)\` so it **returns** \`Hello, NAME!\` using a template literal instead of \`+\`.

The backticks and the start are written for you. Replace the \`___\` with a slot that holds \`name\`.
`,
        starter: "function greet(name) {\n  return `Hello, ___!`\n}\n\nconsole.log(greet('Ada'))\n",
        tests: `test("greet('Ada') returns 'Hello, Ada!'", () => expect(greet('Ada')).toBe('Hello, Ada!'))
test("greet('Linus') returns 'Hello, Linus!'", () => expect(greet('Linus')).toBe('Hello, Linus!'))
test('uses a template literal', () => { if (!greet.toString().includes('\${')) throw new Error('Use a \${name} slot inside backticks') })`,
        hint: 'Replace ___ with ${name}, so the line reads: return `Hello, ${name}!`',
        solution: "function greet(name) {\n  return `Hello, ${name}!`\n}\n\nconsole.log(greet('Ada'))\n",
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your turn: a health bar label',
        instructions: `
From scratch, with math inside a slot:

Write \`healthLabel(name, hp, maxHp)\` that **returns** text like this:

\`healthLabel('Ada', 30, 120)\` → \`Ada: 30/120 HP (25%)\`

The percentage is \`hp / maxHp * 100\`, rounded to a whole number with \`Math.round(...)\`. Use a template literal.
`,
        starter: `// Write healthLabel(name, hp, maxHp) here\n\n`,
        tests: `test("healthLabel('Ada', 30, 120)", () => expect(healthLabel('Ada', 30, 120)).toBe('Ada: 30/120 HP (25%)'))
test("healthLabel('Linus', 50, 50)", () => expect(healthLabel('Linus', 50, 50)).toBe('Linus: 50/50 HP (100%)'))
test('rounds the percentage', () => expect(healthLabel('Grace', 1, 3)).toBe('Grace: 1/3 HP (33%)'))
test('uses a template literal', () => { if (!healthLabel.toString().includes('\${')) throw new Error('Build the text with \${...} slots inside backticks') })`,
        hint: 'return `${name}: ${hp}/${maxHp} HP (${Math.round(hp / maxHp * 100)}%)` — four slots, and the last one does the math.',
        solution: 'function healthLabel(name, hp, maxHp) {\n  return `${name}: ${hp}/${maxHp} HP (${Math.round((hp / maxHp) * 100)}%)`\n}\n',
      },
    ],
  },
]
