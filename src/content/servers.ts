import type { Realm } from '../types'

export const servers: Realm = {
  id: 'servers',
  name: 'Server Citadel',
  topic: 'Servers, HTTP & APIs',
  icon: '🏯',
  glyph: 'HTTP',
  color: '#00b894',
  when: 'Month 6',
  blurb: 'What really happens between a click and a response: DNS, TCP, HTTP, routing, middleware, auth. Build the internals of Express yourself.',
  lessons: [
    {
      id: 'srv-1',
      title: 'What Happens When You Type a URL',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'From keypress to pixels',
          eli5: "Visiting a website is **ordering takeout**: look up the restaurant's address (DNS), call them (TCP), speak in code so no one eavesdrops (TLS), place your order (HTTP request), and the food arrives (response).",
          body: `
You type \`https://api.questapp.com/users/7\` and hit Enter:

1. **DNS** — "what's the IP for api.questapp.com?" Your OS asks a resolver, which asks root → \`.com\` → questapp's nameserver → \`52.1.2.3\`. Cached at every layer (that's what TTL is).
2. **TCP** — open a reliable connection to \`52.1.2.3:443\` with a 3-way handshake (SYN, SYN-ACK, ACK).
3. **TLS** — agree on encryption keys and verify the server's certificate. Now nobody in between can read or tamper.
4. **HTTP request** — plain text over that pipe:
\`\`\`
GET /users/7 HTTP/1.1
Host: api.questapp.com
Authorization: Bearer eyJhbGc...
Accept: application/json
\`\`\`
5. **Server** — a load balancer forwards it to one of your app servers; your framework matches the route, runs middleware, your handler queries the DB.
6. **HTTP response**:
\`\`\`
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=60

{"id": 7, "name": "Ada"}
\`\`\`
7. The browser parses it and renders.

> HTTP is **stateless**: every request stands alone. Logins "persist" only because the client re-sends a cookie or token every time.
`,
        },
        {
          kind: 'quiz',
          prompt: 'What does DNS do?',
          options: ['Encrypts traffic', 'Translates a domain name into an IP address', 'Balances load between servers', 'Caches web pages'],
          answer: 1,
          explain: 'DNS is the internet\'s phone book. "It\'s always DNS" is a real ops meme — a bad DNS record can take down a whole site.',
        },
        {
          kind: 'quiz',
          prompt: "Match the status: the user is logged in but tries to delete someone else's post.",
          options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
          answer: 2,
          explain:
            '401 = "who are you?" (not authenticated). 403 = "I know who you are, and you can\'t do that" (not authorized). 2xx success · 3xx redirect · 4xx client\'s fault · 5xx server\'s fault.',
        },
        {
          kind: 'explain',
          prompt: 'Walk through what happens between pressing Enter on a URL and seeing the page. (This is a top interview question!)',
          keyPoints: [
            'DNS lookup turns the name into an IP',
            'TCP connection + TLS handshake',
            'HTTP request with method, path, headers',
            'Server routes it, runs code, returns a response with status + body',
            'Browser renders it',
          ],
        },
      ],
    },
    {
      id: 'srv-2',
      title: 'Build a Router',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'How app.get("/users/:id") works',
          eli5: "A router is a **mailroom sorter**: it looks at the address on each envelope (method + path) and drops it in the right person's inbox (handler).",
          body: `
A web framework's router compares each incoming request's **method** and **path** against a list of patterns:

\`\`\`
app.get('/users/:id', handler)        // Express
@app.get("/users/{id}")               # FastAPI
\`\`\`
\`:id\` is a **path parameter**: it matches any one segment and captures it. \`/users/7\` → \`{ id: '7' }\`.

## REST conventions
- \`GET /quests\` — list · \`GET /quests/7\` — one
- \`POST /quests\` — create · \`PATCH /quests/7\` — update · \`DELETE /quests/7\` — delete
- Nouns in paths, verbs come from the HTTP method.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Match a route',
          instructions: `
Write \`matchRoute(pattern, path)\`:
- Split both on \`/\`. They must have the same number of segments.
- Segments starting with \`:\` capture the value into a params object.
- Other segments must match exactly.
- Return the params object on a match (\`{}\` if there are no params), or \`null\`.

Then write \`route(routes, method, path)\` that finds the first route in \`routes\` (\`[{ method, pattern, name }]\`) whose method matches and whose pattern matches, returning \`{ name, params }\` — or \`null\` (that's a 404!).
`,
          starter: `function matchRoute(pattern, path) {\n  \n}\n\nfunction route(routes, method, path) {\n  \n}\n\nconsole.log(matchRoute('/users/:id', '/users/7'))\n`,
          tests: `const routes = [
  { method: 'GET', pattern: '/users', name: 'listUsers' },
  { method: 'GET', pattern: '/users/:id', name: 'getUser' },
  { method: 'DELETE', pattern: '/users/:id', name: 'deleteUser' },
  { method: 'GET', pattern: '/users/:id/quests/:questId', name: 'getUserQuest' },
]
test('captures a param', () => expect(matchRoute('/users/:id', '/users/7')).toEqual({ id: '7' }))
test('static match', () => expect(matchRoute('/users', '/users')).toEqual({}))
test('segment count must match', () => expect(matchRoute('/users/:id', '/users/7/edit')).toBe(null))
test('static mismatch', () => expect(matchRoute('/users/:id', '/posts/7')).toBe(null))
test('route by method', () => expect(route(routes, 'DELETE', '/users/3')).toEqual({ name: 'deleteUser', params: { id: '3' } }))
test('two params', () => expect(route(routes, 'GET', '/users/3/quests/9')).toEqual({ name: 'getUserQuest', params: { id: '3', questId: '9' } }))
test('404', () => expect(route(routes, 'POST', '/users')).toBe(null))`,
          hint: "const a = pattern.split('/'), b = path.split('/'); if lengths differ → null. Loop: if a[i].startsWith(':') params[a[i].slice(1)] = b[i]; else if a[i] !== b[i] return null.",
          solution: `function matchRoute(pattern, path) {\n  const a = pattern.split('/')\n  const b = path.split('/')\n  if (a.length !== b.length) return null\n  const params = {}\n  for (let i = 0; i < a.length; i++) {\n    if (a[i].startsWith(':')) params[a[i].slice(1)] = b[i]\n    else if (a[i] !== b[i]) return null\n  }\n  return params\n}\n\nfunction route(routes, method, path) {\n  for (const r of routes) {\n    if (r.method !== method) continue\n    const params = matchRoute(r.pattern, path)\n    if (params) return { name: r.name, params }\n  }\n  return null\n}\n`,
        },
      ],
    },
    {
      id: 'srv-3',
      title: 'Middleware: The Onion',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Every request passes through layers',
          eli5: 'Middleware is **airport security**: every passenger (request) goes through ID check, bag scan, metal detector — any checkpoint can stop you before you reach the gate (your handler).',
          body: `
**Middleware** = functions that run before (and after) your route handler: logging, parsing JSON, auth, CORS, rate limiting, error handling.

\`\`\`
app.use(logger)
app.use(express.json())
app.use(requireAuth)
app.get('/me', (req, res) => res.json(req.user))
\`\`\`
Each middleware gets \`(ctx, next)\`. Calling \`next()\` passes control to the next layer; *not* calling it stops the chain (e.g. auth failed → send 401, done). Code after \`await next()\` runs on the way back out — like layers of an onion.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Write compose()',
          instructions: `
Write \`compose(middlewares)\` that returns a function \`(ctx) => Promise\` which runs the middlewares in order. Each middleware is \`async (ctx, next) => {...}\`; calling \`next()\` runs the next one.

This is the actual core of Koa (and the idea behind Express).
`,
          starter: `function compose(middlewares) {\n  return function (ctx) {\n    // dispatch(i) should run middlewares[i] with a next() that calls dispatch(i + 1)\n  }\n}\n\nconst app = compose([\n  async (ctx, next) => { ctx.log.push('in A'); await next(); ctx.log.push('out A') },\n  async (ctx, next) => { ctx.log.push('in B'); await next(); ctx.log.push('out B') },\n  async (ctx) => { ctx.log.push('handler') },\n])\nconst ctx = { log: [] }\napp(ctx).then(() => console.log(ctx.log))\n`,
          tests: `test('onion order', async () => {
  const ctx = { log: [] }
  await compose([
    async (c, next) => { c.log.push('a1'); await next(); c.log.push('a2') },
    async (c, next) => { c.log.push('b1'); await next(); c.log.push('b2') },
    async (c) => { c.log.push('h') },
  ])(ctx)
  expect(ctx.log).toEqual(['a1', 'b1', 'h', 'b2', 'a2'])
})
test('not calling next() stops the chain (auth fail)', async () => {
  const ctx = { status: 200, reached: false }
  await compose([
    async (c) => { c.status = 401 },
    async (c) => { c.reached = true },
  ])(ctx)
  expect(ctx).toEqual({ status: 401, reached: false })
})
test('works with an empty stack', async () => { await compose([])({}) ; expect(true).toBe(true) })`,
          hint: 'const dispatch = (i) => { const fn = middlewares[i]; if (!fn) return Promise.resolve(); return Promise.resolve(fn(ctx, () => dispatch(i + 1))) }; return dispatch(0)',
          solution: `function compose(middlewares) {\n  return function (ctx) {\n    const dispatch = (i) => {\n      const fn = middlewares[i]\n      if (!fn) return Promise.resolve()\n      return Promise.resolve(fn(ctx, () => dispatch(i + 1)))\n    }\n    return dispatch(0)\n  }\n}\n`,
        },
      ],
    },
    {
      id: 'srv-4',
      title: 'BOSS: Auth & the Rate Limiter',
      boss: true,
      minutes: 25,
      steps: [
        {
          kind: 'concept',
          title: 'Sessions vs JWTs',
          eli5: 'A session is a **coat-check ticket** (the server keeps your info, you keep a number). A JWT is a **signed hall pass** (you carry all the info yourself; the signature proves a teacher wrote it).',
          body: `
**Authentication** = proving who you are. **Authorization** = what you're allowed to do.

## Session cookies
Login → server stores \`sessionId → userId\` (in Redis/DB) → sends \`Set-Cookie: sid=abc; HttpOnly; Secure\`. Every request sends the cookie; server looks it up. Easy to revoke (delete the session).

## JWT (JSON Web Token)
Login → server signs \`{ sub: userId, exp: ... }\` with a secret → client sends \`Authorization: Bearer <token>\`. Server just verifies the signature — no lookup. But you **can't easily revoke** it before it expires, and the payload is only base64 (readable by anyone!), not encrypted.

## Never
- store passwords in plain text — hash with **bcrypt/argon2**
- put JWTs in \`localStorage\` if you can avoid it (XSS can steal them)

## Rate limiting
Protect login and APIs from abuse. The **token bucket**: each user has a bucket of N tokens that refills at R per second; each request spends one; empty bucket → \`429 Too Many Requests\`.
`,
        },
        {
          kind: 'quiz',
          prompt: 'Is the data inside a JWT secret?',
          options: [
            "Yes, it's encrypted",
            "No — it's base64-encoded and signed, so anyone can READ it, but nobody can CHANGE it without the secret",
            'Only the header is visible',
            'Only on HTTPS',
          ],
          answer: 1,
          explain: "Paste any JWT into jwt.io and you can read it. The signature only proves it wasn't tampered with. Never put secrets in a JWT payload.",
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Token bucket rate limiter',
          instructions: `
Implement \`class RateLimiter\`:
- \`constructor(capacity, refillPerSecond)\`
- \`allow(userId, nowMs)\` → \`true\` if the request is allowed (spend a token), \`false\` if the bucket is empty (→ 429).

Each user has their own bucket, starting full. Before checking, refill: \`tokens = min(capacity, tokens + elapsedSeconds × refillPerSecond)\`. Time is passed in (\`nowMs\`) so it's testable.
`,
          starter: `class RateLimiter {\n  constructor(capacity, refillPerSecond) {\n    this.capacity = capacity\n    this.refill = refillPerSecond\n    this.buckets = new Map() // userId -> { tokens, last }\n  }\n\n  allow(userId, nowMs) {\n    \n  }\n}\n`,
          tests: `test('allows up to capacity', () => {
  const rl = new RateLimiter(3, 1)
  expect([rl.allow('a', 0), rl.allow('a', 0), rl.allow('a', 0), rl.allow('a', 0)]).toEqual([true, true, true, false])
})
test('users have separate buckets', () => {
  const rl = new RateLimiter(1, 1)
  rl.allow('a', 0)
  expect(rl.allow('b', 0)).toBe(true)
})
test('refills over time', () => {
  const rl = new RateLimiter(2, 1)
  rl.allow('a', 0); rl.allow('a', 0)
  expect(rl.allow('a', 500)).toBe(false)
  expect(rl.allow('a', 1600)).toBe(true)
})
test('never exceeds capacity', () => {
  const rl = new RateLimiter(2, 10)
  rl.allow('a', 0)
  const results = [rl.allow('a', 100000), rl.allow('a', 100000), rl.allow('a', 100000)]
  expect(results).toEqual([true, true, false])
})`,
          hint: 'let b = this.buckets.get(userId) ?? { tokens: this.capacity, last: nowMs }; b.tokens = Math.min(this.capacity, b.tokens + (nowMs - b.last) / 1000 * this.refill); b.last = nowMs; ... if (b.tokens >= 1) { b.tokens -= 1; return true }',
          solution: `class RateLimiter {\n  constructor(capacity, refillPerSecond) {\n    this.capacity = capacity\n    this.refill = refillPerSecond\n    this.buckets = new Map()\n  }\n\n  allow(userId, nowMs) {\n    const b = this.buckets.get(userId) ?? { tokens: this.capacity, last: nowMs }\n    b.tokens = Math.min(this.capacity, b.tokens + ((nowMs - b.last) / 1000) * this.refill)\n    b.last = nowMs\n    this.buckets.set(userId, b)\n    if (b.tokens >= 1) {\n      b.tokens -= 1\n      return true\n    }\n    return false\n  }\n}\n`,
        },
      ],
    },
  ],
  comingSoon: [
    'Build a real API: Express + TypeScript',
    'Build a real API: FastAPI + Python',
    'CORS explained (finally)',
    'Caching headers & ETags',
    'WebSockets & real-time',
    'REST vs GraphQL vs tRPC',
    'OAuth & "Sign in with Google"',
    'Linux & the terminal for backend devs',
  ],
}
