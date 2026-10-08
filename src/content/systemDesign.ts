import type { Realm } from '../types'

export const systemDesign: Realm = {
  id: 'design',
  name: "Architect's Tower",
  topic: 'System Design',
  icon: '🗼',
  glyph: 'SYS',
  color: '#a29bfe',
  when: 'Month 7–8',
  blurb: 'Scale from one server to millions of users: load balancers, caching, replication, sharding, queues. Then design real systems.',
  lessons: [
    {
      id: 'sd-1',
      title: 'Scaling 101',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'From one box to many',
          eli5: 'One server is **one cashier**. When the line gets long, hire more cashiers (horizontal scaling) and put a **greeter** at the door to send customers to whoever is free (load balancer).',
          body: `
Day 1: one server runs your app AND the database. Then you get popular.

1. **Separate the database** onto its own machine.
2. **Vertical scaling** — buy a bigger machine. Easy, but there's a ceiling, and it's a single point of failure.
3. **Horizontal scaling** — run many identical app servers behind a **load balancer** that spreads requests (round-robin, least-connections).
4. For that to work, app servers must be **stateless**: no sessions in memory, no uploaded files on local disk. Put state in the DB, Redis, or S3 — then any server can handle any request and you can add/remove servers freely.
5. **CDN** — serve static files (JS, images) from edge servers near users.

## The numbers that matter
- **Latency**: how long one request takes (p50, p95, p99)
- **Throughput**: requests per second
- **Availability**: 99.9% = ~8.7 hours down per year; 99.99% = ~52 minutes
`,
        },
        {
          kind: 'quiz',
          prompt: 'You add a 2nd app server behind a load balancer. Users randomly get logged out. Most likely cause?',
          options: ['The database is too slow', "Sessions are stored in each server's memory", 'The CDN is caching the login page', 'DNS is broken'],
          answer: 1,
          explain:
            'Logged in on server A, next request hits server B, which never heard of you. Fix: store sessions in a shared store (Redis/DB) or use stateless tokens. (Sticky sessions are a band-aid.)',
        },
        {
          kind: 'quiz',
          prompt: 'Which is NOT a benefit of horizontal scaling?',
          options: [
            'No single point of failure',
            'Add capacity by adding machines',
            'Makes the database automatically faster',
            'Can deploy servers one at a time without downtime',
          ],
          answer: 2,
          explain:
            'More app servers = MORE load on the one database. The database usually becomes the bottleneck next, which is where caching, read replicas and sharding come in.',
        },
      ],
    },
    {
      id: 'sd-2',
      title: 'Caching',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: "The fastest query is the one you don't run",
          eli5: "A cache is a **sticky note on your monitor** with the answer you keep looking up, so you don't walk to the filing cabinet (database) every time.",
          body: `
A **cache** stores the result of expensive work in fast storage (memory/Redis) so repeat requests skip it.

## Cache-aside (the most common pattern)
\`\`\`
value = cache.get(key)
if value is missing:            // "cache miss"
    value = db.query(...)
    cache.set(key, value, ttl=60)
return value
\`\`\`
## The hard parts
- **Invalidation** — when data changes, delete or update the cached copy (or accept up to \`ttl\` seconds of staleness)
- **Eviction** — memory is limited. **LRU** (Least Recently Used) throws out whatever hasn't been touched longest
- **Stampede** — a hot key expires and 10,000 requests hit the DB at once

> "There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Build an LRU cache',
          instructions: `
Implement \`class LRUCache\` with \`constructor(capacity)\`, \`get(key)\` and \`set(key, value)\`.
- \`get\` returns the value (or \`undefined\`) and marks the key as **recently used**.
- \`set\` inserts/updates and marks it recently used. If over capacity, evict the **least** recently used key.

Trick: a JS \`Map\` remembers insertion order. Delete + re-insert moves a key to the end ("most recent"). \`map.keys().next().value\` is the oldest.
`,
          starter: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity\n    this.map = new Map()\n  }\n\n  get(key) {\n    \n  }\n\n  set(key, value) {\n    \n  }\n}\n`,
          tests: `test('basic get/set', () => { const c = new LRUCache(2); c.set('a', 1); expect(c.get('a')).toBe(1); expect(c.get('zz')).toBe(undefined) })
