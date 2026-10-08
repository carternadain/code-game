import type { Realm } from '../types'

export const python: Realm = {
  id: 'py',
  name: 'Serpent Swamp',
  topic: 'Python',
  icon: '🐍',
  color: '#4b8bbe',
  when: 'Month 3',
  blurb: 'Real CPython running in your browser. Learn Python as a JS dev: syntax, data structures, classes, and scripting.',
  lessons: [
    {
      id: 'py-1',
      title: 'Python for JavaScript Devs',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'Same ideas, different clothes',
          eli5: "Python is JavaScript's cousin who **hates curly braces**. Same ideas — variables, ifs, loops, functions — but indentation does the grouping.",
          body: `
\`\`\`
# JavaScript                        # Python
# const name = 'Ada'                name = 'Ada'
# if (x > 3) { ... }                if x > 3:
#                                       ...
# for (const h of heroes) {}        for h in heroes:
# function add(a, b) {}             def add(a, b):
# \`Hi \${name}\`                     f"Hi {name}"
# null / true / false               None / True / False
# && || !                           and or not
# arr.length                        len(arr)
# console.log(x)                    print(x)
\`\`\`
## Indentation IS the syntax
No braces. A colon \`:\` opens a block, and the indented lines (4 spaces) are inside it. Mixing tabs/spaces = \`IndentationError\`.

## Truthiness
Empty things are falsy: \`0\`, \`""\`, \`[]\`, \`{}\`, \`None\`. So \`if items:\` means "if the list is not empty".
`,
        },
        {
          kind: 'quiz',
          prompt: 'What does this print?',
          code: `scores = [10, 0, 7]\nfor s in scores:\n    if s:\n        print("hit")\n    else:\n        print("miss")`,
          options: ['hit hit hit', 'hit miss hit', 'miss hit miss', 'SyntaxError'],
          answer: 1,
          explain: '0 is falsy, every other number is truthy.',
        },
        {
          kind: 'code',
          lang: 'python',
          title: 'Rank titles',
          instructions: `
Write \`rank(xp)\` that returns:
- \`"Noob"\` under 100 XP
- \`"Adventurer"\` from 100 to 999
- \`"Hero"\` from 1000 up

Then write \`describe(name, xp)\` that returns an f-string like \`"Ada is a Hero (1500 XP)"\`.

(The first run downloads Python — give it a few seconds.)
`,
          starter: `def rank(xp):\n    pass\n\n\ndef describe(name, xp):\n    pass\n\n\nprint(describe("Ada", 1500))\n`,
          tests: `# test: rank under 100
assert rank(5) == "Noob", f"rank(5) returned {rank(5)!r}"
# test: rank boundaries
assert rank(100) == "Adventurer" and rank(999) == "Adventurer"
assert rank(1000) == "Hero"
# test: describe
assert describe("Ada", 1500) == "Ada is a Hero (1500 XP)", f"got {describe('Ada', 1500)!r}"`,
          hint: 'if xp < 100: return "Noob" / elif xp < 1000: ... / else: ... — and f"{name} is a {rank(xp)} ({xp} XP)"',
          solution: `def rank(xp):\n    if xp < 100:\n        return "Noob"\n    elif xp < 1000:\n        return "Adventurer"\n    else:\n        return "Hero"\n\n\ndef describe(name, xp):\n    return f"{name} is a {rank(xp)} ({xp} XP)"\n\n\nprint(describe("Ada", 1500))\n`,
        },
      ],
    },
    {
      id: 'py-2',
      title: 'Lists, Dicts & Comprehensions',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'The Pythonic way',
          eli5: 'A list is a **numbered shelf**, a dict is a **labeled drawer cabinet**, a set is a **bag with no duplicates**. A comprehension is a **one-line assembly line** that builds a new one.',
          body: `
\`\`\`
heroes = ["ada", "linus", "grace"]          # list  (JS array)
levels = {"ada": 7, "linus": 3}              # dict  (JS object / Map)
point  = (3, 4)                              # tuple (immutable list)
tags   = {"mage", "healer"}                  # set   (unique values)

heroes[-1]          # "grace" — negative index counts from the end
heroes[0:2]         # ["ada", "linus"] — slicing
levels.get("bob", 0)  # 0 — default instead of KeyError
\`\`\`
## Comprehensions: map + filter in one line
\`\`\`
[h.upper() for h in heroes]                  # map
[h for h in heroes if len(h) > 3]            # filter
{h: len(h) for h in heroes}                  # dict comprehension
\`\`\`
`,
        },
        {
          kind: 'quiz',
          prompt: 'What is `[n * n for n in range(5) if n % 2 == 0]`?',
          options: ['[0, 4, 16]', '[1, 9]', '[0, 1, 4, 9, 16]', '[4, 16]'],
          answer: 0,
          explain: 'range(5) is 0,1,2,3,4. Keep the even ones (0, 2, 4), then square them.',
        },
        {
          kind: 'code',
          lang: 'python',
          title: 'Loot sorter',
          instructions: `
\`loot\` is a list of dicts like \`{"item": "sword", "rarity": "rare", "value": 120}\`.

1. \`names_by_rarity(loot, rarity)\` → list of item names with that rarity (use a comprehension).
2. \`total_value(loot)\` → sum of all values (hint: \`sum(...)\` with a generator).
3. \`count_by_rarity(loot)\` → dict like \`{"rare": 2, "common": 1}\`.
`,
          starter: `loot = [\n    {"item": "sword", "rarity": "rare", "value": 120},\n    {"item": "stick", "rarity": "common", "value": 1},\n    {"item": "amulet", "rarity": "rare", "value": 300},\n]\n\n\ndef names_by_rarity(loot, rarity):\n    pass\n\n\ndef total_value(loot):\n    pass\n\n\ndef count_by_rarity(loot):\n    pass\n\n\nprint(names_by_rarity(loot, "rare"))\n`,
          tests: `# test: names_by_rarity
assert names_by_rarity(loot, "rare") == ["sword", "amulet"]
assert names_by_rarity(loot, "legendary") == []
# test: total_value
assert total_value(loot) == 421
assert total_value([]) == 0
# test: count_by_rarity
assert count_by_rarity(loot) == {"rare": 2, "common": 1}, f"got {count_by_rarity(loot)}"`,
          hint: 'return [l["item"] for l in loot if l["rarity"] == rarity] / sum(l["value"] for l in loot) / counts[r] = counts.get(r, 0) + 1',
          solution: `loot = [\n    {"item": "sword", "rarity": "rare", "value": 120},\n    {"item": "stick", "rarity": "common", "value": 1},\n    {"item": "amulet", "rarity": "rare", "value": 300},\n]\n\n\ndef names_by_rarity(loot, rarity):\n    return [l["item"] for l in loot if l["rarity"] == rarity]\n\n\ndef total_value(loot):\n    return sum(l["value"] for l in loot)\n\n\ndef count_by_rarity(loot):\n    counts = {}\n    for l in loot:\n        counts[l["rarity"]] = counts.get(l["rarity"], 0) + 1\n    return counts\n`,
        },
      ],
    },
    {
      id: 'py-3',
      title: 'Classes & Dunder Methods',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Objects the Python way',
          eli5: "A class is a **blueprint**; an object is a **house built from it**. Dunder methods (`__len__`) are **secret handshakes** that let your object work with Python's built-in moves like `len()`.",
          body: `
\`\`\`
class Hero:
    def __init__(self, name, hp=100):   # constructor
        self.name = name                 # 'self' = JS 'this', but explicit
        self.hp = hp

    def hit(self, dmg):
        self.hp = max(0, self.hp - dmg)

    def __repr__(self):                  # how it prints
        return f"Hero({self.name!r}, hp={self.hp})"

    def __len__(self):                   # makes len(hero) work
        return self.hp
\`\`\`
**Dunder** ("double underscore") methods hook into Python's syntax: \`__len__\` → \`len(x)\`, \`__eq__\` → \`==\`, \`__getitem__\` → \`x[i]\`, \`__iter__\` → \`for ... in x\`. This is how Python's built-in types work too.
`,
        },
        {
          kind: 'code',
          lang: 'python',
          title: 'Build a Stack class',
          instructions: `
Implement \`class Stack\` (last in, first out):
- \`push(item)\` adds to the top
- \`pop()\` removes and returns the top item; raises \`IndexError("pop from empty stack")\` if empty
- \`peek()\` returns the top without removing (or \`None\` if empty)
- \`len(stack)\` works (\`__len__\`) and \`bool(stack)\` is \`False\` when empty (free, once \`__len__\` exists!)

Use a Python list internally.
`,
          starter: `class Stack:\n    def __init__(self):\n        pass\n\n\ns = Stack()\ns.push(1)\ns.push(2)\nprint(s.pop(), len(s))\n`,
          tests: `# test: push and pop are LIFO
s = Stack(); s.push("a"); s.push("b")
assert s.pop() == "b" and s.pop() == "a"
# test: peek doesn't remove
s = Stack(); s.push(1)
assert s.peek() == 1 and len(s) == 1
assert Stack().peek() is None
# test: len and bool
s = Stack(); assert not s; s.push(0); assert len(s) == 1 and s
# test: pop on empty raises IndexError
try:
    Stack().pop()
    assert False, "expected IndexError"
except IndexError:
    pass`,
          hint: 'self.items = [] in __init__. pop: if not self.items: raise IndexError("pop from empty stack"); return self.items.pop()',
          solution: `class Stack:\n    def __init__(self):\n        self.items = []\n\n    def push(self, item):\n        self.items.append(item)\n\n    def pop(self):\n        if not self.items:\n            raise IndexError("pop from empty stack")\n        return self.items.pop()\n\n    def peek(self):\n        return self.items[-1] if self.items else None\n\n    def __len__(self):\n        return len(self.items)\n`,
        },
      ],
    },
    {
      id: 'py-4',
      title: 'BOSS: The Log Parser',
      boss: true,
      minutes: 25,
      steps: [
        {
          kind: 'concept',
          title: "Python's superpower: scripting real work",
          eli5: 'Python is the **duct tape** of programming — perfect for quickly chopping up text, files and data.',
          body: `
A huge chunk of backend work is "read some text, pull out data, summarize it". Python shines here.

\`\`\`
line = "2026-10-08 GET /api/users 200 35ms"
date, method, path, status, ms = line.split()
int(status)          # 200
ms.removesuffix("ms")  # "35"
\`\`\`
Useful tools: \`str.split\`, \`str.strip\`, \`int()\`, \`collections.Counter\`, \`max(..., key=...)\`, \`sorted(..., key=..., reverse=True)\`.
`,
        },
        {
          kind: 'code',
          lang: 'python',
          title: 'Parse the server logs',
          instructions: `
Each line looks like \`"2026-10-08 GET /api/users 200 35ms"\`. Blank lines should be skipped.

Write \`summarize(log_text)\` returning a dict:
- \`"requests"\`: number of requests
- \`"errors"\`: number with status **>= 500**
- \`"slowest"\`: the path of the slowest request
- \`"top_path"\`: the most requested path
- \`"avg_ms"\`: average response time, rounded to 1 decimal
`,
          starter: `LOGS = """\n2026-10-08 GET /api/users 200 35ms\n2026-10-08 POST /api/login 401 120ms\n2026-10-08 GET /api/users 200 40ms\n2026-10-08 GET /api/report 500 900ms\n\n2026-10-08 GET /api/users 503 15ms\n"""\n\n\ndef summarize(log_text):\n    pass\n\n\nprint(summarize(LOGS))\n`,
          tests: `r = summarize(LOGS)
# test: counts requests (skips blank lines)
assert r["requests"] == 5, r
# test: counts 5xx errors
assert r["errors"] == 2, r
# test: slowest path
assert r["slowest"] == "/api/report", r
# test: most requested path
assert r["top_path"] == "/api/users", r
# test: average ms
assert r["avg_ms"] == 222.0, r`,
          hint: 'Build a list of (path, status, ms) tuples first. Counter(paths).most_common(1)[0][0] gives the top path. max(rows, key=lambda r: r[2]) gives the slowest.',
          solution: `from collections import Counter\n\nLOGS = """\n2026-10-08 GET /api/users 200 35ms\n2026-10-08 POST /api/login 401 120ms\n2026-10-08 GET /api/users 200 40ms\n2026-10-08 GET /api/report 500 900ms\n\n2026-10-08 GET /api/users 503 15ms\n"""\n\n\ndef summarize(log_text):\n    rows = []\n    for line in log_text.strip().splitlines():\n        if not line.strip():\n            continue\n        _date, _method, path, status, ms = line.split()\n        rows.append((path, int(status), int(ms.removesuffix("ms"))))\n    return {\n        "requests": len(rows),\n        "errors": sum(1 for r in rows if r[1] >= 500),\n        "slowest": max(rows, key=lambda r: r[2])[0],\n        "top_path": Counter(r[0] for r in rows).most_common(1)[0][0],\n        "avg_ms": round(sum(r[2] for r in rows) / len(rows), 1),\n    }\n\n\nprint(summarize(LOGS))\n`,
        },
      ],
    },
  ],
  comingSoon: [
    'Virtual environments, pip & uv',
    'Type hints & mypy',
    'Exceptions & context managers (with)',
    'Decorators (how @app.get works)',
    'Generators & iterators',
    'Build an API with FastAPI',
    'Testing with pytest',
    'SQLAlchemy ORM basics',
  ],
}
