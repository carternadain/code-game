import type { Lesson, Realm } from '../types'
import { GUILD_DB } from './sql'

const HEROES_NOTE = `
Table: \`heroes(id, name, class, level, guild_id)\`. Ada is id 1, Linus 2, Grace 3, Alan 4, Margaret 5, Dennis 6, Barbara 7, Ken 8.
`

/** The guild database plus a gold purse for every hero (Ada starts rich). */
const GOLD_DB =
  GUILD_DB +
  `
ALTER TABLE heroes ADD COLUMN gold INTEGER NOT NULL DEFAULT 100;
UPDATE heroes SET gold = 250 WHERE id = 1;
`

/** SQL that changes data: INSERT/UPDATE/DELETE, then transactions. */
export const sqlWrites: Lesson[] = [
  {
    id: 'sql-w1',
    title: 'Changing Data: INSERT, UPDATE, DELETE',
    minutes: 13,
    uses: ['sql-1'],
    steps: [
      {
        kind: 'concept',
        title: 'Add, change, remove',
        eli5: 'A table is a **class register**. `INSERT` writes a new kid at the bottom. `UPDATE` rubs out a mark and writes a new one. `DELETE` crosses a kid off. `WHERE` is **pointing at which kid** you mean.',
        body: `
\`SELECT\` only *reads*. Three more commands *change* the data:

\`\`\`
-- add a new row
INSERT INTO heroes (id, name, class, level, guild_id)
VALUES (9, 'Katherine', 'mage', 3, 1);

-- change rows that match WHERE
UPDATE heroes SET level = level + 1 WHERE id = 6;

-- remove rows that match WHERE
DELETE FROM heroes WHERE id = 7;
\`\`\`
## The scary part
\`UPDATE\` and \`DELETE\` change **every row that matches WHERE**. No WHERE? Then *every row matches*. There is no undo button.

> Pro habit: write the \`SELECT ... WHERE ...\` first. Check it shows exactly the rows you want. *Then* swap \`SELECT *\` for \`UPDATE\` or \`DELETE\`.
`,
      },
      {
        kind: 'visual',
        title: 'Watch the table change',
        code: `INSERT INTO heroes VALUES (9, 'Katherine', 'mage', 3, 1);
UPDATE heroes SET level = 6 WHERE id = 6;
DELETE FROM heroes WHERE id = 7;
UPDATE heroes SET level = 1;`,
        frames: [
          {
            caption: 'Start: a few rows in `heroes` (we show 4 to keep it small).',
            lanes: [
              { title: 'heroes', items: ['5 Margaret · lvl 17', '6 Dennis · lvl 5', '7 Barbara · lvl 11', '8 Ken · lvl 8'] },
              { title: 'Rows changed', items: [] },
            ],
          },
          {
            line: 1,
            caption: '`INSERT` adds one brand-new row at the end. Nothing else is touched.',
            lanes: [
              {
                title: 'heroes',
                items: ['5 Margaret · lvl 17', '6 Dennis · lvl 5', '7 Barbara · lvl 11', '8 Ken · lvl 8', '9 Katherine · lvl 3'],
                highlight: [4],
              },
              { title: 'Rows changed', items: ['1 inserted'], highlight: [0] },
            ],
          },
          {
            line: 2,
            caption: '`UPDATE ... WHERE id = 6` finds only Dennis and changes his level.',
            lanes: [
              {
                title: 'heroes',
                items: ['5 Margaret · lvl 17', '6 Dennis · lvl 6', '7 Barbara · lvl 11', '8 Ken · lvl 8', '9 Katherine · lvl 3'],
                highlight: [1],
              },
              { title: 'Rows changed', items: ['1 updated'], highlight: [0] },
            ],
          },
          {
            line: 3,
            caption: '`DELETE ... WHERE id = 7` removes Barbara. Gone for good.',
            lanes: [
              { title: 'heroes', items: ['5 Margaret · lvl 17', '6 Dennis · lvl 6', '8 Ken · lvl 8', '9 Katherine · lvl 3'] },
              { title: 'Rows changed', items: ['1 deleted'], highlight: [0] },
            ],
          },
          {
            line: 4,
            caption: '😱 `UPDATE` with **no WHERE**. Every row matches, so every hero is now level 1. Years of grinding, erased.',
            lanes: [
              { title: 'heroes', items: ['5 Margaret · lvl 1', '6 Dennis · lvl 1', '8 Ken · lvl 1', '9 Katherine · lvl 1'], highlight: [0, 1, 2, 3] },
              { title: 'Rows changed', items: ['4 updated (ALL of them!)'], highlight: [0] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'You meant to retire one hero. What does this do?',
        code: `DELETE FROM heroes;`,
        options: [
          'Deletes nothing, because there is no WHERE',
          'Deletes the last row',
          'Deletes every row in heroes',
          'Deletes the whole table, columns and all',
        ],
        answer: 2,
        explain:
          'No WHERE means every row matches, so every row is deleted. The table itself stays (empty). Removing the table is a different command: `DROP TABLE`.',
      },
      {
        kind: 'code',
        lang: 'sql',
        title: 'Guided: recruit and promote',
        instructions: `
${HEROES_NOTE}
Two jobs. The first is done for you:
1. ✔ Katherine joins: id 9, a level 3 \`mage\` in guild 1.
2. Dennis (id 6) levels up to **6**. Write an \`UPDATE\` that changes **only Dennis**.

When you run, we show the whole \`heroes\` table afterwards.
`,
        setup: GUILD_DB,
        starter: `-- 1. Katherine joins
INSERT INTO heroes (id, name, class, level, guild_id)
VALUES (9, 'Katherine', 'mage', 3, 1);

-- 2. Dennis (id 6) levels up to 6. Don't forget WHERE!
`,
        tests: 'SELECT * FROM heroes ORDER BY id;',
        hint: 'UPDATE heroes SET level = 6 WHERE id = 6;',
        solution: `-- 1. Katherine joins
INSERT INTO heroes (id, name, class, level, guild_id)
VALUES (9, 'Katherine', 'mage', 3, 1);

-- 2. Dennis (id 6) levels up to 6. Don't forget WHERE!
UPDATE heroes SET level = 6 WHERE id = 6;
`,
      },
      {
        kind: 'code',
        lang: 'sql',
        title: 'Your turn: guild housekeeping',
        instructions: `
${HEROES_NOTE}
Write three statements:
1. **INSERT** a new hero: id 9, name \`'Hedy'\`, class \`'rogue'\`, level 4, guild 2.
2. **UPDATE**: every \`rogue\` gains 2 levels (\`level = level + 2\`). That includes Hedy.
3. **DELETE** heroes with **no guild** (\`guild_id IS NULL\`) **and** level under 12.

Tip: run \`SELECT * FROM heroes WHERE ...\` first to check each WHERE.
`,
        setup: GUILD_DB,
        starter: `-- 1. INSERT Hedy

-- 2. UPDATE the rogues

-- 3. DELETE guildless heroes under level 12
`,
        tests: 'SELECT * FROM heroes ORDER BY id;',
        hint: "INSERT INTO heroes VALUES (9, 'Hedy', 'rogue', 4, 2); · UPDATE heroes SET level = level + 2 WHERE class = 'rogue'; · DELETE FROM heroes WHERE guild_id IS NULL AND level < 12;",
        solution: `-- 1. INSERT Hedy
INSERT INTO heroes (id, name, class, level, guild_id)
VALUES (9, 'Hedy', 'rogue', 4, 2);

-- 2. UPDATE the rogues
UPDATE heroes SET level = level + 2 WHERE class = 'rogue';

-- 3. DELETE guildless heroes under level 12
DELETE FROM heroes WHERE guild_id IS NULL AND level < 12;
`,
      },
      {
        kind: 'quiz',
        prompt: 'In the last challenge, the rogue Alan (level 12, no guild) was **not** deleted. Why?',
        options: [
          'DELETE skips rogues',
          'The UPDATE ran first, so he was level 14 when DELETE checked him',
          'NULL guilds can never be deleted',
          'DELETE only removes one row at a time',
        ],
        answer: 1,
        explain:
          'Statements run in order. Alan was 12, the UPDATE made him 14, and `14 < 12` is false. Order matters when one statement changes what the next one sees.',
      },
    ],
  },
  {
    id: 'sql-w2',
    title: 'Transactions: All or Nothing',
    minutes: 13,
    uses: ['sql-w1', 'sql-2'],
    steps: [
      {
        kind: 'concept',
        title: 'The bank transfer problem',
        eli5: 'A transaction is a **"save point" in a video game**. You try a tricky section. If it goes wrong, you reload the save and it is like it never happened. If it goes right, you save for real.',
        body: `
Ada sends Linus 50 gold. That is **two** updates:
1. take 50 from Ada
2. give 50 to Linus

What if the power dies between step 1 and step 2? Ada lost 50 gold and Linus got nothing. The gold just vanished.

A **transaction** glues several statements into one unit:

\`\`\`
BEGIN;                                              -- start the save point
UPDATE heroes SET gold = gold - 50 WHERE id = 1;    -- Ada pays
UPDATE heroes SET gold = gold + 50 WHERE id = 2;    -- Linus gets paid
COMMIT;                                             -- make it permanent
\`\`\`
Something wrong? \`ROLLBACK;\` instead of \`COMMIT;\` throws away **everything** since \`BEGIN\`.

## ACID, stupid simple
- **Atomic**: all of it happens, or none of it.
- **Consistent**: rules (like "gold can't go below 0") are never broken.
- **Isolated**: other people don't see your half-done work.
- **Durable**: after COMMIT, it survives a crash.
`,
      },
      {
        kind: 'visual',
        title: 'Step 2 fails, ROLLBACK saves the day',
        code: `BEGIN;
UPDATE heroes SET gold = gold - 50 WHERE id = 1;
UPDATE heroes SET gold = gold + 50 WHERE id = 99;  -- typo! no hero 99
ROLLBACK;`,
        frames: [
          {
            caption: 'Before: Ada has 250 gold, Linus has 100. Total gold in the world: 350.',
            lanes: [
              { title: 'Saved data', items: ['Ada 250', 'Linus 100'] },
              { title: 'Pending changes', items: [] },
            ],
          },
          {
            line: 1,
            caption: '`BEGIN` opens a transaction. From now on, changes are *pending*, not saved.',
            lanes: [
              { title: 'Saved data', items: ['Ada 250', 'Linus 100'] },
              { title: 'Pending changes', items: ['(transaction open)'], highlight: [0] },
            ],
          },
          {
            line: 2,
            caption: 'Step 1: Ada pays 50. Inside the transaction she now has 200.',
            lanes: [
              { title: 'Saved data', items: ['Ada 250', 'Linus 100'] },
              { title: 'Pending changes', items: ['(transaction open)', 'Ada 250 → 200'], highlight: [1] },
            ],
          },
          {
            line: 3,
            caption: 'Step 2 has a typo: hero 99 does not exist. Nobody received the gold. If we stopped here, 50 gold would vanish.',
            lanes: [
              { title: 'Saved data', items: ['Ada 250', 'Linus 100'] },
              { title: 'Pending changes', items: ['(transaction open)', 'Ada 250 → 200', '✘ 0 rows updated'], highlight: [2] },
            ],
          },
          {
            line: 4,
            caption: '`ROLLBACK` throws away every pending change. Ada is back to 250. Like it never happened.',
            lanes: [
              { title: 'Saved data', items: ['Ada 250', 'Linus 100'], highlight: [0, 1] },
              { title: 'Pending changes', items: ['(all thrown away)'] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'You ran `BEGIN;` then `DELETE FROM heroes;` (oops, no WHERE). You have **not** committed. What do you type?',
        options: ['COMMIT;', 'ROLLBACK;', 'UNDO;', 'Nothing, deletes are always safe'],
        answer: 1,
        explain: '`ROLLBACK;` throws away everything since `BEGIN`. `COMMIT;` would make the mistake permanent. SQL has no `UNDO`.',
      },
      {
        kind: 'code',
        lang: 'sql',
        title: 'Guided: a safe transfer',
        instructions: `
\`heroes\` now has a \`gold\` column. Ada (id 1) has 250, everyone else has 100.

Ada pays **Linus (id 2)** 50 gold. Step 1 and the transaction are written. Add **step 2**: give Linus his 50.

We show \`id, name, gold\` for every hero afterwards.
`,
        setup: GOLD_DB,
        starter: `BEGIN;
-- step 1: Ada pays 50
UPDATE heroes SET gold = gold - 50 WHERE id = 1;
-- step 2: Linus gets 50

COMMIT;
`,
        tests: 'SELECT id, name, gold FROM heroes ORDER BY id;',
        hint: 'UPDATE heroes SET gold = gold + 50 WHERE id = 2;',
        solution: `BEGIN;
-- step 1: Ada pays 50
UPDATE heroes SET gold = gold - 50 WHERE id = 1;
-- step 2: Linus gets 50
UPDATE heroes SET gold = gold + 50 WHERE id = 2;
COMMIT;
`,
      },
      {
        kind: 'code',
        lang: 'sql',
        title: 'Your turn: undo the disaster, then do it right',
        instructions: `
Someone opened a transaction to take 30 gold from **Dennis (id 6)**, but forgot the WHERE. Everyone's gold is about to become 0!

Keep their two lines. Then:
1. **Cancel** their transaction so nothing changes.
2. In a **new** transaction: Dennis pays **30** gold to **Grace (id 3)**, and commit it.

At the end Dennis should have 70, Grace 130, and everyone else untouched.
`,
        setup: GOLD_DB,
        starter: `BEGIN;
UPDATE heroes SET gold = 0;   -- oops! no WHERE

-- 1. cancel it

-- 2. new transaction: Dennis (6) pays 30 gold to Grace (3)
`,
        tests: 'SELECT id, name, gold FROM heroes ORDER BY id;',
        hint: 'ROLLBACK; · then BEGIN; two UPDATEs (gold - 30 WHERE id = 6, gold + 30 WHERE id = 3); COMMIT;',
        solution: `BEGIN;
UPDATE heroes SET gold = 0;   -- oops! no WHERE

-- 1. cancel it
ROLLBACK;

-- 2. new transaction: Dennis (6) pays 30 gold to Grace (3)
BEGIN;
UPDATE heroes SET gold = gold - 30 WHERE id = 6;
UPDATE heroes SET gold = gold + 30 WHERE id = 3;
COMMIT;
`,
      },
      {
        kind: 'explain',
        prompt: 'Explain to a friend why a bank transfer needs a transaction. What could go wrong without one?',
        keyPoints: [
          'A transfer is two changes: take money from one account, add it to the other',
          'If it stops halfway (crash, error), money disappears or appears from nowhere',
          'BEGIN ... COMMIT makes both happen or neither (atomic)',
          'ROLLBACK throws away everything since BEGIN',
        ],
      },
    ],
  },
]

/** sqlite3 from Python. Opens the migrations realm. */
export const pythonSql: Lesson[] = [
  {
    id: 'py-sql',
    title: 'Python Talks to the Database (sqlite3)',
    minutes: 14,
    uses: ['py-1', 'py-2', 'sql-1', 'sql-w1'],
    steps: [
      {
        kind: 'concept',
        title: 'SQL, sent from Python',
        eli5: 'Your Python program is a **customer at a counter**. The `sqlite3` module is the **waiter**: you hand it an order written in SQL, it walks to the kitchen (the database), and brings back a tray of rows.',
        body: `
Real apps don't type SQL by hand. Code sends it. Python ships with \`sqlite3\` built in:

\`\`\`
import sqlite3

conn = sqlite3.connect(":memory:")   # open a database (":memory:" = a fresh one in RAM)
conn.execute("CREATE TABLE heroes (name TEXT, level INTEGER)")
conn.execute("INSERT INTO heroes VALUES (?, ?)", ("Ada", 14))
conn.commit()                        # save the changes (like COMMIT)

rows = conn.execute("SELECT name, level FROM heroes").fetchall()
print(rows)                          # [('Ada', 14)]  a list of tuples
\`\`\`
- \`connect\` opens the database and gives you a **connection**.
- \`execute\` sends one SQL statement.
- \`fetchall()\` brings back every row as a **list of tuples**. \`fetchone()\` brings one.
- \`commit()\` saves your changes. Forget it and they can be lost.

## The \`?\` rule
Never glue values into SQL with f-strings. Put a \`?\` where each value goes and pass the values separately as a tuple. The driver handles quotes for you, so \`O'Brien\` and sneaky input can't break your SQL. That's how you stop **SQL injection**.
`,
      },
      {
        kind: 'visual',
        title: 'A round trip to the database',
        code: `rows = conn.execute(
    "SELECT name, level FROM heroes WHERE level > ?",
    (10,)
).fetchall()
print(rows)`,
        frames: [
          {
            line: 1,
            caption: 'Python calls `conn.execute` with SQL text and a tuple of values.',
            lanes: [
              { title: 'Python', items: ['execute(sql, (10,))'], highlight: [0] },
              { title: 'Driver (sqlite3)', items: [] },
              { title: 'Database', items: ["('Ada', 14)", "('Linus', 9)", "('Grace', 21)"] },
            ],
          },
          {
            line: 2,
            caption: 'The driver sends the SQL with a **hole** (`?`) and the value 10 **separately**. The value is never mixed into the SQL text.',
            lanes: [
              { title: 'Python', items: ['execute(sql, (10,))'] },
              { title: 'Driver (sqlite3)', items: ['SQL: ... level > ?', 'value: 10'], highlight: [0, 1] },
              { title: 'Database', items: ["('Ada', 14)", "('Linus', 9)", "('Grace', 21)"] },
            ],
          },
          {
            line: 2,
            caption: 'The database runs the query and picks the matching rows.',
            lanes: [
              { title: 'Python', items: ['execute(sql, (10,))'] },
              { title: 'Driver (sqlite3)', items: ['SQL: ... level > ?', 'value: 10'] },
              { title: 'Database', items: ["('Ada', 14) ✔", "('Linus', 9)", "('Grace', 21) ✔"], highlight: [0, 2] },
            ],
          },
          {
            line: 4,
            caption: '`fetchall()` carries the rows back to Python as a **list of tuples**.',
            lanes: [
              { title: 'Python', items: ["rows = [('Ada', 14), ('Grace', 21)]"], highlight: [0] },
              { title: 'Driver (sqlite3)', items: ['← 2 rows'], highlight: [0] },
              { title: 'Database', items: ["('Ada', 14)", "('Linus', 9)", "('Grace', 21)"] },
            ],
          },
          {
            line: 5,
            caption: "Now it is plain Python data. Loop over it, index it, print it: `rows[0][0]` is `'Ada'`.",
            lanes: [
              { title: 'Python', items: ["rows = [('Ada', 14), ('Grace', 21)]", "printed: [('Ada', 14), ('Grace', 21)]"], highlight: [1] },
              { title: 'Driver (sqlite3)', items: [] },
              { title: 'Database', items: ["('Ada', 14)", "('Linus', 9)", "('Grace', 21)"] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: '`name` comes from a web form. Which line is **safe**?',
        options: [
          `conn.execute(f"SELECT * FROM heroes WHERE name = '{name}'")`,
          `conn.execute("SELECT * FROM heroes WHERE name = ?", (name,))`,
          `conn.execute("SELECT * FROM heroes WHERE name = '" + name + "'")`,
          `conn.execute("SELECT * FROM heroes WHERE name = '%s'" % name)`,
        ],
        answer: 1,
        explain:
          "Only the `?` version keeps the value separate from the SQL. The other three paste the text straight in, so a name like `' OR 1=1 --` rewrites your query. That's SQL injection.",
      },
      {
        kind: 'quiz',
        prompt: 'What does this print?',
        code: `rows = conn.execute("SELECT name, level FROM heroes ORDER BY level").fetchall()
# the table has ('Ada', 14) and ('Linus', 9)
print(rows[0][1])`,
        options: ["'Ada'", '14', "'Linus'", '9'],
        answer: 3,
        explain: "Sorted by level, Linus (9) comes first, so `rows[0]` is `('Linus', 9)`. Index `[1]` is the second item of that tuple: `9`.",
      },
      {
        kind: 'code',
        lang: 'python',
        title: 'Guided: create, insert, select',
        instructions: `
\`make_db()\` creates a \`quests\` table and inserts one quest.

1. Add a **second** quest: \`"Write the Docs"\`, reward \`50\`. Copy the first INSERT line and change the values.
2. Finish \`all_quests(conn)\`: run \`SELECT id, title, reward FROM quests ORDER BY id\` and return \`.fetchall()\`.

(The first run downloads Python, give it a few seconds.)
`,
        starter: `import sqlite3


def make_db():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE quests (id INTEGER PRIMARY KEY, title TEXT, reward INTEGER)")
    conn.execute("INSERT INTO quests (title, reward) VALUES (?, ?)", ("Slay the Bug Dragon", 500))
    # 1. insert "Write the Docs" with reward 50 (copy the line above)

    conn.commit()
    return conn


def all_quests(conn):
    # 2. SELECT id, title, reward FROM quests ORDER BY id  -> return .fetchall()
    return []


print(all_quests(make_db()))
`,
        tests: `# test: make_db adds two quests
c = make_db()
count = c.execute("SELECT COUNT(*) FROM quests").fetchone()[0]
assert count == 2, f"expected 2 quests, found {count}"
# test: all_quests returns tuples in id order
c = make_db()
rows = all_quests(c)
assert rows == [(1, "Slay the Bug Dragon", 500), (2, "Write the Docs", 50)], f"got {rows!r}"`,
        hint: 'conn.execute("INSERT INTO quests (title, reward) VALUES (?, ?)", ("Write the Docs", 50)) · return conn.execute("SELECT id, title, reward FROM quests ORDER BY id").fetchall()',
        solution: `import sqlite3


def make_db():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE quests (id INTEGER PRIMARY KEY, title TEXT, reward INTEGER)")
    conn.execute("INSERT INTO quests (title, reward) VALUES (?, ?)", ("Slay the Bug Dragon", 500))
    # 1. insert "Write the Docs" with reward 50 (copy the line above)
    conn.execute("INSERT INTO quests (title, reward) VALUES (?, ?)", ("Write the Docs", 50))
    conn.commit()
    return conn


def all_quests(conn):
    # 2. SELECT id, title, reward FROM quests ORDER BY id  -> return .fetchall()
    return conn.execute("SELECT id, title, reward FROM quests ORDER BY id").fetchall()


print(all_quests(make_db()))
`,
      },
      {
        kind: 'code',
        lang: 'python',
        title: "Your turn: survive O'Brien",
        instructions: `
\`add_hero\` uses an f-string. It works for \`"Ada"\`, but a hero named \`"O'Brien"\` breaks it (that \`'\` ends the SQL string early). A hacker could do worse.

1. Fix \`add_hero(conn, name, level)\` to use \`?\` placeholders, then \`commit()\`.
2. Write \`heroes_above(conn, level)\`: return a **list of names** (just strings) of heroes with level **greater than** \`level\`, highest level first. Use \`?\` here too.

\`heroes_above(conn, 5)\` → \`["Ada", "O'Brien"]\`
`,
        starter: `import sqlite3


def setup(conn):
    conn.execute("CREATE TABLE heroes (name TEXT, level INTEGER)")


def add_hero(conn, name, level):
    conn.execute(f"INSERT INTO heroes VALUES ('{name}', {level})")
    conn.commit()


def heroes_above(conn, level):
    pass


conn = sqlite3.connect(":memory:")
setup(conn)
add_hero(conn, "Ada", 14)
print(conn.execute("SELECT * FROM heroes").fetchall())
`,
        tests: `# test: add_hero stores a hero
c = sqlite3.connect(":memory:")
setup(c)
add_hero(c, "Ada", 14)
assert c.execute("SELECT name, level FROM heroes").fetchall() == [("Ada", 14)]
# test: a name with a quote works
c = sqlite3.connect(":memory:")
setup(c)
add_hero(c, "O'Brien", 9)
assert c.execute("SELECT name FROM heroes").fetchall() == [("O'Brien",)]
# test: heroes_above returns names, highest first
c = sqlite3.connect(":memory:")
setup(c)
add_hero(c, "Linus", 3)
add_hero(c, "O'Brien", 9)
add_hero(c, "Ada", 14)
got = heroes_above(c, 5)
assert got == ["Ada", "O'Brien"], f"got {got!r}"
assert heroes_above(c, 20) == []
# test: sneaky input is stored as plain text
c = sqlite3.connect(":memory:")
setup(c)
evil = "x', 1); DROP TABLE heroes; --"
add_hero(c, evil, 1)
assert c.execute("SELECT name FROM heroes").fetchall() == [(evil,)]`,
        hint: 'conn.execute("INSERT INTO heroes VALUES (?, ?)", (name, level)) · rows = conn.execute("SELECT name FROM heroes WHERE level > ? ORDER BY level DESC", (level,)).fetchall() · return [row[0] for row in rows]',
        solution: `import sqlite3


def setup(conn):
    conn.execute("CREATE TABLE heroes (name TEXT, level INTEGER)")


def add_hero(conn, name, level):
    conn.execute("INSERT INTO heroes VALUES (?, ?)", (name, level))
    conn.commit()


def heroes_above(conn, level):
    rows = conn.execute(
        "SELECT name FROM heroes WHERE level > ? ORDER BY level DESC", (level,)
    ).fetchall()
    return [row[0] for row in rows]


conn = sqlite3.connect(":memory:")
setup(conn)
add_hero(conn, "Ada", 14)
print(conn.execute("SELECT * FROM heroes").fetchall())
`,
      },
    ],
  },
]

/** Writing your own tests. Joins the debugging realm. */
export const testing: Lesson[] = [
  {
    id: 'test-1',
    title: 'Write Your Own Tests',
    minutes: 15,
    uses: ['js-b7', 'js-2', 'debug-1'],
    steps: [
      {
        kind: 'concept',
        title: 'A robot that re-checks your work',
        eli5: 'A test is a **robot that checks your homework**. You teach it once: "2 + 2 should be 4". From then on, every time you change anything, it re-checks *everything* in a second, and shouts if something broke.',
        body: `
Every challenge in this app already has tests. Now you write them.

A test is just code that **calls your function and checks the answer**. Every test has three parts:

\`\`\`
test('slugify lowercases', () => {
  const input = 'Hello World'          // Arrange: set up the input
  const result = slugify(input)        // Act: call the thing
  expect(result).toBe('hello-world')   // Assert: check the answer
})
\`\`\`
## Edge cases
Bugs hide at the edges. Always test:
- the normal case
- empty things (\`''\`, \`[]\`, \`0\`)
- the exact boundaries (if the limit is 10, test 9, 10 and 11)
- weird input (extra spaces, capitals, negatives)

## The test runner
A **test runner** (Jest, Vitest, pytest) finds all your tests, runs each one, and prints ✔ or ✘. A test **fails** when its check **throws an error**.

> A good test suite fails when the code is wrong. If your tests pass on buggy code, they're not testing much.
`,
      },
      {
        kind: 'visual',
        title: 'The test runner at work',
        code: `function slugify(s) {
  return s.toLowerCase().replace(/ /g, '-')   // bug: no trim!
}
test('basic', ...)          // 'hello world'
test('capitals', ...)       // 'Hello World'
test('extra spaces', ...)   // '  hi  '`,
        frames: [
          {
            caption: 'The runner collects all the tests first. Nothing has run yet.',
            lanes: [
              { title: 'Tests', items: ['basic', 'capitals', 'extra spaces'] },
              { title: 'Result', items: [] },
            ],
          },
          {
            line: 4,
            caption: "Test 1: `slugify('hello world')` gives `'hello-world'`. Matches. ✔",
            lanes: [
              { title: 'Tests', items: ['✔ basic', 'capitals', 'extra spaces'], highlight: [0] },
              { title: 'Result', items: ['1 passed'] },
            ],
          },
          {
            line: 5,
            caption: 'Test 2: capitals become lowercase. ✔',
            lanes: [
              { title: 'Tests', items: ['✔ basic', '✔ capitals', 'extra spaces'], highlight: [1] },
              { title: 'Result', items: ['2 passed'] },
            ],
          },
          {
            line: 6,
            caption: "Test 3, the edge case: `'  hi  '` should give `'hi'`, but we got `'--hi--'`. The check throws, so the test fails. ✘",
            lanes: [
              { title: 'Tests', items: ['✔ basic', '✔ capitals', '✘ extra spaces'], highlight: [2] },
              { title: 'Result', items: ['2 passed, 1 failed', "expected 'hi', got '--hi--'"], highlight: [1] },
            ],
          },
          {
            line: 2,
            caption: 'The failure points straight at the bug: we forgot `trim()`. Without the edge-case test, this would have shipped.',
            lanes: [
              { title: 'Tests', items: ['✔ basic', '✔ capitals', '✘ extra spaces'] },
              { title: 'Result', items: ['fix: add .trim()'], highlight: [0] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'You test `clamp(n, 0, 10)` (keep n between 0 and 10) with only `clamp(5, 0, 10) === 5`. What is the problem?',
        options: [
          'Nothing, one passing test proves it works',
          'It never checks a value below 0, above 10, or exactly on 0 or 10',
          'Tests should never use numbers',
          'It should test clamp(5, 0, 10) a few more times',
        ],
        answer: 1,
        explain: 'A function that just returns `n` would pass that test too. The interesting cases are the edges: below, above, and exactly on the limits.',
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Guided: catch every bug',
        instructions: `
\`slugify(text)\` turns a title into a URL slug: **trim** the ends, **lowercase**, and turn any run of spaces into **one** dash.
\`'  Big   Cat '\` → \`'big-cat'\`

Finish \`checkSlugify(slugify)\`. It gets a slugify function and uses \`assertEqual\` to check it.

Here's the twist: we will run your checks against **one correct** slugify and **three buggy** ones. Your checks must pass for the correct one and **throw** for every buggy one:
- bug 1 forgets to lowercase (your capitals check already catches it ✔)
- bug 2 forgets to trim
- bug 3 turns 3 spaces into 3 dashes

Add the two missing checks.
`,
        starter: `function assertEqual(actual, expected) {
  if (actual !== expected) throw new Error('Expected "' + expected + '" but got "' + actual + '"')
}

function checkSlugify(slugify) {
  assertEqual(slugify('hello world'), 'hello-world')  // normal case
  assertEqual(slugify('Hello World'), 'hello-world')  // capitals (catches bug 1)
  // TODO: spaces at the start and end, e.g. '  hi there  '

  // TODO: several spaces in the middle, e.g. 'big   cat'

}
`,
        tests: `function __goodSlug(s) { return s.trim().toLowerCase().replace(/ +/g, '-') }
function __noLower(s) { return s.trim().replace(/ +/g, '-') }
function __noTrim(s) { return s.toLowerCase().replace(/ +/g, '-') }
function __noCollapse(s) { return s.trim().toLowerCase().replace(/ /g, '-') }
test('your checks pass on the correct slugify', () => checkSlugify(__goodSlug))
test('catches bug 1: forgets to lowercase', () => expect(() => checkSlugify(__noLower)).toThrow())
test('catches bug 2: forgets to trim', () => expect(() => checkSlugify(__noTrim)).toThrow())
test('catches bug 3: one dash per space', () => expect(() => checkSlugify(__noCollapse)).toThrow())`,
        hint: "assertEqual(slugify('  hi there  '), 'hi-there') · assertEqual(slugify('big   cat'), 'big-cat')",
        solution: `function assertEqual(actual, expected) {
  if (actual !== expected) throw new Error('Expected "' + expected + '" but got "' + actual + '"')
}

function checkSlugify(slugify) {
  assertEqual(slugify('hello world'), 'hello-world')  // normal case
  assertEqual(slugify('Hello World'), 'hello-world')  // capitals (catches bug 1)
  // TODO: spaces at the start and end, e.g. '  hi there  '
  assertEqual(slugify('  hi there  '), 'hi-there')
  // TODO: several spaces in the middle, e.g. 'big   cat'
  assertEqual(slugify('big   cat'), 'big-cat')
}
`,
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your turn: test clamp',
        instructions: `
\`clamp(n, min, max)\` keeps \`n\` inside a range:
- below \`min\` → \`min\`
- above \`max\` → \`max\`
- otherwise → \`n\` (including when \`n\` is exactly \`min\` or \`max\`)

\`clamp(15, 0, 10)\` → \`10\` · \`clamp(-3, 0, 10)\` → \`0\` · \`clamp(4, 0, 10)\` → \`4\`

Write \`checkClamp(clamp)\` from scratch. We'll run it on a correct clamp and **four** buggy ones. One bug only shows up **exactly on the edge**. Think about every case before you write.
`,
        starter: `function assertEqual(actual, expected) {
  if (actual !== expected) throw new Error('Expected ' + expected + ' but got ' + actual)
}

function checkClamp(clamp) {
  // list the cases first: normal, below, above, exactly on each edge...

}
`,
        tests: `function __goodClamp(n, min, max) { return Math.min(Math.max(n, min), max) }
function __noMin(n, min, max) { return n > max ? max : n }
function __noMax(n, min, max) { return n < min ? min : n }
function __swapped(n, min, max) { return n < min ? max : n > max ? min : n }
function __edge(n, min, max) { return n < min ? min : n >= max ? max - 1 : n }
test('your checks pass on the correct clamp', () => checkClamp(__goodClamp))
test('catches: ignores min', () => expect(() => checkClamp(__noMin)).toThrow())
test('catches: ignores max', () => expect(() => checkClamp(__noMax)).toThrow())
test('catches: min and max mixed up', () => expect(() => checkClamp(__swapped)).toThrow())
test('catches: wrong answer exactly at max', () => expect(() => checkClamp(__edge)).toThrow())`,
        hint: 'Five checks do it: a normal value (4), below (-3 → 0), above (15 → 10), exactly min (0 → 0), exactly max (10 → 10).',
        solution: `function assertEqual(actual, expected) {
  if (actual !== expected) throw new Error('Expected ' + expected + ' but got ' + actual)
}

function checkClamp(clamp) {
  assertEqual(clamp(4, 0, 10), 4)    // normal
  assertEqual(clamp(-3, 0, 10), 0)   // below
  assertEqual(clamp(15, 0, 10), 10)  // above
  assertEqual(clamp(0, 0, 10), 0)    // exactly min
  assertEqual(clamp(10, 0, 10), 10)  // exactly max
}
`,
      },
    ],
  },
  {
    id: 'test-2',
    title: 'Test-Driven Development: Red, Green, Refactor',
    minutes: 12,
    uses: ['test-1', 'js-2'],
    steps: [
      {
        kind: 'concept',
        title: 'Write the test first',
        eli5: 'Before baking, you write down **"the cake should be chocolate, 3 layers, not burnt"**. Then you bake until it matches. You always know when you are done.',
        body: `
**Test-Driven Development (TDD)** flips the order: test first, code second. It's a loop of three tiny steps:

1. **Red**: write a test for the next small thing. Run it. It fails (red), because the code doesn't exist yet.
2. **Green**: write the *simplest* code that makes it pass. Ugly is fine.
3. **Refactor**: clean up the code. The tests stay green, so you know you didn't break anything.

Then repeat with the next small thing.

## Why bother?
- You think about **what** the function should do before **how**.
- You can never forget to write tests.
- Refactoring stops being scary.

> You've been doing half of TDD all along: every challenge here starts with failing tests, and you make them green.
`,
      },
      {
        kind: 'visual',
        title: 'Around the loop',
        code: `test('1 → "1"', ...)
test('3 → "Fizz"', ...)
function fizz(n) {
  if (n % 3 === 0) return 'Fizz'
  return String(n)
}`,
        frames: [
          {
            line: 1,
            caption: '**Red.** Write a test: `fizz(1)` should be `"1"`. There is no `fizz` yet, so it fails.',
            lanes: [
              { title: 'Phase', layout: 'row', items: ['RED', 'GREEN', 'REFACTOR'], highlight: [0] },
              { title: 'Tests', items: ['✘ 1 → "1"'] },
            ],
          },
          {
            line: 5,
            caption: '**Green.** Simplest code that passes: `return String(n)`. Silly, but green.',
            lanes: [
              { title: 'Phase', layout: 'row', items: ['RED', 'GREEN', 'REFACTOR'], highlight: [1] },
              { title: 'Tests', items: ['✔ 1 → "1"'] },
            ],
          },
          {
            line: 2,
            caption: '**Red again.** Next small thing: `fizz(3)` should be `"Fizz"`. It fails.',
            lanes: [
              { title: 'Phase', layout: 'row', items: ['RED', 'GREEN', 'REFACTOR'], highlight: [0] },
              { title: 'Tests', items: ['✔ 1 → "1"', '✘ 3 → "Fizz"'], highlight: [1] },
            ],
          },
          {
            line: 4,
            caption: '**Green.** Add the `if`. Both tests pass.',
            lanes: [
              { title: 'Phase', layout: 'row', items: ['RED', 'GREEN', 'REFACTOR'], highlight: [1] },
              { title: 'Tests', items: ['✔ 1 → "1"', '✔ 3 → "Fizz"'] },
            ],
          },
          {
            line: 3,
            caption: '**Refactor.** Rename things, tidy up. Run the tests: still green, so nothing broke. Then back to red for the next feature.',
            lanes: [
              { title: 'Phase', layout: 'row', items: ['RED', 'GREEN', 'REFACTOR'], highlight: [2] },
              { title: 'Tests', items: ['✔ 1 → "1"', '✔ 3 → "Fizz"'], highlight: [0, 1] },
            ],
          },
        ],
      },
      {
        kind: 'quiz',
        prompt: 'In TDD, you just wrote a new test and ran it. It **passed** straight away. What does that tell you?',
        options: [
          'Great, move on',
          "Something's off: either the feature already exists, or the test isn't really checking anything",
          'The code is perfect',
          'You should delete the test',
        ],
        answer: 1,
        explain:
          'A new test should fail first. Seeing red proves the test can actually catch the missing behavior. A test that has never failed might be testing nothing.',
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Guided: the tests are red, make them green',
        instructions: `
The tests are already written (that's the "red" step). Read them, then write \`passwordStrength(pw)\` to make them green:

\`\`\`
passwordStrength('cat')               → 'weak'    (under 8 characters)
passwordStrength('longpassword')      → 'ok'      (8+ characters)
passwordStrength('longpassword7')     → 'strong'  (12+ characters AND has a digit)
passwordStrength('short7')            → 'weak'    (a digit doesn't save a short one)
passwordStrength('abcdefgh1')         → 'ok'      (has a digit, but under 12)
\`\`\`
Make one test pass at a time. Tip: \`/[0-9]/.test(pw)\` is true if \`pw\` has a digit.
`,
        starter: `function passwordStrength(pw) {
  // 1. under 8 characters → 'weak'
  // 2. 12+ characters and has a digit → 'strong'
  // 3. otherwise → 'ok'
  return 'weak'
}
`,
        tests: `test("'cat' is weak", () => expect(passwordStrength('cat')).toBe('weak'))
test("'longpassword' is ok", () => expect(passwordStrength('longpassword')).toBe('ok'))
test("'longpassword7' is strong", () => expect(passwordStrength('longpassword7')).toBe('strong'))
test("'short7' is weak", () => expect(passwordStrength('short7')).toBe('weak'))
test("'abcdefgh1' is ok", () => expect(passwordStrength('abcdefgh1')).toBe('ok'))`,
        hint: "if (pw.length < 8) return 'weak' · if (pw.length >= 12 && /[0-9]/.test(pw)) return 'strong' · return 'ok'",
        solution: `function passwordStrength(pw) {
  // 1. under 8 characters → 'weak'
  if (pw.length < 8) return 'weak'
  // 2. 12+ characters and has a digit → 'strong'
  if (pw.length >= 12 && /[0-9]/.test(pw)) return 'strong'
  // 3. otherwise → 'ok'
  return 'ok'
}
`,
      },
      {
        kind: 'code',
        lang: 'javascript',
        title: 'Your turn: test first, then code',
        instructions: `
The spec for leap years:
- divisible by 4 → leap year (2024 ✔)
- **except** divisible by 100 → not a leap year (1900 ✘)
- **except** divisible by 400 → leap year after all (2000 ✔)
- anything else → not (2023 ✘)

**Red first:** write \`checkLeapYear(isLeapYear)\` with \`assertEqual\`. We'll run it against a correct version and buggy ones that forget a rule, so cover every line of the spec.

**Then green:** write \`isLeapYear(year)\` so your own checks pass.
`,
        starter: `function assertEqual(actual, expected) {
  if (actual !== expected) throw new Error('Expected ' + expected + ' but got ' + actual)
}

// RED: one check per rule in the spec
function checkLeapYear(isLeapYear) {

}

// GREEN: make your checks pass
function isLeapYear(year) {
  return false
}
`,
        tests: `function __goodLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 }
function __only4(y) { return y % 4 === 0 }
function __no400(y) { return y % 4 === 0 && y % 100 !== 0 }
function __never(y) { return false }
test('your checks pass on the correct version', () => checkLeapYear(__goodLeap))
test('catches: forgets the 100 rule', () => expect(() => checkLeapYear(__only4)).toThrow())
test('catches: forgets the 400 rule', () => expect(() => checkLeapYear(__no400)).toThrow())
test('catches: always says no', () => expect(() => checkLeapYear(__never)).toThrow())
test('your isLeapYear passes your own checks', () => checkLeapYear(isLeapYear))
test('isLeapYear(2000) and isLeapYear(1900)', () => expect([isLeapYear(2000), isLeapYear(1900), isLeapYear(2024), isLeapYear(2023)]).toEqual([true, false, true, false]))`,
        hint: 'Checks: 2024 → true, 1900 → false, 2000 → true, 2023 → false. Code: (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0',
        solution: `function assertEqual(actual, expected) {
  if (actual !== expected) throw new Error('Expected ' + expected + ' but got ' + actual)
}

// RED: one check per rule in the spec
function checkLeapYear(isLeapYear) {
  assertEqual(isLeapYear(2024), true)   // divisible by 4
  assertEqual(isLeapYear(1900), false)  // divisible by 100
  assertEqual(isLeapYear(2000), true)   // divisible by 400
  assertEqual(isLeapYear(2023), false)  // none of the above
}

// GREEN: make your checks pass
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}
`,
      },
    ],
  },
]

export const terminal: Realm = {
  id: 'term',
  name: 'Shell Caverns',
  topic: 'The Command Line',
  icon: '🖥️',
  glyph: '>_',
  color: '#3d3d4e',
  when: 'Month 1',
  blurb: 'The black window every dev lives in: folders and paths, cd and ls, npm and pip, and environment variables.',
  lessons: [
    {
      id: 'term-1',
      title: 'The Shell: Folders, Paths, cd and ls',
      minutes: 14,
      uses: ['start-1', 'start-2'],
      steps: [
        {
          kind: 'concept',
          title: 'Talking to the computer in text',
          eli5: 'Your files are a **building with rooms inside rooms**. The terminal is you **walking around the building with your eyes closed**, asking "where am I?" and "what is in this room?" out loud, and giving short orders.',
          body: `
The **terminal** is the window. The **shell** (bash, zsh, PowerShell) is the program inside it that reads what you type and runs it.

## Folders are a tree
Everything starts at the **root**, written \`/\`. Folders hold files and more folders:

\`\`\`
/
└── home
    └── ada
        ├── projects
        │   └── game
        └── docs
\`\`\`
The shell is always "standing" in one folder: the **current working directory** (cwd).

## Paths
- **Absolute** path: starts with \`/\`. Works from anywhere. \`/home/ada/docs\`
- **Relative** path: starts from where you are. \`docs\` means "the docs folder in here".
- \`.\` means "this folder". \`..\` means "the folder above". \`~\` means your home folder.

## The first commands
- \`pwd\`: print where I am
- \`ls\`: list what's in here
- \`cd projects\`: move into a folder (\`cd ..\` goes up)
- \`mkdir game\`: make a folder
- \`touch notes.txt\`: make an empty file
- \`cat notes.txt\`: print a file
- \`rm notes.txt\`: delete a file

> ⚠️ \`rm\` does **not** use the trash can. It's gone. \`rm -rf folder\` deletes a folder and *everything* inside without asking. Never run an \`rm -rf\` you copied from the internet without reading it twice.
`,
        },
        {
          kind: 'visual',
          title: 'Walking the tree',
          code: `pwd
cd projects
ls
cd ../docs
cd /
cd ~`,
          frames: [
            {
              line: 1,
              caption: '`pwd` asks "where am I?" The shell says `/home/ada`, your home folder.',
              lanes: [
                { title: 'Commands', items: ['$ pwd', '/home/ada'], highlight: [1] },
                { title: 'cwd', layout: 'row', items: ['/', 'home', 'ada'], highlight: [2] },
                { title: 'Tree', items: ['/', '  home', '    ada  👈 you', '      projects', '        game', '      docs'], highlight: [2] },
              ],
            },
            {
              line: 2,
              caption: '`cd projects` is relative: "the projects folder in here". You step down one level.',
              lanes: [
                { title: 'Commands', items: ['$ pwd', '$ cd projects'], highlight: [1] },
                { title: 'cwd', layout: 'row', items: ['/', 'home', 'ada', 'projects'], highlight: [3] },
                { title: 'Tree', items: ['/', '  home', '    ada', '      projects  👈 you', '        game', '      docs'], highlight: [3] },
              ],
            },
            {
              line: 3,
              caption: '`ls` lists what is in the current folder: just `game`.',
              lanes: [
                { title: 'Commands', items: ['$ pwd', '$ cd projects', '$ ls', 'game'], highlight: [3] },
                { title: 'cwd', layout: 'row', items: ['/', 'home', 'ada', 'projects'] },
                { title: 'Tree', items: ['/', '  home', '    ada', '      projects  👈 you', '        game', '      docs'], highlight: [4] },
              ],
            },
            {
              line: 4,
              caption: '`cd ../docs`: first `..` goes **up** to `ada`, then `docs` goes down into docs.',
              lanes: [
                { title: 'Commands', items: ['$ cd projects', '$ ls', '$ cd ../docs'], highlight: [2] },
                { title: 'cwd', layout: 'row', items: ['/', 'home', 'ada', 'docs'], highlight: [3] },
                { title: 'Tree', items: ['/', '  home', '    ada', '      projects', '        game', '      docs  👈 you'], highlight: [5] },
              ],
            },
            {
              line: 5,
              caption: '`cd /` is absolute: jump straight to the root, no matter where you were.',
              lanes: [
                { title: 'Commands', items: ['$ ls', '$ cd ../docs', '$ cd /'], highlight: [2] },
                { title: 'cwd', layout: 'row', items: ['/'], highlight: [0] },
                { title: 'Tree', items: ['/  👈 you', '  home', '    ada', '      projects', '        game', '      docs'], highlight: [0] },
              ],
            },
            {
              line: 6,
              caption: '`cd ~` (or just `cd`) takes you home. Lost? This is your "go home" button.',
              lanes: [
                { title: 'Commands', items: ['$ cd ../docs', '$ cd /', '$ cd ~'], highlight: [2] },
                { title: 'cwd', layout: 'row', items: ['/', 'home', 'ada'], highlight: [2] },
                { title: 'Tree', items: ['/', '  home', '    ada  👈 you', '      projects', '        game', '      docs'], highlight: [2] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'You are in `/home/ada/projects`. You run `cd ../docs`. Where are you now?',
          options: ['/home/ada/projects/docs', '/home/ada/docs', '/docs', '/home/docs'],
          answer: 1,
          explain: '`..` goes up one level to `/home/ada`, then `docs` goes down into `/home/ada/docs`.',
        },
        {
          kind: 'quiz',
          prompt: 'Which path points to the same file **no matter which folder you are in**?',
          options: ['notes.txt', './notes.txt', '../ada/notes.txt', '/home/ada/notes.txt'],
          answer: 3,
          explain: 'It starts with `/`, so it is absolute: it always starts from the root. The others are relative to wherever you happen to be standing.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Guided: one step at a time',
          instructions: `
Let's teach JavaScript to do what \`cd\` does, one step at a time. Paths are just strings.

1. \`joinPath(cwd, name)\` steps **down** into a folder.
   \`joinPath('/home/ada', 'docs')\` → \`'/home/ada/docs'\`
   Careful at the root: \`joinPath('/', 'etc')\` → \`'/etc'\` (not \`'//etc'\`).
2. \`parentOf(path)\` steps **up** (that's \`..\`).
   \`parentOf('/home/ada')\` → \`'/home'\` · \`parentOf('/home')\` → \`'/'\` · \`parentOf('/')\` → \`'/'\`

Step 1 is almost done. Use the comments for step 2.
`,
          starter: `function joinPath(cwd, name) {
  // at the root, don't add an extra slash
  if (cwd === '/') return '/' + name
  return cwd + name   // something's missing here!
}

function parentOf(path) {
  // 1. split into parts:  '/home/ada' → ['home', 'ada']
  //    hint: path.split('/').filter(p => p !== '')
  // 2. remove the last part with .pop()
  // 3. put it back together: '/' + parts.join('/')
  return path
}
`,
          tests: `test("joinPath('/home/ada', 'docs')", () => expect(joinPath('/home/ada', 'docs')).toBe('/home/ada/docs'))
test("joinPath('/', 'etc')", () => expect(joinPath('/', 'etc')).toBe('/etc'))
test("parentOf('/home/ada')", () => expect(parentOf('/home/ada')).toBe('/home'))
test("parentOf('/home')", () => expect(parentOf('/home')).toBe('/'))
test("parentOf('/') stays at the root", () => expect(parentOf('/')).toBe('/'))`,
          hint: "return cwd + '/' + name · const parts = path.split('/').filter(p => p !== ''); parts.pop(); return '/' + parts.join('/')",
          solution: `function joinPath(cwd, name) {
  // at the root, don't add an extra slash
  if (cwd === '/') return '/' + name
  return cwd + '/' + name
}

function parentOf(path) {
  const parts = path.split('/').filter(p => p !== '')
  parts.pop()
  return '/' + parts.join('/')
}
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Your turn: build cd',
          instructions: `
Write \`resolvePath(cwd, input)\`: where do you end up if you're in \`cwd\` and run \`cd input\`?

- \`input\` starting with \`/\` is absolute: start from the root, ignore \`cwd\`.
- \`.\` means stay here. \`..\` means go up (but never above \`/\`).
- Extra slashes don't matter: \`'a//b/'\` is the same as \`'a/b'\`.

\`\`\`
resolvePath('/home/ada', 'projects')          → '/home/ada/projects'
resolvePath('/home/ada/projects', '../docs')  → '/home/ada/docs'
resolvePath('/home/ada', '/etc')              → '/etc'
resolvePath('/home/ada', '../../..')          → '/'
\`\`\`
Plan: turn the starting point into a list of parts, then walk through the input one piece at a time.
`,
          starter: `function resolvePath(cwd, input) {
  return cwd + '/' + input
}
`,
          tests: `test('a simple folder name', () => expect(resolvePath('/home/ada', 'projects')).toBe('/home/ada/projects'))
test('.. then a folder', () => expect(resolvePath('/home/ada/projects', '../docs')).toBe('/home/ada/docs'))
test('absolute path ignores cwd', () => expect(resolvePath('/home/ada', '/etc')).toBe('/etc'))
test('. stays put', () => expect(resolvePath('/home/ada', '.')).toBe('/home/ada'))
test('cannot go above the root', () => expect(resolvePath('/home/ada', '../../..')).toBe('/'))
test('extra slashes and dots', () => expect(resolvePath('/home', 'ada//notes/./')).toBe('/home/ada/notes'))
test('from the root', () => expect(resolvePath('/', 'home/ada')).toBe('/home/ada'))`,
          hint: "let parts = input.startsWith('/') ? [] : cwd.split('/').filter(p => p !== '') · for (const piece of input.split('/')) { if (piece === '' || piece === '.') continue; if (piece === '..') parts.pop(); else parts.push(piece) } · return '/' + parts.join('/')",
          solution: `function resolvePath(cwd, input) {
  // absolute paths start from the root, relative ones from cwd
  const parts = input.startsWith('/') ? [] : cwd.split('/').filter(p => p !== '')
  for (const piece of input.split('/')) {
    if (piece === '' || piece === '.') continue   // extra slash or "here"
    if (piece === '..') parts.pop()                // up (pop on [] does nothing)
    else parts.push(piece)                         // down into a folder
  }
  return '/' + parts.join('/')
}
`,
        },
      ],
    },
    {
      id: 'term-2',
      title: 'BOSS: Running Programs: npm, pip, PATH and env vars',
      boss: true,
      minutes: 15,
      uses: ['term-1', 'js-4', 'js-3'],
      steps: [
        {
          kind: 'concept',
          title: 'Every command is a program',
          eli5: "Typing a command is like **shouting a name in a building**. The shell checks a list of rooms (that's **PATH**) until it finds someone with that name, and that someone does the job.",
          body: `
\`ls\`, \`node\`, \`npm\`, \`git\`, \`python\`: each is just a program file somewhere on disk.

## Arguments and flags
\`\`\`
npm install --save-dev vite
│   │        │          └── argument
│   │        └── flag (starts with --, changes how it behaves)
│   └── argument (what to do)
└── the program
\`\`\`
## npm and pip
- \`npm install\` downloads the packages listed in \`package.json\` into \`node_modules\`.
- \`npm run dev\` runs the \`"dev"\` line from the \`"scripts"\` section of \`package.json\` (for example \`"dev": "vite"\`).
- \`pip install requests\` is the same idea for Python. A **virtualenv** is a private folder of packages for one project, so projects don't fight over versions.

## PATH
\`PATH\` is a list of folders. When you type \`node\`, the shell looks in each folder, in order, for a program called \`node\`. Not found anywhere? \`command not found\`.

## Environment variables
Settings handed to a program from outside: \`PORT=3000 npm run dev\`. In Node you read them with \`process.env.PORT\`, in Python with \`os.environ["PORT"]\`.

Secrets like \`API_KEY\` go in a \`.env\` file that is listed in \`.gitignore\`.

> Never commit secrets. Bots scan GitHub for leaked keys within minutes.
`,
        },
        {
          kind: 'visual',
          title: 'What happens when you type npm run dev',
          code: `$ PORT=3000 npm run dev`,
          frames: [
            {
              line: 1,
              caption: 'The shell splits the line: env var `PORT=3000`, program `npm`, arguments `run` and `dev`.',
              lanes: [
                { title: 'Shell', items: ['env: PORT=3000', 'program: npm', 'args: run, dev'], highlight: [1] },
                { title: 'PATH folders', items: ['/usr/local/bin', '/usr/bin', '/bin'] },
                { title: 'Running', items: [] },
              ],
            },
            {
              line: 1,
              caption: 'It searches the PATH folders in order. `/usr/local/bin/npm` exists. Found it!',
              lanes: [
                { title: 'Shell', items: ['env: PORT=3000', 'program: npm', 'args: run, dev'] },
                { title: 'PATH folders', items: ['/usr/local/bin  ✔ npm', '/usr/bin', '/bin'], highlight: [0] },
                { title: 'Running', items: ['npm'] },
              ],
            },
            {
              line: 1,
              caption: 'npm reads `package.json`, finds `"dev": "vite"` under scripts, and runs `vite`.',
              lanes: [
                { title: 'Shell', items: ['env: PORT=3000'] },
                { title: 'package.json scripts', items: ['"dev": "vite"', '"build": "vite build"'], highlight: [0] },
                { title: 'Running', items: ['npm', '└ vite'], highlight: [1] },
              ],
            },
            {
              line: 1,
              caption: 'Vite reads `process.env.PORT` and gets `"3000"`. Note: env vars are always **strings**.',
              lanes: [
                { title: 'Shell', items: ['env: PORT=3000'], highlight: [0] },
                { title: 'package.json scripts', items: ['"dev": "vite"'] },
                { title: 'Running', items: ['npm', '└ vite', '  process.env.PORT → "3000"'], highlight: [2] },
              ],
            },
            {
              line: 1,
              caption: 'Your dev server is up on port 3000. Press Ctrl+C in the terminal to stop it.',
              lanes: [
                { title: 'Shell', items: ['(waiting)'] },
                { title: 'package.json scripts', items: ['"dev": "vite"'] },
                { title: 'Running', items: ['npm', '└ vite', '  ➜ http://localhost:3000'], highlight: [2] },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          prompt: 'Typing `vite` says `command not found`, but `npm run dev` (whose script is `"vite"`) works. Why?',
          options: [
            'vite is broken',
            "vite lives in the project's node_modules/.bin, which isn't on your PATH, but npm run adds it",
            'You need to restart the computer',
            'vite only works on Tuesdays',
          ],
          answer: 1,
          explain:
            '`command not found` means "not in any PATH folder". `npm run` temporarily adds `node_modules/.bin` to PATH, so it finds the project\'s own vite. `npx vite` works for the same reason.',
        },
        {
          kind: 'quiz',
          prompt: 'Your app needs a secret `API_KEY`. Where should it go?',
          options: [
            'Hard-coded in app.js so it always works',
            'In README.md so teammates can find it',
            'In a .env file that is listed in .gitignore, read with process.env.API_KEY',
            'In package.json',
          ],
          answer: 2,
          explain:
            'The code reads `process.env.API_KEY`. The real value lives in `.env` on your machine (and in the server settings in production), and `.gitignore` keeps it out of git.',
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Boss part 1: parse the arguments',
          instructions: `
Programs get their command-line words as an array of strings. Write \`parseArgs(argv)\`:

- \`'--name=value'\` → a flag with a value: \`flags.name = 'value'\`
- \`'--name'\` alone → a true/false switch: \`flags.name = true\`
- anything else → a plain argument, pushed onto \`args\` in order

\`\`\`
parseArgs(['build', '--port=3000', '--verbose'])
→ { flags: { port: '3000', verbose: true }, args: ['build'] }
\`\`\`
Keep values as **strings** (\`'3000'\`, not \`3000\`), just like real env vars and args. Only split on the **first** \`=\`.
`,
          starter: `function parseArgs(argv) {
  const flags = {}
  const args = []
  for (const word of argv) {
    args.push(word)
  }
  return { flags, args }
}
`,
          tests: `test('plain arguments', () => expect(parseArgs(['build', 'src'])).toEqual({ flags: {}, args: ['build', 'src'] }))
test('a switch is true', () => expect(parseArgs(['--verbose'])).toEqual({ flags: { verbose: true }, args: [] }))
test('a flag with a value', () => expect(parseArgs(['--port=3000'])).toEqual({ flags: { port: '3000' }, args: [] }))
test('everything mixed', () => expect(parseArgs(['build', '--port=3000', '--verbose', 'app.js'])).toEqual({ flags: { port: '3000', verbose: true }, args: ['build', 'app.js'] }))
test('only the first = splits', () => expect(parseArgs(['--query=a=b'])).toEqual({ flags: { query: 'a=b' }, args: [] }))
test('empty argv', () => expect(parseArgs([])).toEqual({ flags: {}, args: [] }))`,
          hint: "if (word.startsWith('--')) { const body = word.slice(2); const i = body.indexOf('='); if (i === -1) flags[body] = true; else flags[body.slice(0, i)] = body.slice(i + 1) } else args.push(word)",
          solution: `function parseArgs(argv) {
  const flags = {}
  const args = []
  for (const word of argv) {
    if (word.startsWith('--')) {
      const body = word.slice(2)           // drop the --
      const eq = body.indexOf('=')
      if (eq === -1) flags[body] = true    // a switch
      else flags[body.slice(0, eq)] = body.slice(eq + 1)
    } else {
      args.push(word)
    }
  }
  return { flags, args }
}
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Boss part 2: read a .env file',
          instructions: `
Libraries like \`dotenv\` read a \`.env\` file into \`process.env\`. Write your own \`parseEnv(text)\` that returns an object.

Rules:
- One \`KEY=value\` per line. Trim spaces around the key and the value.
- Skip **blank lines** and **comments** (lines starting with \`#\`).
- Split on the **first** \`=\` only (URLs have \`=\` in them).
- If the value is wrapped in matching quotes (\`"..."\` or \`'...'\`), remove them.

\`\`\`
# database
DB_URL=postgres://localhost/game?ssl=true

API_KEY = "abc 123"
MODE='dev'
\`\`\`
→ \`{ DB_URL: 'postgres://localhost/game?ssl=true', API_KEY: 'abc 123', MODE: 'dev' }\`

Tip: \`text.split('\\n')\` gives you the lines.
`,
          starter: `function parseEnv(text) {
  const env = {}
  // for each line: skip blanks and comments, split on the first =, trim, unquote
  return env
}
`,
          tests: `test('one line', () => expect(parseEnv('PORT=3000')).toEqual({ PORT: '3000' }))
test('skips blank lines and comments', () => expect(parseEnv('# config\\n\\nPORT=3000\\n  # another\\nMODE=dev')).toEqual({ PORT: '3000', MODE: 'dev' }))
test('trims spaces around key and value', () => expect(parseEnv('  NAME =  Ada  ')).toEqual({ NAME: 'Ada' }))
test('splits on the first = only', () => expect(parseEnv('DB_URL=postgres://localhost/game?ssl=true')).toEqual({ DB_URL: 'postgres://localhost/game?ssl=true' }))
test('removes double quotes', () => expect(parseEnv('API_KEY="abc 123"')).toEqual({ API_KEY: 'abc 123' }))
test('removes single quotes', () => expect(parseEnv("MODE='dev'")).toEqual({ MODE: 'dev' }))
test('keeps mismatched quotes', () => expect(parseEnv('ODD="hi\\'')).toEqual({ ODD: '"hi\\'' }))`,
          hint: "for (const raw of text.split('\\n')) { const line = raw.trim(); if (!line || line.startsWith('#')) continue; const eq = line.indexOf('='); const key = line.slice(0, eq).trim(); let value = line.slice(eq + 1).trim(); ... }  For quotes: check value[0] is \" or ' and value.endsWith(value[0]) and value.length >= 2.",
          solution: `function parseEnv(text) {
  const env = {}
  for (const raw of text.split('\\n')) {
    const line = raw.trim()
    if (line === '' || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    const q = value[0]
    if ((q === '"' || q === "'") && value.length >= 2 && value.endsWith(q)) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}
`,
        },
        {
          kind: 'explain',
          prompt: 'Explain to a new teammate what happens when they type `npm run dev`, and why the API key lives in `.env` and not in the code.',
          keyPoints: [
            'The shell finds the npm program by searching the folders in PATH',
            'npm looks up "dev" in the scripts section of package.json and runs that command',
            'Environment variables are settings passed in from outside, read with process.env',
            '.env is in .gitignore so secrets never get committed; anyone who sees the repo would see a hard-coded key',
          ],
        },
      ],
    },
  ],
  comingSoon: [],
}
