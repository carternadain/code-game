import type { Lesson } from '../types'

export const linkedLists: Lesson[] = [
  {
    id: 'dsa-ll',
    title: 'Linked Lists: A Treasure Hunt of Pointers',
    minutes: 14,
    uses: ['dsa-3', 'js-4', 'cs-3'],
    steps: [
      {
        kind: 'concept',
        title: 'Each clue points to the next clue',
        eli5: 'A linked list is a **treasure hunt**. Each clue holds a little treasure *and* says where the next clue is hidden. To reach clue 5 you must follow clues 1, 2, 3 and 4 first. The last clue says "the end".',
        body: `
A **linked list** is a chain of **nodes**. Each node is a tiny object with two things:

- \`value\`: the data it holds
- \`next\`: a **reference** to the next node (or \`null\` at the end)

\`\`\`
const c = { value: 'C', next: null }
const b = { value: 'B', next: c }
const a = { value: 'A', next: b }
let head = a   // A → B → C → null
\`\`\`

You only keep hold of the first node, the **head**. Everything else is reached by following \`next\`.

## Remember references? (Object Outpost)
\`next: c\` does **not** copy \`c\`. It stores an arrow pointing at the same object. The nodes live scattered around the **heap** (Stack vs Heap), and the arrows tie them together.

## Linked list vs array
- **Add at the front:** list = O(1), just make a new head. Array = O(n), every item shuffles over.
- **Get item #500:** array = O(1), jump straight there. List = O(n), walk 500 arrows.
- **Remove from the middle** (when you're already there): list = O(1), re-point one arrow.

> Real uses: queues (O(1) take from the front, unlike \`shift()\`), undo history, browser back/forward, and inside hash map buckets.
`,
      },
      {
        kind: 'visual',
        title: 'Insert at the head, delete by re-pointing',
        code: `const c = { value: 'C', next: null }
const b = { value: 'B', next: c }
const a = { value: 'A', next: b }
let head = a
head = { value: 'Z', next: head }
a.next = a.next.next`,
        frames: [
          {
            line: 1,
            caption: 'Make the last node first. `C` points at nothing: `null` means "the end".',
            lanes: [{ title: 'The chain', layout: 'row', items: ['C → null'], highlight: [0] }],
          },
          {
            line: 3,
            caption: '`B` points at `C`, then `A` points at `B`. Three objects joined by arrows.',
            lanes: [{ title: 'The chain', layout: 'row', items: ['A →', 'B →', 'C → null'], highlight: [0, 1] }],
          },
          {
            line: 4,
            caption: '`head` is our only handle. It points at `A`, the start of the hunt.',
            lanes: [
              { title: 'head', items: ['→ A'], highlight: [0] },
              { title: 'The chain', layout: 'row', items: ['A →', 'B →', 'C → null'] },
            ],
          },
          {
            line: 5,
            caption: 'Insert at the front: a new node `Z` whose `next` is the old head. Move `head` to `Z`. **One step, no shuffling: O(1).**',
            lanes: [
              { title: 'head', items: ['→ Z'], highlight: [0] },
              { title: 'The chain', layout: 'row', items: ['Z →', 'A →', 'B →', 'C → null'], highlight: [0] },
            ],
          },
          {
            line: 6,
            caption: 'Delete `B`: make `A` skip over it. `a.next` was `B`, now it is `B.next`, which is `C`.',
            lanes: [
              { title: 'head', items: ['→ Z'] },
              { title: 'The chain', layout: 'row', items: ['Z →', 'A ⤼', 'B (skipped)', 'C → null'], highlight: [1, 2] },
            ],
          },
          {
            line: 6,
            caption: 'Nothing points at `B` any more, so the garbage collector throws it away. The chain is `Z → A → C`.',
            lanes: [
              { title: 'head', items: ['→ Z'] },
              { title: 'The chain', layout: 'row', items: ['Z →', 'A →', 'C → null'], highlight: [1, 2] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'A linked list has 1,000 nodes. How many steps to read the value of the **last** node, if you only have `head`?',
        options: ['1, like an array', 'About 10', 'About 1,000: follow every arrow', 'It is impossible'],
        answer: 2,
        explain: 'There is no index to jump to. You start at `head` and follow `next` again and again: O(n). That is the price of O(1) inserts at the front.',
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Guided: walk the chain, add to the front',
        instructions: `
Nodes look like \`{ value, next }\`.

1. \`toArray(head)\` returns all the values in order. \`A → B → C\` → \`['A', 'B', 'C']\`. An empty list (\`head\` is \`null\`) → \`[]\`.
   The walking loop is written for you. Just **push** each value.
2. \`prepend(head, value)\` returns the **new head**: a new node whose \`next\` is the old head.
`,
        starter: `function toArray(head) {
  const out = []
  let node = head
  while (node !== null) {
    // push node.value into out here
    node = node.next
  }
  return out
}

function prepend(head, value) {
  // return a new node that points at head
  return head
}

const list = { value: 'A', next: { value: 'B', next: { value: 'C', next: null } } }
console.log(toArray(prepend(list, 'Z')))
`,
        tests: `const llDemo = { value: 1, next: { value: 2, next: { value: 3, next: null } } }
test('toArray walks every node', () => expect(toArray(llDemo)).toEqual([1, 2, 3]))
test('toArray of an empty list is []', () => expect(toArray(null)).toEqual([]))
test('prepend puts the value first', () => expect(toArray(prepend(llDemo, 0))).toEqual([0, 1, 2, 3]))
test('prepend points at the old head (no copying)', () => expect(prepend(llDemo, 0).next).toBe(llDemo))
test('prepend onto an empty list', () => expect(prepend(null, 'x')).toEqual({ value: 'x', next: null }))`,
        hint: 'Inside the loop: out.push(node.value). For prepend: return { value: value, next: head }',
        solution: `function toArray(head) {
  const out = []
  let node = head
  while (node !== null) {
    out.push(node.value)
    node = node.next
  }
  return out
}

function prepend(head, value) {
  return { value, next: head }
}

const list = { value: 'A', next: { value: 'B', next: { value: 'C', next: null } } }
console.log(toArray(prepend(list, 'Z')))
`,
      },
      {
        kind: 'visual',
        title: 'Reversing: three fingers, flip one arrow at a time',
        code: `function reverse(head) {
  let prev = null
  let curr = head
  while (curr !== null) {
    const next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}`,
        frames: [
          {
            line: 3,
            caption: 'Start: `prev` is nothing, `curr` is the head. The goal is to flip every arrow to point backwards.',
            lanes: [
              { title: 'Arrows', layout: 'row', items: ['1 → 2', '2 → 3', '3 → null'] },
              { title: 'prev', items: ['null'] },
              { title: 'curr', items: ['1'], highlight: [0] },
              { title: 'next', items: [] },
            ],
          },
          {
            line: 6,
            caption: 'Save `next` (2) **first**, or we lose the rest of the chain. Then flip: `1` now points back at `prev` (null).',
            lanes: [
              { title: 'Arrows', layout: 'row', items: ['1 → null', '2 → 3', '3 → null'], highlight: [0] },
              { title: 'prev', items: ['null'] },
              { title: 'curr', items: ['1'] },
              { title: 'next', items: ['2'], highlight: [0] },
            ],
          },
          {
            line: 8,
            caption: 'Step all fingers forward: `prev` = 1, `curr` = 2.',
            lanes: [
              { title: 'Arrows', layout: 'row', items: ['1 → null', '2 → 3', '3 → null'] },
              { title: 'prev', items: ['1'], highlight: [0] },
              { title: 'curr', items: ['2'], highlight: [0] },
              { title: 'next', items: ['2'] },
            ],
          },
          {
            line: 6,
            caption: 'Save `next` (3). Flip: `2` now points back at `1`.',
            lanes: [
              { title: 'Arrows', layout: 'row', items: ['1 → null', '2 → 1', '3 → null'], highlight: [1] },
              { title: 'prev', items: ['1'] },
              { title: 'curr', items: ['2'] },
              { title: 'next', items: ['3'], highlight: [0] },
            ],
          },
          {
            line: 6,
            caption: 'Step forward and do it again: save `next` (null), flip `3` to point at `2`.',
            lanes: [
              { title: 'Arrows', layout: 'row', items: ['1 → null', '2 → 1', '3 → 2'], highlight: [2] },
              { title: 'prev', items: ['2'] },
              { title: 'curr', items: ['3'] },
              { title: 'next', items: ['null'] },
            ],
          },
          {
            line: 10,
            caption: '`curr` walks off the end (null), so the loop stops. `prev` is node 3: the **new head**. The list now reads 3 → 2 → 1.',
            lanes: [
              { title: 'Arrows', layout: 'row', items: ['3 → 2', '2 → 1', '1 → null'], highlight: [0, 1, 2] },
              { title: 'prev', items: ['3 (new head)'], highlight: [0] },
              { title: 'curr', items: ['null'] },
              { title: 'next', items: ['null'] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'In `reverse`, what goes wrong if you delete the line `const next = curr.next` and write `curr = curr.next` at the end instead?',
        options: [
          'Nothing, it works the same',
          'After flipping, `curr.next` is the OLD node, so you walk backwards and lose the rest of the list',
          'It runs faster',
          'It throws a syntax error',
        ],
        answer: 1,
        explain:
          'Once you do `curr.next = prev`, the arrow to the rest of the chain is gone. You must save it in `next` **before** you flip. Treasure hunt rule: read the next clue before you erase it.',
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your turn: reverse a linked list',
        instructions: `
The classic interview question. Write \`reverse(head)\` that reverses the list **in place** (flip the arrows, don't build an array) and returns the new head.

\`1 → 2 → 3\` becomes \`3 → 2 → 1\`. An empty list (\`null\`) stays \`null\`.

Use three fingers: \`prev\`, \`curr\`, \`next\`. Peek at the visual above if you get stuck.
`,
        starter: `function reverse(head) {
  let prev = null
  let curr = head
  // flip one arrow per loop

  return head
}
`,
        tests: `function llFrom(arr) { let h = null; for (let i = arr.length - 1; i >= 0; i--) h = { value: arr[i], next: h }; return h }
function llTo(h) { const out = []; while (h) { out.push(h.value); h = h.next } return out }
test('reverses 1 → 2 → 3', () => expect(llTo(reverse(llFrom([1, 2, 3])))).toEqual([3, 2, 1]))
test('reverses a single node', () => expect(llTo(reverse(llFrom(['solo'])))).toEqual(['solo']))
test('empty list stays null', () => expect(reverse(null)).toBe(null))
test('old head becomes the tail', () => { const h = llFrom([1, 2, 3, 4]); const nh = reverse(h); expect(nh.value).toBe(4); expect(h.next).toBe(null) })
test('reuses the same nodes (in place)', () => { const h = llFrom(['a', 'b']); const second = h.next; expect(reverse(h)).toBe(second) })`,
        hint: 'while (curr !== null) { const next = curr.next; curr.next = prev; prev = curr; curr = next } return prev',
        solution: `function reverse(head) {
  let prev = null
  let curr = head
  while (curr !== null) {
    const next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}
`,
      },
      {
        kind: 'explain',
        prompt: 'Explain to a friend why adding to the front of a linked list is fast, but reading item #100 is slow.',
        keyPoints: [
          'Each node only knows the next node (value + next)',
          'Adding at the front = one new node pointing at the old head, no shuffling: O(1)',
          'There are no indexes, so to reach #100 you follow 100 arrows: O(n)',
          'Arrays are the opposite: O(1) index lookup, O(n) insert at the front',
        ],
      },
    ],
  },
]

export const sorting: Lesson[] = [
  {
    id: 'dsa-sort',
    title: 'Sorting: Bubble Sort to Merge Sort',
    minutes: 15,
    uses: ['dsa-1', 'js-b4', 'cs-2'],
    steps: [
      {
        kind: 'concept',
        title: 'Why sorting matters',
        eli5: 'Finding a name in a **jumbled pile of exam papers** means checking every one. If they are in **alphabetical order**, you can flip straight to the right spot. Sorting is tidying up so that finding is fast later.',
        body: `
Sorted data unlocks fast tricks:

- **Binary search** (the next lesson) finds an item in O(log n), but *only* in sorted data.
- Duplicates end up side by side, so they're easy to spot.
- Leaderboards, "newest first", alphabetical lists: all sorting.

## Two ways to sort
1. **Bubble sort**: compare neighbours, swap if they're in the wrong order, repeat. Simple, but **O(n²)**.
2. **Merge sort**: split the list in half, sort each half, then **merge** the two sorted halves. **O(n log n)**. This is *divide and conquer*.

How big is the gap? For 100,000 items, O(n²) ≈ 10 billion steps. O(n log n) ≈ 1.7 million. Seconds vs. milliseconds.
`,
      },
      {
        kind: 'visual',
        title: 'Bubble sort: big numbers float to the end',
        code: `for (let i = 0; i < a.length; i++) {
  for (let j = 0; j < a.length - 1 - i; j++) {
    if (a[j] > a[j + 1]) {
      ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
    }
  }
}`,
        frames: [
          {
            line: 3,
            caption: 'Compare the first two neighbours: 5 > 3? Yes, so they are in the wrong order.',
            lanes: [{ title: 'a', layout: 'row', items: ['5', '3', '8', '1'], highlight: [0, 1] }],
          },
          {
            line: 4,
            caption: '**Swap** them. Then compare 5 and 8: already in order, leave them.',
            lanes: [{ title: 'a', layout: 'row', items: ['3', '5', '8', '1'], highlight: [0, 1] }],
          },
          {
            line: 4,
            caption: '8 > 1, swap! The biggest number, 8, has **bubbled** all the way to the end. Pass 1 done.',
            lanes: [
              { title: 'a', layout: 'row', items: ['3', '5', '1', '8'], highlight: [2, 3] },
              { title: 'Done (sorted end)', layout: 'row', items: ['8'] },
            ],
          },
          {
            line: 4,
            caption: 'Pass 2: 3 and 5 are fine. 5 > 1, swap. Now 5 is in its final spot too.',
            lanes: [
              { title: 'a', layout: 'row', items: ['3', '1', '5', '8'], highlight: [1, 2] },
              { title: 'Done (sorted end)', layout: 'row', items: ['5', '8'] },
            ],
          },
          {
            line: 4,
            caption: 'Pass 3: 3 > 1, swap. Sorted!',
            lanes: [
              { title: 'a', layout: 'row', items: ['1', '3', '5', '8'], highlight: [0, 1] },
              { title: 'Done (sorted end)', layout: 'row', items: ['1', '3', '5', '8'] },
            ],
          },
          {
            caption: 'A loop inside a loop: about n × n comparisons. **O(n²)**. Fine for 10 items, painful for 100,000.',
            lanes: [{ title: 'a', layout: 'row', items: ['1', '3', '5', '8'], highlight: [0, 1, 2, 3] }],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'Bubble sort takes 1 second on 10,000 items. Roughly how long on 100,000 items (10× more)?',
        options: ['10 seconds', '100 seconds', '2 seconds', '1 second'],
        answer: 1,
        explain: 'O(n²): 10× the items means 10 × 10 = **100×** the work. That is why we want something better.',
      },
      {
        kind: 'visual',
        title: 'Merge sort: split, split, merge',
        frames: [
          {
            caption: 'Start with an unsorted list of 4.',
            lanes: [{ title: 'Level 0', layout: 'row', items: ['6', '2', '5', '1'] }],
          },
          {
            caption: '**Split** it in half.',
            lanes: [
              { title: 'Level 0', layout: 'row', items: ['6', '2', '5', '1'] },
              { title: 'Level 1', layout: 'row', items: ['[6, 2]', '[5, 1]'], highlight: [0, 1] },
            ],
          },
          {
            caption: '**Split** again until each piece has 1 item. A list of 1 is already sorted!',
            lanes: [
              { title: 'Level 1', layout: 'row', items: ['[6, 2]', '[5, 1]'] },
              { title: 'Level 2', layout: 'row', items: ['[6]', '[2]', '[5]', '[1]'], highlight: [0, 1, 2, 3] },
            ],
          },
          {
            caption: '**Merge** pairs back together in order: [6] + [2] → [2, 6]. [5] + [1] → [1, 5].',
            lanes: [
              { title: 'Level 2', layout: 'row', items: ['[6]', '[2]', '[5]', '[1]'] },
              { title: 'Merged', layout: 'row', items: ['[2, 6]', '[1, 5]'], highlight: [0, 1] },
            ],
          },
          {
            caption: 'Merge two sorted lists: look at the **fronts**, take the smaller one. 1 (vs 2) → 2 (vs 5) → 5 (vs 6) → 6.',
            lanes: [
              { title: 'left', layout: 'row', items: ['2', '6'] },
              { title: 'right', layout: 'row', items: ['1', '5'] },
              { title: 'result', layout: 'row', items: ['1', '2', '5', '6'], highlight: [0, 1, 2, 3] },
            ],
          },
          {
            caption: 'Halving gives **log n** levels. Each level touches all **n** items once while merging. Total: **O(n log n)**.',
            lanes: [{ title: 'Sorted', layout: 'row', items: ['1', '2', '5', '6'], highlight: [0, 1, 2, 3] }],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'What does this print?',
        code: `console.log([10, 9, 1].sort())`,
        options: ['[1, 9, 10]', '[10, 9, 1]', '[1, 10, 9]', 'An error'],
        answer: 2,
        explain:
          "JavaScript's default `.sort()` turns everything into **strings** and sorts alphabetically: '1' < '10' < '9'. For numbers always pass a compare function: `[10, 9, 1].sort((a, b) => a - b)` → `[1, 9, 10]`. (Negative result = a goes first.)",
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Guided: merge two sorted lists',
        instructions: `
Write \`merge(left, right)\`. Both inputs are **already sorted**. Return one sorted array with everything.

\`merge([2, 6], [1, 5])\` → \`[1, 2, 5, 6]\`

The plan (two fingers, \`i\` and \`j\`):
1. While both lists have items left, push the smaller of \`left[i]\` and \`right[j]\`, and move that finger forward.
2. When one runs out, add whatever is left from the other.

No \`.sort()\` allowed: that's the whole point!
`,
        starter: `function merge(left, right) {
  const result = []
  let i = 0
  let j = 0
  // 1. while (i < left.length && j < right.length) { ... }

  // 2. add the leftovers
  return [...result, ...left, ...right]
}

console.log(merge([2, 6], [1, 5]))
`,
        tests: `test('merges [2, 6] and [1, 5]', () => expect(merge([2, 6], [1, 5])).toEqual([1, 2, 5, 6]))
test('one side empty', () => expect(merge([], [1, 2])).toEqual([1, 2]))
test('different lengths', () => expect(merge([1, 4, 9, 10], [3])).toEqual([1, 3, 4, 9, 10]))
test('keeps duplicates', () => expect(merge([1, 3], [1, 3])).toEqual([1, 1, 3, 3]))
test('does not use .sort()', () => { if (merge.toString().includes('.sort(')) throw new Error('Merge by hand with two fingers, no .sort()') })`,
        hint: 'Loop: if (left[i] <= right[j]) { result.push(left[i]); i++ } else { result.push(right[j]); j++ }. After: return [...result, ...left.slice(i), ...right.slice(j)]',
        solution: `function merge(left, right) {
  const result = []
  let i = 0
  let j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i])
      i++
    } else {
      result.push(right[j])
      j++
    }
  }
  return [...result, ...left.slice(i), ...right.slice(j)]
}

console.log(merge([2, 6], [1, 5]))
`,
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your turn: merge sort',
        instructions: `
Write \`mergeSort(arr)\` using divide and conquer. Your \`merge\` is already here.

1. **Base case:** a list of 0 or 1 items is already sorted. Return it.
2. Split at the middle: \`arr.slice(0, mid)\` and \`arr.slice(mid)\`.
3. \`mergeSort\` each half (recursion!), then \`merge\` the two results.

No \`.sort()\`! One test sorts 20,000 numbers, so bubble sort won't make it.
`,
        starter: `function merge(left, right) {
  const result = []
  let i = 0
  let j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++])
    else result.push(right[j++])
  }
  return [...result, ...left.slice(i), ...right.slice(j)]
}

function mergeSort(arr) {
  // base case, split, recurse, merge
  return arr
}

console.log(mergeSort([6, 2, 5, 1]))
`,
        tests: `test('sorts [6, 2, 5, 1]', () => expect(mergeSort([6, 2, 5, 1])).toEqual([1, 2, 5, 6]))
test('sorts numbers as numbers', () => expect(mergeSort([10, 9, 1])).toEqual([1, 9, 10]))
test('empty and single', () => { expect(mergeSort([])).toEqual([]); expect(mergeSort([7])).toEqual([7]) })
test('duplicates and negatives', () => expect(mergeSort([3, -1, 3, 0, -5])).toEqual([-5, -1, 0, 3, 3]))
test('does not use .sort()', () => { if (mergeSort.toString().includes('.sort(') || merge.toString().includes('.sort(')) throw new Error('Write merge sort yourself, no .sort()') })
test('fast on 20,000 numbers', () => {
  const nums = Array.from({ length: 20000 }, (_, k) => (k * 7919) % 20011)
  const t = performance.now()
  const out = mergeSort(nums)
  if (performance.now() - t > 500) throw new Error('Too slow, is this O(n²)?')
  for (let k = 1; k < out.length; k++) if (out[k - 1] > out[k]) throw new Error('Not sorted at index ' + k)
  expect(out.length).toBe(20000)
})`,
        hint: 'if (arr.length <= 1) return arr; const mid = Math.floor(arr.length / 2); return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)))',
        solution: `function merge(left, right) {
  const result = []
  let i = 0
  let j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++])
    else result.push(right[j++])
  }
  return [...result, ...left.slice(i), ...right.slice(j)]
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)))
}

console.log(mergeSort([6, 2, 5, 1]))
`,
      },
      {
        kind: 'explain',
        prompt: 'Explain merge sort in your own words, and why it beats bubble sort on big lists.',
        keyPoints: [
          'Split the list in half again and again until pieces have 1 item',
          'Merge sorted pieces by repeatedly taking the smaller front item',
          'log n levels of splitting × n work per level = O(n log n)',
          'Bubble sort compares neighbours in a loop inside a loop: O(n²)',
        ],
      },
    ],
  },
]

export const graphs: Lesson[] = [
  {
    id: 'dsa-graph',
    title: 'Graphs: Maps of Connections',
    minutes: 15,
    uses: ['dsa-5', 'dsa-3', 'dsa-2'],
    steps: [
      {
        kind: 'concept',
        title: 'Dots and lines',
        eli5: 'A graph is a **subway map**: stations are dots, tracks are lines between them. Or a **friends list**: people are dots, friendships are lines. Any time things are *connected*, you have a graph.',
        body: `
A **graph** is:
- **Nodes** (also called vertices): the things. Cities, people, web pages.
- **Edges**: the connections between them.

## Directed or undirected?
- **Undirected**: a two-way street. If Ada is friends with Bo, Bo is friends with Ada.
- **Directed**: a one-way street. You follow a celebrity; they don't follow you back.

## The adjacency list
The most common way to store a graph: an object where each node lists its neighbours.
\`\`\`
const town = {
  home:   ['park', 'shop'],
  park:   ['home', 'lake'],
  shop:   ['home', 'lake'],
  lake:   ['park', 'shop', 'castle'],
  castle: ['lake'],
}
\`\`\`
"Who are home's neighbours?" is just \`town.home\`: an O(1) hash map lookup.

## Trees are graphs
A tree (last lesson) is a graph with **no cycles**: you can never walk in a loop back to where you started. General graphs *do* have cycles (home → park → lake → shop → home), so a search must remember where it has been with a **visited** set, or it walks in circles forever.
`,
      },
      {
        kind: 'visual',
        title: 'Depth-first search: dive deep with a stack',
        code: `function dfs(graph, start) {
  const stack = [start]
  const visited = new Set([start])
  while (stack.length > 0) {
    const node = stack.pop()
    for (const next of graph[node]) {
      if (!visited.has(next)) {
        visited.add(next)
        stack.push(next)
      }
    }
  }
  return visited
}`,
        frames: [
          {
            line: 3,
            caption: 'Explore the town from `home`. Put it on the stack and mark it visited.',
            lanes: [
              { title: 'Stack (to explore)', layout: 'stack', items: ['home'], highlight: [0] },
              { title: 'Visited', layout: 'row', items: ['home'] },
            ],
          },
          {
            line: 9,
            caption: 'Pop `home`. Its neighbours `park` and `shop` are new: mark them visited and push them.',
            lanes: [
              { title: 'Stack (to explore)', layout: 'stack', items: ['park', 'shop'], highlight: [0, 1] },
              { title: 'Visited', layout: 'row', items: ['home', 'park', 'shop'], highlight: [1, 2] },
            ],
          },
          {
            line: 7,
            caption: 'Pop the **top**: `shop`. Neighbour `home` is already visited, so skip it. `lake` is new: push it.',
            lanes: [
              { title: 'Stack (to explore)', layout: 'stack', items: ['park', 'lake'], highlight: [1] },
              { title: 'Visited', layout: 'row', items: ['home', 'park', 'shop', 'lake'], highlight: [3] },
            ],
          },
          {
            line: 9,
            caption: 'Pop `lake`. `park` and `shop` are visited. `castle` is new: push it. We keep diving deeper.',
            lanes: [
              { title: 'Stack (to explore)', layout: 'stack', items: ['park', 'castle'], highlight: [1] },
              { title: 'Visited', layout: 'row', items: ['home', 'park', 'shop', 'lake', 'castle'], highlight: [4] },
            ],
          },
          {
            line: 5,
            caption: 'Pop `castle`, then `park`. All their neighbours are visited, so nothing new is pushed.',
            lanes: [
              { title: 'Stack (to explore)', layout: 'stack', items: [] },
              { title: 'Visited', layout: 'row', items: ['home', 'park', 'shop', 'lake', 'castle'] },
            ],
          },
          {
            line: 12,
            caption: 'Stack empty: done. Every place reachable from home is in **visited**. Without that set, home → shop → home → shop… would loop forever.',
            lanes: [
              { title: 'Stack (to explore)', layout: 'stack', items: [] },
              { title: 'Visited', layout: 'row', items: ['home', 'park', 'shop', 'lake', 'castle'], highlight: [0, 1, 2, 3, 4] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'You delete the `visited` checks from `dfs` and run it on the town map. What happens?',
        options: [
          'It still works, just a bit slower',
          'It loops forever: home pushes shop, shop pushes home, home pushes shop…',
          'It throws "visited is not defined" and stops cleanly',
          'It only visits home',
        ],
        answer: 1,
        explain:
          "The town has **cycles**. Without remembering where you've been, you keep re-adding the same places and the stack never empties. Trees don't have this problem; graphs do.",
      },
      {
        kind: 'quiz',
        prompt: "A **directed** graph: `{ ada: ['bo'], bo: ['cy'], cy: [] }`. Can you get from `cy` to `ada`?",
        options: ['Yes, edges go both ways', 'No, every arrow points away from ada, so cy has no way out', 'Only if you use BFS', 'Yes, in 2 steps'],
        answer: 1,
        explain: 'Directed edges are one-way streets: ada → bo → cy. `cy` has no outgoing edges, so it reaches nothing.',
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Guided: build an adjacency list',
        instructions: `
You get a list of two-way roads as pairs: \`[['home', 'park'], ['park', 'lake']]\`.

Write \`buildGraph(edges)\` that returns an adjacency list:
\`\`\`
{ home: ['park'], park: ['home', 'lake'], lake: ['park'] }
\`\`\`
Roads are **undirected**, so each pair adds a neighbour to **both** ends. Make an empty array for a node the first time you see it.
`,
        starter: `function buildGraph(edges) {
  const graph = {}
  for (const [a, b] of edges) {
    // if graph[a] doesn't exist yet, make it []
    // same for graph[b]
    // add b to a's list, and a to b's list
  }
  return graph
}

console.log(buildGraph([['home', 'park'], ['park', 'lake']]))
`,
        tests: `test('builds a small map', () => expect(buildGraph([['home', 'park'], ['park', 'lake']])).toEqual({ home: ['park'], park: ['home', 'lake'], lake: ['park'] }))
test('edges go both ways', () => { const g = buildGraph([['ada', 'bo']]); expect(g.ada).toEqual(['bo']); expect(g.bo).toEqual(['ada']) })
test('a node with many friends', () => expect(buildGraph([['a', 'b'], ['a', 'c'], ['a', 'd']]).a).toEqual(['b', 'c', 'd']))
test('no edges → empty graph', () => expect(buildGraph([])).toEqual({}))`,
        hint: 'if (!graph[a]) graph[a] = []; if (!graph[b]) graph[b] = []; graph[a].push(b); graph[b].push(a)',
        solution: `function buildGraph(edges) {
  const graph = {}
  for (const [a, b] of edges) {
    if (!graph[a]) graph[a] = []
    if (!graph[b]) graph[b] = []
    graph[a].push(b)
    graph[b].push(a)
  }
  return graph
}

console.log(buildGraph([['home', 'park'], ['park', 'lake']]))
`,
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your turn: can I get there?',
        instructions: `
Write \`canReach(graph, from, to)\` that returns \`true\` if there is **any** path from \`from\` to \`to\`, else \`false\`.

Use DFS like the visual: a **stack** of places to explore and a **visited** Set. When you pop the node you're looking for, return \`true\`.

⚠️ The test maps have **cycles**. Forget \`visited\` and your code will loop until it times out. A node with no list (\`graph[node]\` is undefined) has no neighbours.
`,
        starter: `function canReach(graph, from, to) {
  const stack = [from]
  const visited = new Set([from])
  // while the stack isn't empty: pop, check, push new neighbours

  return false
}
`,
        tests: `const gTown = { home: ['park', 'shop'], park: ['home', 'lake'], shop: ['home', 'lake'], lake: ['park', 'shop', 'castle'], castle: ['lake'], island: [] }
test('home can reach the castle', () => expect(canReach(gTown, 'home', 'castle')).toBe(true))
test('castle can reach home (through a cycle)', () => expect(canReach(gTown, 'castle', 'home')).toBe(true))
test('nobody reaches the island', () => expect(canReach(gTown, 'home', 'island')).toBe(false))
test('a place can reach itself', () => expect(canReach(gTown, 'lake', 'lake')).toBe(true))
test('one-way streets (directed)', () => { const g = { a: ['b'], b: ['c'], c: ['a', 'd'], d: [] }; expect(canReach(g, 'a', 'd')).toBe(true); expect(canReach(g, 'd', 'a')).toBe(false) })
test('missing neighbour list', () => expect(canReach({ a: ['b'] }, 'a', 'z')).toBe(false))`,
        hint: 'while (stack.length) { const node = stack.pop(); if (node === to) return true; for (const next of graph[node] || []) { if (!visited.has(next)) { visited.add(next); stack.push(next) } } }',
        solution: `function canReach(graph, from, to) {
  const stack = [from]
  const visited = new Set([from])
  while (stack.length > 0) {
    const node = stack.pop()
    if (node === to) return true
    for (const next of graph[node] || []) {
      if (!visited.has(next)) {
        visited.add(next)
        stack.push(next)
      }
    }
  }
  return false
}
`,
      },
      {
        kind: 'explain',
        prompt: 'Explain what a graph is, how an adjacency list stores one, and why DFS needs a visited set.',
        keyPoints: [
          'Nodes connected by edges; edges can be one-way (directed) or two-way (undirected)',
          'Adjacency list: an object mapping each node to an array of its neighbours',
          'A tree is a graph without cycles',
          'Graphs can have cycles, so without visited the search revisits nodes forever',
        ],
      },
    ],
  },
]

/** Remix lessons: one problem that needs several earlier ideas at once. */
export const remixJs: Lesson[] = [
  {
    id: 'remix-js',
    title: 'Remix: The Loot Report',
    remix: true,
    minutes: 12,
    uses: ['js-b7', 'js-b8', 'js-3', 'js-4'],
    steps: [
      {
        kind: 'concept',
        title: 'Nothing new, just combos',
        eli5: 'You already know the moves. A remix is a **combo**: like a fighting game, where punch, jump and kick are simple alone, but chaining them is how you win.',
        body: `
After a dungeon run your bag is full of loot. The guild wants a neat **report**. To build it you'll chain ideas you already have:

- **Arrays** (Arrays: A List in One Box): the bag is a list
- **Objects** (Object Outpost): each item is \`{ name, value, rarity }\`
- **Functions with inputs and return** (Functions 2 and 3): take the bag in, hand the report back
- **if** (Control Flow Canyon): legendary items get a special tag
- **filter / map / reduce** (Array Armory): drop junk, turn items into lines, add up the gold
- **Template literals** (Template Literals): build each line of text

\`\`\`
const bag = [
  { name: 'Dragon Scale', value: 300, rarity: 'legendary' },
  { name: 'Rusty Spoon', value: 0, rarity: 'common' },
  { name: 'Sword', value: 50, rarity: 'common' },
]
\`\`\`

> Problem-solving tip: do it in small steps. Filter first, then map, then glue. Check each step with \`console.log\`.
`,
      },
      {
        kind: 'visual',
        title: 'The bag goes through the machine',
        frames: [
          {
            caption: 'Start: three objects in an array.',
            lanes: [{ title: 'bag', items: ['Dragon Scale 300 legendary', 'Rusty Spoon 0 common', 'Sword 50 common'] }],
          },
          {
            caption: '**filter**: keep items worth more than 0. The spoon is junk.',
            lanes: [{ title: 'after filter', items: ['Dragon Scale 300 legendary', 'Sword 50 common'], highlight: [0, 1] }],
          },
          {
            caption: '**map** + template literal + **if**: each item becomes a line of text. Legendary items get a tag.',
            lanes: [{ title: 'after map', items: ['Dragon Scale - 300g [legendary]', 'Sword - 50g'], highlight: [0] }],
          },
          {
            caption: '**reduce**: add up the gold. 0 + 300 + 50 = 350.',
            lanes: [{ title: 'total', items: ['350'], highlight: [0] }],
          },
          {
            caption: 'Glue it all together with a title and a total line. Done!',
            lanes: [{ title: 'report', items: ['LOOT REPORT', 'Dragon Scale - 300g [legendary]', 'Sword - 50g', 'TOTAL: 350g'], highlight: [0, 3] }],
          },
        ],
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Guided: loot lines',
        instructions: `
Write \`lootLines(bag)\` that **returns an array of strings**, one per item worth more than 0 gold:

\`'Sword - 50g'\`

Steps (fill in the blanks):
1. \`filter\` to keep items with \`value > 0\`
2. \`map\` each item to a template literal: \`\${item.name} - \${item.value}g\`
`,
        starter: `function lootLines(bag) {
  const worthIt = bag // 1. filter here
  return worthIt.map((item) => item.name) // 2. build the line with a template literal
}

console.log(lootLines([{ name: 'Sword', value: 50, rarity: 'common' }, { name: 'Rusty Spoon', value: 0, rarity: 'common' }]))
`,
        tests: `const rjBag = [{ name: 'Dragon Scale', value: 300, rarity: 'legendary' }, { name: 'Rusty Spoon', value: 0, rarity: 'common' }, { name: 'Sword', value: 50, rarity: 'common' }]
test('one line per valuable item', () => expect(lootLines(rjBag)).toEqual(['Dragon Scale - 300g', 'Sword - 50g']))
test('junk only → no lines', () => expect(lootLines([{ name: 'Rock', value: 0, rarity: 'common' }])).toEqual([]))
test('empty bag', () => expect(lootLines([])).toEqual([]))
test('does not change the bag', () => { const b = [{ name: 'Gem', value: 5, rarity: 'rare' }]; lootLines(b); expect(b).toEqual([{ name: 'Gem', value: 5, rarity: 'rare' }]) })`,
        hint: 'const worthIt = bag.filter((item) => item.value > 0) and return worthIt.map((item) => `${item.name} - ${item.value}g`)',
        solution: `function lootLines(bag) {
  const worthIt = bag.filter((item) => item.value > 0)
  return worthIt.map((item) => \`\${item.name} - \${item.value}g\`)
}

console.log(lootLines([{ name: 'Sword', value: 50, rarity: 'common' }, { name: 'Rusty Spoon', value: 0, rarity: 'common' }]))
`,
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your turn: the full loot report',
        instructions: `
Write \`lootReport(bag)\` that **returns one string** with lines joined by \`'\\n'\`:

\`\`\`
LOOT REPORT
Dragon Scale - 300g [legendary]
Sword - 50g
TOTAL: 350g
\`\`\`

Rules:
1. First line is always \`LOOT REPORT\`.
2. Skip items worth 0.
3. If an item's \`rarity\` is \`'legendary'\`, add \` [legendary]\` to the end of its line.
4. Last line is \`TOTAL: Ng\`, where N is the sum of all values (use \`reduce\`).

Tip: build an array of lines, then \`lines.join('\\n')\`.
`,
        starter: `function lootReport(bag) {
  // build an array of lines, then join them
  return 'LOOT REPORT'
}

const bag = [
  { name: 'Dragon Scale', value: 300, rarity: 'legendary' },
  { name: 'Rusty Spoon', value: 0, rarity: 'common' },
  { name: 'Sword', value: 50, rarity: 'common' },
]
console.log(lootReport(bag))
`,
        tests: `const rjBag2 = [{ name: 'Dragon Scale', value: 300, rarity: 'legendary' }, { name: 'Rusty Spoon', value: 0, rarity: 'common' }, { name: 'Sword', value: 50, rarity: 'common' }]
test('the example report', () => expect(lootReport(rjBag2)).toBe('LOOT REPORT\\nDragon Scale - 300g [legendary]\\nSword - 50g\\nTOTAL: 350g'))
test('empty bag', () => expect(lootReport([])).toBe('LOOT REPORT\\nTOTAL: 0g'))
test('only junk', () => expect(lootReport([{ name: 'Rock', value: 0, rarity: 'common' }])).toBe('LOOT REPORT\\nTOTAL: 0g'))
test('rare is not legendary', () => expect(lootReport([{ name: 'Gem', value: 20, rarity: 'rare' }, { name: 'Crown', value: 1000, rarity: 'legendary' }])).toBe('LOOT REPORT\\nGem - 20g\\nCrown - 1000g [legendary]\\nTOTAL: 1020g'))`,
        hint: "const lines = bag.filter(i => i.value > 0).map(i => { let line = `${i.name} - ${i.value}g`; if (i.rarity === 'legendary') line += ' [legendary]'; return line }); const total = bag.reduce((sum, i) => sum + i.value, 0); return ['LOOT REPORT', ...lines, `TOTAL: ${total}g`].join('\\n')",
        solution: `function lootReport(bag) {
  const lines = bag
    .filter((item) => item.value > 0)
    .map((item) => {
      let line = \`\${item.name} - \${item.value}g\`
      if (item.rarity === 'legendary') line += ' [legendary]'
      return line
    })
  const total = bag.reduce((sum, item) => sum + item.value, 0)
  return ['LOOT REPORT', ...lines, \`TOTAL: \${total}g\`].join('\\n')
}

const bag = [
  { name: 'Dragon Scale', value: 300, rarity: 'legendary' },
  { name: 'Rusty Spoon', value: 0, rarity: 'common' },
  { name: 'Sword', value: 50, rarity: 'common' },
]
console.log(lootReport(bag))
`,
      },
    ],
  },
]

export const remixWeb: Lesson[] = [
  {
    id: 'remix-web',
    title: 'Remix: Async Data Pipeline',
    remix: true,
    minutes: 12,
    uses: ['web-2', 'js-3', 'think-4'],
    steps: [
      {
        kind: 'concept',
        title: 'Wait for the data, then pipe it',
        eli5: "Ordering food delivery: first you **wait** for the bag to arrive (async), then you **unpack, sort and share** it (map/filter/sort). You can't share fries that haven't arrived yet.",
        body: `
Real apps almost always do two things in a row: **get data** (slow, async) then **shape it** (fast, plain JS). This remix chains:

- **async / await** (Async/Await): wait for a promise to finish before using its value
- **map / filter / reduce** (Array Armory): reshape the data
- **Pure functions & no mutation** (Functional Programming): copy before sorting, don't wreck the original
- **Objects** (Object Outpost): each hero is \`{ name, level }\`

Instead of calling \`fetch\` directly, your function receives the "get data" function as a **parameter**. That makes it easy to test with a fake:

\`\`\`
async function topHeroes(getHeroes, n) {
  const heroes = await getHeroes()   // wait for the data
  // ...now it's just a normal array
}
\`\`\`

## Sorting a copy
\`.sort()\` changes the array in place. Copy first: \`[...heroes].sort((a, b) => b.level - a.level)\` (highest level first).

## Many requests at once
\`await Promise.all(ids.map((id) => getHero(id)))\` starts **all** requests together and waits for every one. Ten 50ms requests take ~50ms, not 500ms.
`,
      },
      {
        kind: 'visual',
        title: 'One at a time vs all together',
        frames: [
          {
            caption: 'We need heroes 1, 2 and 3. Each request takes 50ms.',
            lanes: [{ title: 'Requests', layout: 'row', items: ['hero 1', 'hero 2', 'hero 3'] }],
          },
          {
            caption: '`await` inside a `for` loop: wait for 1, **then** start 2, **then** start 3. Total ≈ 150ms.',
            lanes: [
              { title: 'Timeline (one by one)', layout: 'row', items: ['1 ▓▓', '2 ▓▓', '3 ▓▓'], highlight: [0, 1, 2] },
              { title: 'Time', items: ['≈ 150ms'] },
            ],
          },
          {
            caption: '`Promise.all(ids.map(getHero))`: all three start at once and finish together. Total ≈ 50ms.',
            lanes: [
              { title: 'Timeline (all together)', items: ['1 ▓▓', '2 ▓▓', '3 ▓▓'], highlight: [0, 1, 2] },
              { title: 'Time', items: ['≈ 50ms'], highlight: [0] },
            ],
          },
          {
            caption: 'Then it is plain array work: filter out missing heroes, map to names, reduce to a total.',
            lanes: [
              { title: 'Results', items: ['{ Ada, 9 }', 'null', '{ Bo, 4 }'] },
              { title: 'Shaped', items: ["names: ['Ada', 'Bo']", 'totalLevel: 13'], highlight: [0, 1] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'What is wrong with this code?',
        code: `async function names(getHeroes) {\n  const heroes = getHeroes()\n  return heroes.map((h) => h.name)\n}`,
        options: [
          'Nothing',
          'Missing `await`: `heroes` is a Promise, not an array, so `.map` is not a function',
          '`map` should be `filter`',
          'Async functions cannot return values',
        ],
        answer: 1,
        explain: 'Without `await`, you get the *promise* of heroes, not the heroes. Promises have no `.map`. Write `const heroes = await getHeroes()`.',
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Guided: top heroes',
        instructions: `
\`getHeroes\` is an **async function** you are given. It resolves to an array like \`[{ name: 'Ada', level: 9 }, ...]\`.

Write \`async function topHeroes(getHeroes, n)\` that returns the **names** of the \`n\` highest-level heroes, highest first.

1. \`await\` the heroes.
2. Sort a **copy** by level, highest first: \`[...heroes].sort((a, b) => b.level - a.level)\`
3. \`.slice(0, n)\` to keep the top n.
4. \`.map\` to names.
`,
        starter: `async function topHeroes(getHeroes, n) {
  const heroes = await getHeroes()
  // sort a copy, take the top n, map to names
  return heroes.map((h) => h.name)
}
`,
        tests: `const rwList = [{ name: 'Bo', level: 4 }, { name: 'Ada', level: 9 }, { name: 'Cy', level: 7 }, { name: 'Di', level: 1 }]
const rwGet = async () => { await new Promise((r) => setTimeout(r, 10)); return rwList }
test('top 2 heroes', async () => expect(await topHeroes(rwGet, 2)).toEqual(['Ada', 'Cy']))
test('top 1 hero', async () => expect(await topHeroes(rwGet, 1)).toEqual(['Ada']))
test('n bigger than the list', async () => expect(await topHeroes(rwGet, 10)).toEqual(['Ada', 'Cy', 'Bo', 'Di']))
test('does not reorder the original data', async () => { await topHeroes(rwGet, 2); expect(rwList[0].name).toBe('Bo') })`,
        hint: 'return [...heroes].sort((a, b) => b.level - a.level).slice(0, n).map((h) => h.name)',
        solution: `async function topHeroes(getHeroes, n) {
  const heroes = await getHeroes()
  return [...heroes]
    .sort((a, b) => b.level - a.level)
    .slice(0, n)
    .map((h) => h.name)
}
`,
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your turn: team power, in parallel',
        instructions: `
\`getHero(id)\` is an async function that resolves to \`{ name, level }\`, or \`null\` if there is no hero with that id. Each call takes ~50ms.

Write \`async function teamPower(getHero, ids)\` that returns:
\`\`\`
{ names: ['Ada', 'Bo'], totalLevel: 13 }
\`\`\`
1. Fetch **all** heroes at once with \`Promise.all(ids.map(...))\`.
2. \`filter\` out the \`null\`s.
3. \`names\` = their names (same order as \`ids\`), \`totalLevel\` = sum of levels with \`reduce\`.

⚠️ One test fetches 10 heroes and must finish in under 300ms. One-by-one would take 500ms.
`,
        starter: `async function teamPower(getHero, ids) {
  // 1. Promise.all  2. filter  3. map + reduce
  return { names: [], totalLevel: 0 }
}
`,
        tests: `const rwDb = { 1: { name: 'Ada', level: 9 }, 2: { name: 'Bo', level: 4 }, 3: { name: 'Cy', level: 7 } }
const rwGetHero = async (id) => { await new Promise((r) => setTimeout(r, 50)); return rwDb[id] || null }
test('two heroes', async () => expect(await teamPower(rwGetHero, [1, 2])).toEqual({ names: ['Ada', 'Bo'], totalLevel: 13 }))
test('skips missing heroes', async () => expect(await teamPower(rwGetHero, [3, 99, 1])).toEqual({ names: ['Cy', 'Ada'], totalLevel: 16 }))
test('no ids', async () => expect(await teamPower(rwGetHero, [])).toEqual({ names: [], totalLevel: 0 }))
test('runs requests in parallel (fast)', async () => {
  const t = performance.now()
  const out = await teamPower(rwGetHero, [1, 2, 3, 1, 2, 3, 1, 2, 3, 1])
  if (performance.now() - t > 300) throw new Error('Too slow: use Promise.all so the requests run together')
  expect(out.totalLevel).toBe(9 + 4 + 7 + 9 + 4 + 7 + 9 + 4 + 7 + 9)
})`,
        hint: 'const heroes = (await Promise.all(ids.map((id) => getHero(id)))).filter((h) => h !== null); return { names: heroes.map((h) => h.name), totalLevel: heroes.reduce((sum, h) => sum + h.level, 0) }',
        solution: `async function teamPower(getHero, ids) {
  const results = await Promise.all(ids.map((id) => getHero(id)))
  const heroes = results.filter((h) => h !== null)
  return {
    names: heroes.map((h) => h.name),
    totalLevel: heroes.reduce((sum, h) => sum + h.level, 0),
  }
}
`,
      },
    ],
  },
]

export const remixDsa: Lesson[] = [
  {
    id: 'remix-dsa',
    title: 'Remix: Hash Map + Sorting + Big-O',
    remix: true,
    minutes: 14,
    uses: ['dsa-2', 'dsa-sort', 'dsa-1'],
    steps: [
      {
        kind: 'concept',
        title: 'Count, then rank',
        eli5: 'Counting votes in a class election: first you **tally** each name on the board (a hash map), then you **line up** the names from most votes to fewest (sorting). Two simple tools, one real job.',
        body: `
This remix combines:

- **Hash maps** (Hash Maps: The Swiss Army Knife): count things in O(1) per item
- **Sorting** (Sorting: Bubble Sort to Merge Sort): rank them, with a compare function
- **Big-O** (Big-O: Why Speed Matters): say how fast the whole thing is

## Step 1: count with a Map
\`\`\`
const counts = new Map()
for (const w of words) counts.set(w, (counts.get(w) || 0) + 1)
// 'ab' 'cd' 'ab' → Map { 'ab' => 2, 'cd' => 1 }
\`\`\`

## Step 2: sort the entries
\`[...counts]\` turns the Map into \`[['ab', 2], ['cd', 1]]\`. Sort by count, highest first. On a tie, alphabetical:
\`\`\`
.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
\`\`\`
(\`||\` means: if the counts are equal (0), fall back to comparing the words.)

## Step 3: Big-O
Counting = O(n). Sorting the u *unique* words = O(u log u). Total **O(n + u log u)**. Way better than counting each word with a nested loop (O(n²)).
`,
      },
      {
        kind: 'visual',
        title: 'Top 2 words',
        frames: [
          {
            caption: 'The input: a list of words. We want the 2 most common.',
            lanes: [{ title: 'words', layout: 'row', items: ['sword', 'shield', 'sword', 'bow', 'shield', 'sword'] }],
          },
          {
            caption: 'One pass with a Map: each word bumps its own counter. O(n).',
            lanes: [
              { title: 'words', layout: 'row', items: ['sword', 'shield', 'sword', 'bow', 'shield', 'sword'], highlight: [0, 2, 5] },
              { title: 'counts (Map)', items: ['sword → 3', 'shield → 2', 'bow → 1'], highlight: [0] },
            ],
          },
          {
            caption: 'Sort the entries, highest count first. O(u log u) for u unique words.',
            lanes: [{ title: 'sorted entries', items: ['sword → 3', 'shield → 2', 'bow → 1'], highlight: [0, 1, 2] }],
          },
          {
            caption: '`.slice(0, 2)` and `.map` to the words. Done.',
            lanes: [{ title: 'answer', layout: 'row', items: ['sword', 'shield'], highlight: [0, 1] }],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'For an anagram key we sort each word\'s letters: `"tea" → "aet"`. With n words of length k, what is the total cost?',
        options: ['O(n)', 'O(n × k log k)', 'O(n²)', 'O(k²)'],
        answer: 1,
        explain:
          'Each word costs k log k to sort its letters, and we do it n times. The Map lookups are O(1) each. Since words are short, this is basically linear in n, far better than comparing every pair of words (O(n²)).',
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Guided: top K frequent words',
        instructions: `
Write \`topKFrequent(words, k)\` that returns the \`k\` most common words, most common first. On a tie, alphabetical order.

\`topKFrequent(['sword', 'shield', 'sword', 'bow'], 2)\` → \`['sword', 'bow']\`  (bow and shield tie at 1; bow comes first alphabetically)

The counting is done for you. Finish steps 2 and 3.
`,
        starter: `function topKFrequent(words, k) {
  // 1. count
  const counts = new Map()
  for (const w of words) counts.set(w, (counts.get(w) || 0) + 1)

  // 2. sort [...counts] by count (high first), then alphabetically
  const sorted = [...counts]

  // 3. take k and map to just the words
  return sorted.map((entry) => entry[0])
}
`,
        tests: `test('top 2 with a tie', () => expect(topKFrequent(['sword', 'shield', 'sword', 'bow'], 2)).toEqual(['sword', 'bow']))
test('top 1', () => expect(topKFrequent(['a', 'b', 'b', 'c', 'c', 'c'], 1)).toEqual(['c']))
test('all words ranked', () => expect(topKFrequent(['x', 'y', 'y', 'z', 'z', 'z'], 3)).toEqual(['z', 'y', 'x']))
test('fast on 50,000 words', () => {
  const ws = Array.from({ length: 50000 }, (_, i) => 'w' + (i % 1000))
  const t = performance.now()
  expect(topKFrequent(ws, 2)).toEqual(['w0', 'w1'])
  if (performance.now() - t > 200) throw new Error('Too slow: count with a Map, then sort once')
})`,
        hint: 'const sorted = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])); return sorted.slice(0, k).map((entry) => entry[0])',
        solution: `function topKFrequent(words, k) {
  const counts = new Map()
  for (const w of words) counts.set(w, (counts.get(w) || 0) + 1)

  const sorted = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

  return sorted.slice(0, k).map((entry) => entry[0])
}
`,
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your turn: group anagrams',
        instructions: `
Anagrams use the same letters: \`tea\`, \`eat\`, \`ate\`.

Write \`groupAnagrams(words)\` that returns an array of groups (arrays). Keep groups in the order their first word appears, and words inside a group in input order.

\`\`\`
groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat'])
// → [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
\`\`\`

The trick: two words are anagrams if their **sorted letters** match. Use that as a **Map key**:
\`'tea'.split('').sort().join('')\` → \`'aet'\`

(A Map remembers insertion order, so \`[...map.values()]\` comes out in the right order.)
`,
        starter: `function groupAnagrams(words) {
  const groups = new Map()
  // for each word: make its key, add it to that key's group

  return []
}
`,
        tests: `test('the classic example', () => expect(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat'])).toEqual([['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]))
test('no anagrams', () => expect(groupAnagrams(['abc', 'def'])).toEqual([['abc'], ['def']]))
test('empty list', () => expect(groupAnagrams([])).toEqual([]))
test('same word twice', () => expect(groupAnagrams(['listen', 'silent', 'listen'])).toEqual([['listen', 'silent', 'listen']]))
test('fast on 20,000 words', () => {
  const ws = Array.from({ length: 20000 }, (_, i) => (i % 2 ? 'stop' : 'pots') + (i % 500))
  const t = performance.now()
  const out = groupAnagrams(ws)
  if (performance.now() - t > 300) throw new Error('Too slow: use a Map keyed by sorted letters')
  expect(out.length).toBe(new Set(ws.map((w) => [...w].sort().join(''))).size)
})`,
        hint: "for (const w of words) { const key = w.split('').sort().join(''); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(w) } return [...groups.values()]",
        solution: `function groupAnagrams(words) {
  const groups = new Map()
  for (const w of words) {
    const key = w.split('').sort().join('')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(w)
  }
  return [...groups.values()]
}
`,
      },
      {
        kind: 'explain',
        prompt: 'Explain how you would find the 3 most common words in a book, and how fast your approach is.',
        keyPoints: [
          'One pass counting words in a hash map: O(n)',
          'Sort the unique words by count with a compare function: O(u log u)',
          'Take the first 3',
          'Avoid nested loops that count each word separately: O(n²)',
        ],
      },
    ],
  },
]
