import type { Realm } from '../types'

export const GUILD_DB = `
CREATE TABLE guilds (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE heroes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  level INTEGER NOT NULL,
  guild_id INTEGER REFERENCES guilds(id)
);
CREATE TABLE quests (id INTEGER PRIMARY KEY, title TEXT NOT NULL, reward INTEGER NOT NULL);
CREATE TABLE hero_quests (
  hero_id INTEGER REFERENCES heroes(id),
  quest_id INTEGER REFERENCES quests(id),
  completed INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (hero_id, quest_id)
);
INSERT INTO guilds VALUES (1, 'Null Pointers'), (2, 'Stack Overflowers'), (3, 'The Recursers');
INSERT INTO heroes VALUES
  (1, 'Ada', 'mage', 14, 1),
  (2, 'Linus', 'warrior', 9, 2),
  (3, 'Grace', 'mage', 21, 1),
  (4, 'Alan', 'rogue', 12, NULL),
  (5, 'Margaret', 'healer', 17, 3),
  (6, 'Dennis', 'warrior', 5, 2),
  (7, 'Barbara', 'healer', 11, NULL),
  (8, 'Ken', 'rogue', 8, 3);
INSERT INTO quests VALUES (1, 'Slay the Bug Dragon', 500), (2, 'Fix Prod at 2am', 300), (3, 'Write the Docs', 50), (4, 'Refactor the Monolith', 800);
INSERT INTO hero_quests VALUES
  (1, 1, 1), (1, 2, 1), (1, 4, 0),
  (2, 2, 1), (2, 3, 1),
  (3, 1, 1), (3, 4, 1),
  (4, 3, 0),
  (5, 2, 1), (5, 3, 1), (5, 1, 0),
  (6, 3, 1),
  (8, 4, 1);
`

const SCHEMA_NOTE = `
Tables: \`heroes(id, name, class, level, guild_id)\`, \`guilds(id, name)\`, \`quests(id, title, reward)\`, \`hero_quests(hero_id, quest_id, completed)\`.
`

