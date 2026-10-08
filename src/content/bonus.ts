import type { Realm } from '../types'

export const git: Realm = {
  id: 'git',
  name: 'Terminal Temple',
  topic: 'Git & the Command Line',
  icon: '🌳',
  color: '#f05033',
  when: 'Month 1 (side quest)',
  blurb: 'Git beyond add/commit/push: what a commit actually is, branches, rebase vs merge, and getting out of trouble.',
  lessons: [
    {
      id: 'git-1',
      title: 'What a Commit Really Is',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'Snapshots, not diffs',
          eli5: 'Git commits are **save points in a video game**. A branch is just a **sticky note** pointing at one save point.',
          body: `
A **commit** is a snapshot of your whole project + metadata (author, message, timestamp) + a pointer to its **parent** commit(s). Its id (\`a1b2c3…\`) is a hash of all that, so changing anything changes the id.

A **branch** is just a movable label pointing at one commit. \`HEAD\` points to the branch you're on. Creating a branch costs ~41 bytes.

## The three places your changes live
1. **Working directory** — files on disk
2. **Staging area** (index) — what \`git add\` puts in the next commit
3. **Repository** — committed history

## Commands that save you
- \`git status\` / \`git diff\` / \`git diff --staged\` — look before you leap
- \`git log --oneline --graph\` — see history
- \`git restore <file>\` — throw away unstaged changes
- \`git reset --soft HEAD~1\` — undo the last commit, keep the changes
- \`git reflog\` — the "undo history" of HEAD. Almost nothing is truly lost.
- \`git stash\` — shelve changes temporarily
`,
        },
        {
          kind: 'quiz',
          prompt: 'Merge vs rebase: what does `git rebase main` do on your feature branch?',
          options: [
            'Creates a merge commit with two parents',
            'Replays your commits on top of the latest main, creating new commits with new ids',
            'Deletes main',
            'Pushes your branch',
          ],
          answer: 1,
          explain:
            'Rebase rewrites your commits as if you started from the latest main → linear history. Because ids change, never rebase commits that others have already pulled (shared branches). Merge preserves history exactly but adds merge commits.',
        },
        {
          kind: 'quiz',
          prompt: 'You committed an API key and pushed. What now?',
          options: [
            'git reset and force-push, done',
            "Rotate (revoke) the key immediately — assume it's compromised — then clean history",
            'Delete the file in a new commit',
            'Make the repo private',
          ],
          answer: 1,
          explain:
            "Bots scan GitHub for secrets within seconds. Removing it from history doesn't un-leak it. Revoke first, then clean up. Prevent it with .gitignore for .env and secret scanning.",
        },
      ],
    },
  ],
  comingSoon: [
    'Branching workflows & pull requests',
    'Resolving merge conflicts calmly',
    'Interactive rebase & clean history',
    'Bash essentials: pipes, grep, find, xargs',
    'SSH keys & config',
  ],
}