test('evicts least recently used', () => {
  const c = new LRUCache(2)
  c.set('a', 1); c.set('b', 2); c.set('c', 3)
  expect(c.get('a')).toBe(undefined)
  expect(c.get('c')).toBe(3)
})
test('get refreshes recency', () => {
  const c = new LRUCache(2)
  c.set('a', 1); c.set('b', 2)
  c.get('a')
  c.set('c', 3)
  expect(c.get('b')).toBe(undefined)
  expect(c.get('a')).toBe(1)
})
test('update existing key does not evict', () => {
  const c = new LRUCache(2)
  c.set('a', 1); c.set('b', 2); c.set('a', 10)
  expect(c.get('b')).toBe(2)
  expect(c.get('a')).toBe(10)
})`,
          hint: 'get: if (!this.map.has(key)) return undefined; const v = this.map.get(key); this.map.delete(key); this.map.set(key, v); return v. set: delete, set, then if (this.map.size > this.capacity) this.map.delete(this.map.keys().next().value)',
          solution: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity\n    this.map = new Map()\n  }\n\n  get(key) {\n    if (!this.map.has(key)) return undefined\n    const value = this.map.get(key)\n    this.map.delete(key)\n    this.map.set(key, value)\n    return value\n  }\n\n  set(key, value) {\n    this.map.delete(key)\n    this.map.set(key, value)\n    if (this.map.size > this.capacity) this.map.delete(this.map.keys().next().value)\n  }\n}\n`,
        },
      ],
    },
    {
      id: 'sd-3',
      title: 'Databases at Scale',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Replicas, shards and CAP',
          eli5: 'Read replicas are **photocopies of the textbook** so more students can read at once. Sharding is **splitting the textbook into volumes** A–M and N–Z because one book got too heavy.',
          body: `
## Read replicas
Most apps read far more than they write. Copy the primary DB to **replicas**; send writes to the primary and reads to the replicas. Catch: **replication lag** — a user updates their profile, refreshes, and briefly sees the old one.

## Sharding
When one machine can't hold all the data or handle all the writes, split rows across many databases by a **shard key** (e.g. \`user_id % 4\`). Powerful, but cross-shard queries and JOINs get painful. Pick the key carefully: a bad one creates a "hot shard".

## SQL vs NoSQL
- **SQL** (Postgres): relations, JOINs, transactions, flexible queries. The default choice.
- **Key-value / document** (DynamoDB, MongoDB, Redis): massive scale for known access patterns, weaker querying.

## CAP theorem
When the network splits (**P**artition), a distributed system must choose **C**onsistency (refuse to answer rather than give stale data) or **A**vailability (answer, possibly stale). Banks lean C; social feeds lean A.
`,
        },
        {
          kind: 'quiz',
          prompt: 'Your app is 95% reads and the DB CPU is at 90%. Cheapest effective fix?',
          options: ['Shard the database', 'Add a cache and/or read replicas', 'Switch to MongoDB', 'Add more app servers'],
          answer: 1,
          explain: 'Read-heavy load → serve reads from cache/replicas. Sharding is a big, complex step you take when writes or data size outgrow one machine.',
        },
        {
          kind: 'quiz',
          prompt: 'You shard users by `country`. What goes wrong?',
          options: [
            "Nothing, it's ideal",
            'Uneven shards — one huge country overloads one database (hot shard)',
            'You can no longer use SQL',
            "Users can't change their password",
          ],
          answer: 1,
          explain: 'Shard keys need high cardinality and even distribution. `user_id` (hashed) is a common choice.',
        },
      ],
    },
    {
      id: 'sd-4',
      title: 'Queues & Async Work',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: "Don't make the user wait",
          eli5: 'A queue is a **restaurant order ticket rail**: the waiter (your API) pins the order and goes back to customers immediately; the cooks (workers) handle tickets when they can.',
          body: `
Sign-up should take 200ms, not 8 seconds — but you need to send a welcome email, resize the avatar, and update analytics.

Put a **message** on a **queue** (SQS, RabbitMQ, Kafka, Redis/BullMQ, Celery) and respond immediately. **Workers** pull messages and do the slow work in the background.

Benefits: fast responses, absorbs traffic spikes (the queue just gets longer), retries on failure, services are **decoupled**.

## Gotchas
- **At-least-once delivery** — a message may be processed twice. Make handlers **idempotent** (doing it twice = same result as once).
- **Dead-letter queue** — messages that keep failing go here instead of retrying forever.
`,
        },
        {
          kind: 'quiz',
          prompt:
            'A worker charges a credit card, then crashes before acknowledging the message. The message is redelivered. How do you avoid double-charging?',
          options: [
            'Use a faster server',
            'Make it idempotent: store a payment idempotency key and skip if already processed',
            'Turn off retries',
            'Use a bigger queue',
          ],
          answer: 1,
          explain: 'Stripe literally supports an `Idempotency-Key` header for this. Any handler with side effects should be safe to run twice.',
        },
      ],
    },
    {
      id: 'sd-5',
      title: 'BOSS: Design a URL Shortener',
      boss: true,
      minutes: 25,
      steps: [
        {
          kind: 'concept',
          title: 'The interview framework',
          eli5: 'System design is **planning a house before building it**: what rooms do we need, how many people will live there, where do the pipes go, and what happens when 1,000 guests show up.',
          body: `
1. **Requirements** — functional (shorten a URL, redirect, maybe analytics) and non-functional (100M new URLs/month, redirects must be fast, highly available).
2. **Estimates** — 100M writes/month ≈ 40/sec. Reads are ~100× writes ≈ 4,000/sec. 5 years × 1.2B URLs × ~500 bytes ≈ 3TB.
3. **API** — \`POST /urls { longUrl }\` → \`{ shortCode }\` · \`GET /:code\` → \`301/302\` redirect.
4. **Data model** — \`urls(code PK, long_url, user_id, created_at)\`.
5. **Core algorithm** — how to make short, unique codes? Take a unique numeric ID (DB sequence or distributed ID generator) and **base62-encode** it (\`0-9a-zA-Z\`). 7 chars of base62 = 62⁷ ≈ 3.5 trillion codes.
6. **Scale** — read-heavy → cache hot codes in Redis, CDN at the edge, read replicas. Writes are small; one primary + sequence is fine for a long time.
7. **Trade-offs** — 301 (permanent, browsers cache it → less load, but you lose click analytics) vs 302 (temporary, every click hits you).
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Base62 encode/decode',
          instructions: `
Using the alphabet \`0-9a-zA-Z\` (62 chars), write \`encode(n)\` (non-negative integer → string) and \`decode(str)\` (string → integer).

Same algorithm as binary from the Engine Room — just base 62! \`encode(0)\` → \`'0'\`, \`encode(61)\` → \`'Z'\`, \`encode(62)\` → \`'10'\`.
`,
          starter: `const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'\n\nfunction encode(n) {\n  \n}\n\nfunction decode(str) {\n  \n}\n\nconsole.log(encode(125), decode(encode(125)))\n`,
          tests: `test('encode small', () => { expect(encode(0)).toBe('0'); expect(encode(61)).toBe('Z'); expect(encode(62)).toBe('10') })
test('encode big', () => expect(encode(3521614606207)).toBe('ZZZZZZZ'))
test('decode', () => expect(decode('10')).toBe(62))
test('round trips', () => { for (const n of [1, 999, 123456789, 2 ** 40]) expect(decode(encode(n))).toBe(n) })`,
          hint: 'encode: while (n > 0) { s = ALPHABET[n % 62] + s; n = Math.floor(n / 62) }. decode: for each char, n = n * 62 + ALPHABET.indexOf(ch).',
          solution: `const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'\n\nfunction encode(n) {\n  if (n === 0) return '0'\n  let s = ''\n  while (n > 0) {\n    s = ALPHABET[n % 62] + s\n    n = Math.floor(n / 62)\n  }\n  return s\n}\n\nfunction decode(str) {\n  let n = 0\n  for (const ch of str) n = n * 62 + ALPHABET.indexOf(ch)\n  return n\n}\n`,
        },
        {
          kind: 'quiz',
          prompt: 'Why not just use a random 7-char code?',
          options: [
            'Random is too slow',
            'Collisions: as the table fills, random codes start clashing and you must check-and-retry',
            "Random strings can't be stored in SQL",
            'It would be fine and is strictly better',
          ],
          answer: 1,
          explain:
            'Random works (with a UNIQUE constraint + retry) and hides how many URLs you have. Counter + base62 never collides but is guessable. Both are valid — naming the trade-off is what interviewers want to hear.',
        },
        {
          kind: 'explain',
          prompt: 'Summarize your URL shortener design in a few sentences, including how it handles 4,000 redirects per second.',
          keyPoints: [
            'Unique ID → base62 short code',
            'Table keyed by code',
            'Cache hot codes (Redis) since reads dominate',
            'Stateless app servers behind a load balancer',
            '301 vs 302 trade-off',
          ],
        },
      ],
    },
  ],
  comingSoon: [
    'Consistent hashing',
    'CDNs & edge computing',
    'Design a news feed (fan-out on write vs read)',
    'Design a chat app (WebSockets at scale)',
    'Microservices vs monolith (and the modular monolith)',
    'Observability: logs, metrics, traces',
    'Back-of-the-envelope estimation drills',
  ],
}