export const sql: Realm = {
  id: 'sql',
  name: 'Data Dungeon',
  topic: 'SQL & Databases',
  icon: '🗄️',
  color: '#e38c00',
  when: 'Month 4',
  blurb: 'A real SQLite database in your browser. Query, aggregate, join, index — and understand what the database does with it.',
  lessons: [
    {
      id: 'sql-1',
      title: 'What Is a Database? + SELECT',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'Why not just a JSON file?',
          eli5: 'A database is a **giant, super-organized spreadsheet** that many people can edit at once without breaking it, and that can answer questions about millions of rows in milliseconds.',
          body: `
A **relational database** (Postgres, MySQL, SQLite) stores data in **tables** — rows and columns with fixed types — and gives you:
- **Querying** — ask complex questions without loading everything into memory
- **Concurrency** — thousands of users reading/writing at once without corrupting data
- **Integrity** — constraints (\`NOT NULL\`, \`UNIQUE\`, foreign keys) reject bad data
- **Durability** — once it says "saved", it survives a crash (write-ahead log)

Every row has a **primary key** (\`id\`) that uniquely identifies it. A **foreign key** (\`guild_id\`) points to a row in another table.

\`\`\`
SELECT name, level          -- which columns
FROM heroes                 -- which table
WHERE level >= 10           -- which rows
ORDER BY level DESC         -- sorting
LIMIT 3;                    -- how many
\`\`\`
> SQL is **declarative**: you describe *what* you want, the database's *query planner* figures out *how* to get it.
`,
        },
        {
          kind: 'code',
          lang: 'sql',
          title: 'Find the veterans',
          instructions: `
${SCHEMA_NOTE}
Select the \`name\` and \`level\` of every hero **level 10 or higher**, sorted from highest level to lowest.
`,
          setup: GUILD_DB,
          starter: `SELECT *\nFROM heroes;\n`,
          tests: '',
          hint: 'SELECT name, level FROM heroes WHERE level >= 10 ORDER BY level DESC;',
          solution: `SELECT name, level\nFROM heroes\nWHERE level >= 10\nORDER BY level DESC;\n`,
        },
        {
          kind: 'quiz',
          prompt: 'Which query finds heroes with **no** guild?',
          options: ['WHERE guild_id = NULL', 'WHERE guild_id IS NULL', "WHERE guild_id = ''", 'WHERE NOT guild_id'],
          answer: 1,
          explain: '`NULL` means "unknown", so `NULL = NULL` is not true — it\'s NULL! You must use `IS NULL` / `IS NOT NULL`. This trips up everyone once.',
        },
      ],
    },
    {
      id: 'sql-2',
      title: 'Aggregates & GROUP BY',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'Summarizing data',
          eli5: '`GROUP BY` is **sorting your laundry into piles** (by color), then `COUNT`/`SUM` tells you **how much is in each pile**.',
          body: `
Aggregate functions collapse many rows into one: \`COUNT(*)\`, \`SUM(x)\`, \`AVG(x)\`, \`MIN(x)\`, \`MAX(x)\`.

\`GROUP BY\` splits rows into buckets first, then aggregates each bucket:

\`\`\`
SELECT class, AVG(level) AS avg_level
FROM heroes
GROUP BY class
HAVING AVG(level) > 10;    -- HAVING filters groups, WHERE filters rows
\`\`\`
## Order of execution (not the order you write it!)
\`FROM\` → \`WHERE\` → \`GROUP BY\` → \`HAVING\` → \`SELECT\` → \`ORDER BY\` → \`LIMIT\`

That's why you can't use a SELECT alias in WHERE — it doesn't exist yet.
`,
        },
        {
          kind: 'code',
          lang: 'sql',
          title: 'Class census',
          instructions: `
${SCHEMA_NOTE}
For each hero \`class\`, return the class, the number of heroes as \`heroes\`, and the highest level as \`max_level\`. Order by \`heroes\` descending, then \`class\` alphabetically.
`,
          setup: GUILD_DB,
          starter: `SELECT class\nFROM heroes;\n`,
          tests: '',
          hint: 'SELECT class, COUNT(*) AS heroes, MAX(level) AS max_level FROM heroes GROUP BY class ORDER BY heroes DESC, class;',
          solution: `SELECT class, COUNT(*) AS heroes, MAX(level) AS max_level\nFROM heroes\nGROUP BY class\nORDER BY heroes DESC, class;\n`,
        },
      ],
    },
    {
      id: 'sql-3',
      title: 'JOINs: Connecting Tables',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Why data is split across tables',
          eli5: "Store each fact **once**, then connect with ID numbers — like a contacts app storing a friend's address once instead of in every text message. A JOIN **reconnects** them when you ask.",
          body: `
**Normalization**: store each fact once. The guild's name lives in \`guilds\`; heroes just store \`guild_id\`. Rename a guild → change one row, not hundreds.

A **JOIN** stitches tables back together at query time:

\`\`\`
SELECT heroes.name, guilds.name AS guild
FROM heroes
JOIN guilds ON guilds.id = heroes.guild_id;
\`\`\`
- \`INNER JOIN\` (or just \`JOIN\`) — only rows that match on both sides
- \`LEFT JOIN\` — every row from the left table; NULLs where there's no match
- Many-to-many (heroes ↔ quests) uses a **join table** (\`hero_quests\`) with two foreign keys
`,
        },
        {
          kind: 'quiz',
          prompt: 'Alan has `guild_id = NULL`. Does he appear in `heroes JOIN guilds ON ...`?',
          options: ['Yes, with guild = NULL', 'No — INNER JOIN drops rows without a match', 'Yes, twice', 'The query errors'],
          answer: 1,
          explain: 'Use `LEFT JOIN guilds` to keep him (with a NULL guild name).',
        },
        {
          kind: 'code',
          lang: 'sql',
          title: 'Guild roster (everyone included)',
          instructions: `
${SCHEMA_NOTE}
List **every** hero's \`name\` and their guild's name as \`guild\` — heroes without a guild should show \`'Solo'\` (look up \`COALESCE\`). Order by hero name.
`,
          setup: GUILD_DB,
          starter: `SELECT heroes.name\nFROM heroes;\n`,
          tests: '',
          hint: "SELECT h.name, COALESCE(g.name, 'Solo') AS guild FROM heroes h LEFT JOIN guilds g ON g.id = h.guild_id ORDER BY h.name;",
          solution: `SELECT h.name, COALESCE(g.name, 'Solo') AS guild\nFROM heroes h\nLEFT JOIN guilds g ON g.id = h.guild_id\nORDER BY h.name;\n`,
        },
      ],
    },
    {
      id: 'sql-4',
      title: 'Indexes: Why Queries Are Fast (or Slow)',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'The book index',
          eli5: 'An index is the **index at the back of a textbook**. Without it, you flip through every page. With it, you jump straight to page 247.',
          body: `
Without an index, \`WHERE email = 'ada@x.com'\` makes the database read **every row** (a *full table scan*): O(n). On 50 million users, that hurts.

An **index** is a separate, sorted data structure (usually a **B-tree**) mapping column values → row locations. Lookups become O(log n): ~26 steps for 50 million rows.

\`\`\`
CREATE INDEX idx_users_email ON users(email);
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'x';
-- SEARCH users USING INDEX idx_users_email (email=?)
\`\`\`
## The trade-off
Every INSERT/UPDATE must also update every index. More indexes = faster reads, slower writes, more disk. Index the columns you filter, join and sort on — not everything.

Primary keys and \`UNIQUE\` columns get an index automatically.
`,
        },
        {
          kind: 'quiz',
          prompt: 'Your `orders` page is slow. The query is `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC`. Best index?',
          options: [
            'CREATE INDEX ON orders(created_at)',
            'CREATE INDEX ON orders(customer_id, created_at)',
            'An index on every column',
            'CREATE INDEX ON orders(id)',
          ],
          answer: 1,
          explain:
            'A **composite index** on (customer_id, created_at) lets the DB jump to that customer AND read their orders already sorted. Column order matters: equality filters first, then sort/range columns.',
        },
        {
          kind: 'code',
          lang: 'sql',
          title: 'Add an index (and check it)',
          instructions: `
${SCHEMA_NOTE}
Heroes are constantly looked up by \`class\` and \`level\`. Create an index named exactly \`idx_heroes_class_level\` on \`heroes(class, level)\`.

The checker inspects the database's catalog (\`sqlite_master\`) after your code runs.
`,
          setup: GUILD_DB,
          starter: `-- CREATE INDEX ...\n`,
          tests: `SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name = 'idx_heroes_class_level';`,
          hint: 'CREATE INDEX idx_heroes_class_level ON heroes(class, level);',
          solution: `CREATE INDEX idx_heroes_class_level ON heroes(class, level);\n`,
        },
      ],
    },
    {
      id: 'sql-5',
      title: 'BOSS: The Leaderboard',
      boss: true,
      minutes: 20,
      steps: [
        {
          kind: 'code',
          lang: 'sql',
          title: 'Top 3 bounty hunters',
          instructions: `
${SCHEMA_NOTE}
Build the leaderboard: for each hero, the total \`reward\` from quests they have **completed** (\`completed = 1\`).

Return \`name\` and \`total_reward\` for the **top 3** heroes, highest first (ties broken by name A→Z).

You'll need two JOINs, a WHERE, GROUP BY, ORDER BY and LIMIT. This is a very real interview-style query.
`,
          setup: GUILD_DB,
          starter: `SELECT h.name\nFROM heroes h\n-- JOIN ...\n`,
          tests: '',
          hint: 'FROM heroes h JOIN hero_quests hq ON hq.hero_id = h.id JOIN quests q ON q.id = hq.quest_id WHERE hq.completed = 1 GROUP BY h.id ...',
          solution: `SELECT h.name, SUM(q.reward) AS total_reward\nFROM heroes h\nJOIN hero_quests hq ON hq.hero_id = h.id\nJOIN quests q ON q.id = hq.quest_id\nWHERE hq.completed = 1\nGROUP BY h.id, h.name\nORDER BY total_reward DESC, h.name\nLIMIT 3;\n`,
        },
        {
          kind: 'quiz',
          prompt: 'Your API loads 100 heroes, then runs one query per hero to fetch their guild. What is this called?',
          options: ['A cartesian join', 'The N+1 query problem', 'Sharding', 'A deadlock'],
          answer: 1,
          explain:
            "1 query for the list + N queries for related rows = N+1 round trips. Fix: a single JOIN, or `WHERE guild_id IN (...)`, or your ORM's eager loading (SQLAlchemy `selectinload`, Prisma `include`).",
        },
      ],
    },
  ],
  comingSoon: [
    'INSERT, UPDATE, DELETE (and forgetting WHERE 😱)',
    'Transactions & ACID',
    'Subqueries & CTEs (WITH)',
    'Window functions: RANK, ROW_NUMBER, running totals',
    'Normalization & schema design',
    'PostgreSQL specifics: JSONB, arrays, EXPLAIN ANALYZE',
    'ORMs: SQLAlchemy & Prisma — what SQL do they generate?',
  ],
}