export const debugging: Realm = {
  id: 'debug',
  name: 'Bug Bounty Bay',
  topic: 'Debugging & Testing',
  icon: '🐛',
  color: '#fdcb6e',
  when: 'Every month (side quest)',
  blurb: 'The skill that separates juniors from seniors: reading errors, forming hypotheses, and writing tests that catch regressions.',
  lessons: [
    {
      id: 'debug-1',
      title: 'Bug Hunt: Read the Error, Fix the Code',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Debugging is the scientific method',
          eli5: 'Debugging is being a **detective**: read the clues (error), recreate the crime (reproduce), name a suspect (hypothesis), then test it.',
          body: `
1. **Read the whole error.** Message + stack trace. The top frame in *your* code is usually where to look.
2. **Reproduce it** reliably. If you can't make it happen, you can't prove you fixed it.
3. **Form a hypothesis**: "I think \`user\` is undefined because the fetch hasn't finished."
4. **Test it** — a \`console.log\`, a breakpoint (\`debugger;\`), or a failing unit test.
5. **Fix, then write a test** so it never comes back.

> Before you paste an error into an AI: spend 5 minutes on steps 1–3 yourself. That's the muscle you're building.

## Off-by-one, the most common bug
\`for (let i = 0; i <= arr.length; i++)\` reads one past the end. Arrays go from \`0\` to \`length - 1\`.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Squash 3 bugs',
          instructions: `
\`average(scores)\` should return the average of an array of numbers (or \`0\` for an empty array), and \`topScorer(players)\` should return the name of the player with the highest score.

Both have bugs. Run first, **read the test failures**, form a hypothesis, then fix.
`,
          starter: `function average(scores) {\n  let total = 0\n  for (let i = 0; i <= scores.length; i++) {\n    total += scores[i]\n  }\n  return total / scores.length\n}\n\nfunction topScorer(players) {\n  let best = players[0]\n  for (const p of players) {\n    if (p.score > best.score) best = p\n    return best.name\n  }\n}\n`,
          tests: `test('average', () => expect(average([2, 4, 6])).toBe(4))
test('average of empty is 0', () => expect(average([])).toBe(0))
test('topScorer finds the max', () => expect(topScorer([{ name: 'a', score: 1 }, { name: 'b', score: 9 }, { name: 'c', score: 3 }])).toBe('b'))`,
          hint: 'Bug 1: <= should be <. Bug 2: empty array → 0/0 = NaN. Bug 3: the return is inside the loop, so it exits on the first iteration.',
          solution: `function average(scores) {\n  if (scores.length === 0) return 0\n  let total = 0\n  for (let i = 0; i < scores.length; i++) {\n    total += scores[i]\n  }\n  return total / scores.length\n}\n\nfunction topScorer(players) {\n  let best = players[0]\n  for (const p of players) {\n    if (p.score > best.score) best = p\n  }\n  return best.name\n}\n`,
        },
        {
          kind: 'quiz',
          prompt: 'What does a good unit test look like?',
          options: [
            'Tests many unrelated things so you write fewer tests',
            'Arrange → Act → Assert: set up inputs, call one thing, check one behavior',
            'Calls the real production database',
            'Only tests the happy path',
          ],
          answer: 1,
          explain:
            'Small, focused, fast, deterministic. Name it after the behavior ("returns 0 for an empty array"). Test edge cases: empty, one item, huge, null, negative.',
        },
      ],
    },
  ],
  comingSoon: [
    'Using the browser DevTools debugger',
    'Debugging Python with pdb & breakpoints',
    'Unit tests with Vitest & pytest',
    'Mocking: when and when not to',
    'Integration & end-to-end tests (Playwright)',
    'Test-driven development kata',
  ],
}

export const security: Realm = {
  id: 'security',
  name: 'Security Stronghold',
  topic: 'Web Security',
  icon: '🛡️',
  color: '#d63031',
  when: 'Month 6–7',
  blurb: 'The vulnerabilities that actually get apps hacked — SQL injection, XSS, broken auth — and how to prevent them.',
  lessons: [
    {
      id: 'sec-1',
      title: 'SQL Injection & XSS',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Never trust user input',
          eli5: 'SQL injection is like a form that says "Name: ___" and someone writes **"Bob. Also, give me all the money."** — and the clerk just reads it out loud as an instruction.',
          body: `
## SQL injection
\`\`\`
const q = "SELECT * FROM users WHERE name = '" + name + "'"
// name = "x' OR '1'='1"  → returns EVERY user
// name = "x'; DROP TABLE users; --"  → 💀
\`\`\`
Fix: **parameterized queries**. The SQL and the data travel separately, so data can never become code:
\`\`\`
db.query('SELECT * FROM users WHERE name = $1', [name])
\`\`\`
ORMs (SQLAlchemy, Prisma) do this for you — until you build raw SQL strings by hand.

## XSS (Cross-Site Scripting)
If you put user content into a page as HTML, a "comment" like \`<img src=x onerror="steal(document.cookie)">\` runs in every visitor's browser. React escapes text by default — \`dangerouslySetInnerHTML\` is named that way for a reason.

## Also on the list (OWASP Top 10)
Broken access control (can user 7 fetch \`/api/invoices/8\`?), secrets in code, outdated dependencies, missing rate limits.
`,
        },
        {
          kind: 'code',
          lang: 'sql',
          title: 'Exploit it (to understand it)',
          instructions: `
A login form builds this query: \`SELECT username FROM users WHERE username = '<input>' AND password = '<input>'\`.

Here's the query for a login attempt where the attacker typed \`admin\` as the username. **Edit only the password part** inside the quotes to make the query return the admin row without knowing the password.

(This is a simulation on a throwaway database — and exactly why parameterized queries exist.)
`,
          setup: `CREATE TABLE users (username TEXT, password TEXT);
INSERT INTO users VALUES ('admin', 's3cr3t-hash'), ('ada', 'pw-hash');`,
          starter: `SELECT username FROM users WHERE username = 'admin' AND password = 'guess';\n`,
          tests: '',
          hint: "Make the password input close the quote, then add an always-true condition: ' OR '1'='1 … but watch operator precedence: AND binds tighter than OR. Try: x' OR username = 'admin",
          solution: `SELECT username FROM users WHERE username = 'admin' AND password = 'x' OR username = 'admin';\n`,
        },
        {
          kind: 'quiz',
          prompt: 'Which line is safe?',
          options: [
            'db.query(`SELECT * FROM orders WHERE id = ${req.params.id}`)',
            "db.query('SELECT * FROM orders WHERE id = ' + Number(req.params.id))",
            "db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])",
            "db.query('SELECT * FROM orders WHERE id = $1', [req.params.id])",
          ],
          answer: 2,
          explain:
            'Option C is parameterized AND checks ownership. Option D is injection-safe but has **broken access control**: any logged-in user can read any order by changing the id (an "IDOR" bug).',
        },
      ],
    },
  ],
  comingSoon: [
    'Passwords: hashing with bcrypt/argon2',
    'CSRF & SameSite cookies',
    'CORS is not security',
    'Secrets management',
    'Dependency vulnerabilities & npm audit',
    'Threat modeling your app',
  ],
}

