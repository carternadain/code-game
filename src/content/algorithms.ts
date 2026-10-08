import type { Realm } from '../types'

export const algorithms: Realm = {
  id: 'dsa',
  name: 'Algorithm Arena',
  topic: 'Data Structures & Algorithms',
  icon: '⚔️',
  color: '#e84393',
  when: 'Month 5–6',
  blurb: 'Big-O, hash maps, stacks, binary search, recursion, trees and graphs. Tests include speed checks — slow solutions lose.',
  lessons: [
    {
      id: 'dsa-1',
      title: 'Big-O: Why Speed Matters',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Counting steps, not seconds',
          eli5: 'Big-O answers: **if the input gets 10× bigger, how much slower does my code get?** O(n) = 10× slower. O(n²) = 100× slower. O(1) = no slower at all.',
          body: `
**Big-O** describes how the work grows as the input (n) grows — ignoring constants.

- **O(1)** — constant: \`arr[5]\`, \`map.get(k)\`, \`set.has(x)\`
- **O(log n)** — halve the problem each step: binary search. 1 billion items → ~30 steps
- **O(n)** — touch each item once: a loop
- **O(n log n)** — good sorting algorithms
- **O(n²)** — a loop inside a loop over the same data. 100k items → 10 *billion* steps 🐌
- **O(2ⁿ)** — try every combination. Unusable past ~40 items

\`\`\`
// O(n²): compare every pair
for (let i = 0; i < a.length; i++)
  for (let j = i + 1; j < a.length; j++)
    if (a[i] === a[j]) return true

// O(n): remember what you've seen
const seen = new Set()
for (const x of a) { if (seen.has(x)) return true; seen.add(x) }
\`\`\`
> The most common speed-up in real code: replace a nested \`.find()\` / \`.includes()\` inside a loop with a \`Set\` or \`Map\` lookup.
`,
        },
        {
          kind: 'quiz',
          prompt: 'What is the time complexity?',
          code: `function f(users, orders) {\n  return orders.map(o => users.find(u => u.id === o.userId))\n}`,
          options: ['O(n)', 'O(users + orders)', 'O(users × orders)', 'O(log n)'],
          answer: 2,
          explain:
            '`.find` is a loop. For each order, scan the users. Build `new Map(users.map(u => [u.id, u]))` once, then each lookup is O(1) → O(users + orders).',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Duplicate detector (speed test!)',
          instructions: `
Write \`hasDuplicate(arr)\` that returns \`true\` if any value appears twice.

⚠️ One test runs on **30,000** items and must finish in under 100ms. A nested loop won't make it.
`,
          starter: `function hasDuplicate(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[i] === arr[j]) return true\n    }\n  }\n  return false\n}\n`,
          tests: `test('finds a duplicate', () => expect(hasDuplicate([3, 1, 4, 1, 5])).toBe(true))
test('no duplicates', () => expect(hasDuplicate([1, 2, 3])).toBe(false))
test('empty', () => expect(hasDuplicate([])).toBe(false))
test('fast on 30,000 items (O(n))', () => {
  const big = Array.from({ length: 30000 }, (_, i) => i)
  const t = performance.now()
  expect(hasDuplicate(big)).toBe(false)
  const ms = performance.now() - t
  if (ms > 100) throw new Error('Took ' + Math.round(ms) + 'ms — that is O(n²). Use a Set!')
})`,
          hint: 'const seen = new Set(); for (const x of arr) { if (seen.has(x)) return true; seen.add(x) } return false',
          solution: `function hasDuplicate(arr) {\n  const seen = new Set()\n  for (const x of arr) {\n    if (seen.has(x)) return true\n    seen.add(x)\n  }\n  return false\n}\n`,
        },
      ],
    },
    {
      id: 'dsa-2',
      title: 'Hash Maps: The Swiss Army Knife',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'How a hash map gets O(1)',
          eli5: 'A hash map is a **coat check**: you hand over your coat, get ticket #42, and later they walk straight to hook 42. No searching every hook.',
          body: `
A hash map (JS \`Map\`/object, Python \`dict\`) is an **array of buckets**. To store \`"ada" → 7\`:
1. Run the key through a **hash function** → a big number, e.g. \`hash("ada") = 96354\`
2. \`96354 % bucketCount\` → bucket index, e.g. 2
3. Store the pair in bucket 2

Lookup repeats the same math and jumps straight there — no scanning. If two keys land in the same bucket (**collision**), the bucket holds a short list. When it gets too full, the map grows and re-hashes everything (still O(1) on average).

Pattern: "have I seen X?" / "how many of X?" / "find the pair that…" → reach for a hash map.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Two Sum (interview #1)',
          instructions: `
Write \`twoSum(nums, target)\` that returns the **indices** \`[i, j]\` (i < j) of the two numbers that add up to \`target\`. Assume exactly one answer exists.

\`twoSum([2, 7, 11, 15], 9)\` → \`[0, 1]\`

Aim for O(n): for each number, ask a Map "have I already seen \`target - num\`?"
`,
          starter: `function twoSum(nums, target) {\n  \n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9))\n`,
          tests: `test('basic', () => expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]))
test('not at the start', () => expect(twoSum([3, 2, 4], 6)).toEqual([1, 2]))
test('same number twice', () => expect(twoSum([3, 3], 6)).toEqual([0, 1]))
test('fast on 50,000 items', () => {
  const nums = Array.from({ length: 50000 }, (_, i) => i * 2)
  const t = performance.now()
  expect(twoSum(nums, 99994 + 99996)).toEqual([49997, 49998])
  if (performance.now() - t > 100) throw new Error('Too slow — use a Map')
})`,
          hint: 'const seen = new Map(); for (let i...) { const need = target - nums[i]; if (seen.has(need)) return [seen.get(need), i]; seen.set(nums[i], i) }',
          solution: `function twoSum(nums, target) {\n  const seen = new Map()\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i]\n    if (seen.has(need)) return [seen.get(need), i]\n    seen.set(nums[i], i)\n  }\n  return null\n}\n`,
        },
      ],
    },
    {
      id: 'dsa-3',
      title: 'Stacks & Queues',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'LIFO and FIFO',
          eli5: 'A stack is a **pile of plates** (last on, first off). A queue is a **line at a coffee shop** (first in line, first served).',
          body: `
- **Stack** (Last In, First Out) — \`push\` / \`pop\` from the same end. Undo history, the call stack, matching brackets, DFS.
- **Queue** (First In, First Out) — add at the back, take from the front. Job queues, BFS, print queues.

In JS, an array is a fine stack (\`push\`/\`pop\` are O(1)). As a queue, \`shift()\` is O(n) because every element moves — real queues use a linked list or a moving head index.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Balanced brackets',
          instructions: `
Write \`isBalanced(str)\` that returns \`true\` if every \`(\`, \`[\`, \`{\` is closed by the matching bracket in the right order. Ignore other characters.

\`isBalanced('{[()]}')\` → true · \`isBalanced('([)]')\` → false · \`isBalanced('fn(a[0])')\` → true
`,
          starter: `function isBalanced(str) {\n  const stack = []\n  const pairs = { ')': '(', ']': '[', '}': '{' }\n  \n}\n`,
          tests: `test('nested ok', () => expect(isBalanced('{[()]}')).toBe(true))
test('wrong order', () => expect(isBalanced('([)]')).toBe(false))
test('ignores other chars', () => expect(isBalanced('fn(a[0]) { return 1 }')).toBe(true))
test('unclosed', () => expect(isBalanced('((')).toBe(false))
test('close without open', () => expect(isBalanced(')(')).toBe(false))
test('empty', () => expect(isBalanced('')).toBe(true))`,
          hint: 'Opening bracket → push. Closing bracket → pop and compare with pairs[ch]; mismatch or empty stack → false. At the end, the stack must be empty.',
          solution: `function isBalanced(str) {\n  const stack = []\n  const pairs = { ')': '(', ']': '[', '}': '{' }\n  for (const ch of str) {\n    if ('([{'.includes(ch)) stack.push(ch)\n    else if (ch in pairs) {\n      if (stack.pop() !== pairs[ch]) return false\n    }\n  }\n  return stack.length === 0\n}\n`,
        },
      ],
    },
    {
      id: 'dsa-4',
      title: 'Binary Search',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'Guess the number, but optimally',
          eli5: 'Like finding a word in a **paper dictionary**: open the middle, see if your word is before or after, throw away half. Repeat.',
          body: `
In a **sorted** array, check the middle. Too small? Throw away the left half. Too big? Throw away the right half. Each step halves the search space → **O(log n)**.

\`\`\`
lo = 0, hi = n - 1
while lo <= hi:
  mid = floor((lo + hi) / 2)
  if arr[mid] === target → found
  if arr[mid] < target → lo = mid + 1
  else → hi = mid - 1
\`\`\`
This is how database B-tree indexes and \`git bisect\` work.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Implement binarySearch',
          instructions: `Write \`binarySearch(sorted, target)\` returning the index of \`target\`, or \`-1\` if it's not there. No \`indexOf\` / \`includes\` / \`find\`!`,
          starter: `function binarySearch(sorted, target) {\n  let lo = 0\n  let hi = sorted.length - 1\n  \n  return -1\n}\n`,
          tests: `test('finds middle', () => expect(binarySearch([1, 3, 5, 7, 9], 5)).toBe(2))
test('finds edges', () => { expect(binarySearch([1, 3, 5, 7, 9], 1)).toBe(0); expect(binarySearch([1, 3, 5, 7, 9], 9)).toBe(4) })
test('missing', () => expect(binarySearch([1, 3, 5], 4)).toBe(-1))
test('empty', () => expect(binarySearch([], 1)).toBe(-1))
test('huge array, fast', () => {
  const arr = Array.from({ length: 1000000 }, (_, i) => i * 3)
  let steps = 0
  const proxy = new Proxy(arr, { get(t, k) { if (/^\\d+$/.test(String(k))) steps++; return t[k] } })
  expect(binarySearch(proxy, 2999997)).toBe(999999)
  if (steps > 40) throw new Error('Read ' + steps + ' elements — binary search needs ~20')
})`,
          hint: 'while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); ... }',
          solution: `function binarySearch(sorted, target) {\n  let lo = 0\n  let hi = sorted.length - 1\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2)\n    if (sorted[mid] === target) return mid\n    if (sorted[mid] < target) lo = mid + 1\n    else hi = mid - 1\n  }\n  return -1\n}\n`,
        },
      ],
    },
    {
      id: 'dsa-5',
      title: 'Trees & Recursion',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Data that branches',
          eli5: 'A tree is a **family tree** (or the folders on your computer): one root, each item can have children, and those children can have children.',
          body: `
A **tree** is nodes with children and no cycles. You use them constantly: the DOM, your file system, JSON, React's component tree, an AST, B-tree indexes.

\`\`\`
const tree = {
  value: 1,
  children: [
    { value: 2, children: [] },
    { value: 3, children: [{ value: 4, children: [] }] },
  ],
}
\`\`\`
Trees are recursive (a child is itself a tree), so recursive functions fit perfectly:
\`\`\`
function count(node) {
  return 1 + node.children.reduce((sum, c) => sum + count(c), 0)
}
\`\`\`
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Tree depth & search',
          instructions: `
Using the \`{ value, children }\` shape:
1. \`depth(node)\` — the number of levels (a single node has depth 1).
2. \`findPath(node, target)\` — array of values from the root down to the node whose value is \`target\`, or \`null\` if it isn't there.

\`findPath(tree, 4)\` → \`[1, 3, 4]\`
`,
          starter: `const tree = {\n  value: 1,\n  children: [\n    { value: 2, children: [] },\n    { value: 3, children: [{ value: 4, children: [] }] },\n  ],\n}\n\nfunction depth(node) {\n  \n}\n\nfunction findPath(node, target) {\n  \n}\n\nconsole.log(depth(tree), findPath(tree, 4))\n`,
          tests: `const t = { value: 1, children: [{ value: 2, children: [] }, { value: 3, children: [{ value: 4, children: [{ value: 5, children: [] }] }] }] }
test('depth of leaf', () => expect(depth({ value: 9, children: [] })).toBe(1))
test('depth of tree', () => expect(depth(t)).toBe(4))
test('findPath deep', () => expect(findPath(t, 5)).toEqual([1, 3, 4, 5]))
test('findPath root', () => expect(findPath(t, 1)).toEqual([1]))
test('findPath missing', () => expect(findPath(t, 42)).toBe(null))`,
          hint: 'depth: 1 + Math.max(0, ...node.children.map(depth)). findPath: if value matches return [value]; for each child, const p = findPath(child, target); if (p) return [node.value, ...p]; return null.',
          solution: `function depth(node) {\n  return 1 + Math.max(0, ...node.children.map(depth))\n}\n\nfunction findPath(node, target) {\n  if (node.value === target) return [node.value]\n  for (const child of node.children) {\n    const path = findPath(child, target)\n    if (path) return [node.value, ...path]\n  }\n  return null\n}\n`,
        },
      ],
    },
    {
      id: 'dsa-6',
      title: 'BOSS: Escape the Maze (BFS)',
      boss: true,
      minutes: 25,
      steps: [
        {
          kind: 'concept',
          title: 'Breadth-first search',
          eli5: 'BFS is **ripples in a pond**: check everything 1 step away, then 2 steps, then 3. The first time a ripple touches the exit is the shortest route.',
          body: `
A **graph** is nodes + edges (a tree is a graph without cycles). A grid maze is a graph: each open cell connects to its up/down/left/right neighbours.

**BFS** explores in rings: all cells 1 step away, then 2 steps, then 3… using a **queue**. So the first time it reaches the exit, that's the **shortest path**.

\`\`\`
queue = [[start, 0]]; visited = {start}
while queue not empty:
  [cell, dist] = queue.shift()
  if cell is exit → return dist
  for each open, unvisited neighbour:
    visited.add(n); queue.push([n, dist + 1])
return -1
\`\`\`
DFS uses a stack instead and dives deep first — good for "is there ANY path", not "the SHORTEST path". GPS routing, social network "degrees of separation", and web crawlers are all graph searches.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Shortest path out',
          instructions: `
\`maze\` is an array of strings. \`S\` = start, \`E\` = exit, \`#\` = wall, \`.\` = open.

Write \`shortestPath(maze)\` returning the minimum number of moves (up/down/left/right) from S to E, or \`-1\` if there's no way out.
`,
          starter: `const maze = [\n  'S.#.....',\n  '.##.###.',\n  '....#...',\n  '##.##.#E',\n]\n\nfunction shortestPath(maze) {\n  \n}\n\nconsole.log(shortestPath(maze))\n`,
          tests: `test('the example maze', () => expect(shortestPath(['S.#.....', '.##.###.', '....#...', '##.##.#E'])).toBe(14))
test('straight line', () => expect(shortestPath(['S..E'])).toBe(3))
test('walled off', () => expect(shortestPath(['S#E'])).toBe(-1))
test('picks the shorter route', () => expect(shortestPath(['S...', '.##.', '...E'])).toBe(5))`,
          hint: 'Find S with a double loop. Use a queue of [row, col, dist] and a Set of "r,c" strings for visited. Neighbours: [[1,0],[-1,0],[0,1],[0,-1]]. Check bounds and walls before enqueueing.',
          solution: `function shortestPath(maze) {\n  let start\n  maze.forEach((row, r) => {\n    const c = row.indexOf('S')\n    if (c !== -1) start = [r, c]\n  })\n  const queue = [[start[0], start[1], 0]]\n  const visited = new Set([start.join(',')])\n  while (queue.length) {\n    const [r, c, d] = queue.shift()\n    if (maze[r][c] === 'E') return d\n    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {\n      const nr = r + dr\n      const nc = c + dc\n      const key = nr + ',' + nc\n      if (nr < 0 || nc < 0 || nr >= maze.length || nc >= maze[nr].length) continue\n      if (maze[nr][nc] === '#' || visited.has(key)) continue\n      visited.add(key)\n      queue.push([nr, nc, d + 1])\n    }\n  }\n  return -1\n}\n`,
        },
      ],
    },
  ],
  comingSoon: [
    'Linked lists',
    'Sorting: merge sort & quicksort',
    'Heaps & priority queues',
    'Depth-first search & cycle detection',
    'Dynamic programming',
    'Two pointers & sliding window',
    'Tries (how autocomplete works)',
    'Interview patterns cheat sheet',
  ],
}