export const devops: Realm = {
  id: 'devops',
  name: 'Container Docks',
  topic: 'Docker, CI/CD & Deployment',
  icon: '🐳',
  color: '#2496ed',
  when: 'Month 7',
  blurb: '"Works on my machine" → works everywhere. Containers, pipelines, and shipping code safely.',
  lessons: [
    {
      id: 'ops-1',
      title: 'Containers & Pipelines',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Ship the whole environment',
          eli5: 'A Docker container is a **lunchbox**: your app plus everything it needs to eat, packed together, so it tastes the same on any table (laptop, CI, server).',
          body: `
A **Docker image** packages your app + its runtime + dependencies + OS libraries. A **container** is a running instance of an image — an isolated process that shares the host's kernel (much lighter than a VM).

\`\`\`
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt     # cached layer if requirements don't change
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`
Each instruction makes a **layer**; layers are cached. Copy dependency files and install *before* copying your code, so code changes don't reinstall everything.

**docker compose** runs multiple containers together (API + Postgres + Redis) for local dev.

## CI/CD
- **CI** (continuous integration): on every push/PR, a pipeline (GitHub Actions) installs, lints, type-checks, tests. Red = don't merge.
- **CD** (continuous delivery/deployment): on merge to main, build the image, run migrations, deploy — automatically.
`,
        },
        {
          kind: 'quiz',
          prompt: 'Every tiny code change makes `docker build` reinstall all npm packages (3 minutes). Why?',
          options: [
            'Docker has no caching',
            '`COPY . .` comes before `npm install`, so any file change invalidates the install layer',
            'npm is slow',
            'You need a bigger machine',
          ],
          answer: 1,
          explain: 'Copy package.json + lockfile first, run npm ci, THEN copy the rest. The install layer is reused until dependencies actually change.',
        },
        {
          kind: 'quiz',
          prompt: 'Where should `alembic upgrade head` run in a deploy pipeline?',
          options: [
            'Manually, whenever someone remembers',
            'Once, as a deploy step before the new app version starts serving traffic',
            'Inside every app container at startup, all at the same time',
            'Never in production',
          ],
          answer: 1,
          explain:
            'Run migrations once per deploy (a pipeline step or a one-off task) before switching traffic. Running them from every container at boot can race. And keep migrations backward-compatible so old and new code can run side-by-side during rollout.',
        },
      ],
    },
  ],
  comingSoon: [
    'Write a Dockerfile for a FastAPI app',
    'docker compose: API + Postgres + Redis',
    'GitHub Actions: lint, test, build',
    'Environment variables & 12-factor apps',
    'Blue/green & canary deploys',
    'Kubernetes: what it is and when you need it',
  ],
}
