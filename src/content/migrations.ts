import type { Realm } from '../types'

const V1_SCHEMA = `
CREATE TABLE alembic_version (version_num VARCHAR(32) NOT NULL PRIMARY KEY);
INSERT INTO alembic_version VALUES ('a1f3_create_users');
CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT NOT NULL);
INSERT INTO users (username) VALUES ('ada'), ('linus');
`

export const migrations: Realm = {
  id: 'alembic',
  name: 'Migration Mines',
  topic: 'Alembic & Database Migrations',
  icon: '⛏️',
  glyph: 'MIG',
  color: '#a0522d',
  when: 'Month 4',
  blurb: 'Why migrations exist, what Alembic actually does under the hood, and how to change a production schema without breaking it.',
  lessons: [
    {
      id: 'alembic-1',
      title: 'Why Migrations Exist',
      minutes: 12,
      steps: [
        {
          kind: 'concept',
          title: 'Your code is in Git. What about your database?',
          eli5: "Migrations are **save points for your database's shape**. Everyone replays the same save points in the same order, so every database (yours, your teammate's, production) ends up identical.",
          body: `
Your app's code changes constantly, and it's versioned in Git. But the code *depends on the database schema*: if the code expects a \`users.email\` column that doesn't exist, it crashes.

You have **many databases**: your laptop, your teammate's laptop, CI, staging, production. How do you make sure every one of them has exactly the schema the current code expects?

## Bad options
- "Just run this ALTER TABLE in prod" → someone forgets; environments drift; nobody knows what prod actually looks like
- Drop and recreate the DB → deletes all your users' data 💀

## Migrations: version control for your schema
A **migration** is a small script that moves the schema from one version to the next — and ideally back again:
- \`upgrade()\` — apply the change (add the column)
- \`downgrade()\` — undo it (drop the column)

Migrations are committed to Git **alongside the code that needs them**. Deploying = run the code's migrations, then start the code. Every environment replays the same ordered steps and ends up identical.

**Alembic** is the migration tool for SQLAlchemy (Python). JS equivalents: Prisma Migrate, Knex, TypeORM, Drizzle Kit. Same idea everywhere.
`,
        },
        {
          kind: 'quiz',
          prompt: 'A teammate added a column with a migration. You pull their code and the app crashes with "no such column: users.email". What do you run?',
          options: ['git reset --hard', 'alembic upgrade head', 'alembic downgrade base', 'DROP DATABASE and start over'],
          answer: 1,
          explain: '`upgrade head` applies every migration your local DB hasn\'t run yet, up to the newest ("head"). Make it a habit after every `git pull`.',
        },
        {
          kind: 'explain',
          prompt: 'Explain to a new teammate why the team uses Alembic instead of just running SQL by hand on each database.',
          keyPoints: [
            'Many environments must have the same schema as the code expects',
            'Migrations are versioned in Git with the code that needs them',
            'They run in a known order and record which version each DB is at',
            'downgrade() lets you roll back',
          ],
        },
      ],
    },
    {
      id: 'alembic-2',
      title: 'Anatomy of an Alembic Revision',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Inside a revision file',
          eli5: "Each revision file is **one step of a recipe** with an undo button: `upgrade()` = do the step, `downgrade()` = undo it. Alembic keeps a **bookmark** in your database saying which step you're on.",
          body: `
\`alembic revision -m "add email to users"\` generates a file in \`alembic/versions/\`:

\`\`\`
"""add email to users"""
revision = "b7c2_add_email"          # this migration's unique id
down_revision = "a1f3_create_users"  # the one that must run BEFORE it

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column("users", sa.Column("email", sa.String(255), nullable=True))
    op.create_index("ix_users_email", "users", ["email"], unique=True)

def downgrade():
    op.drop_index("ix_users_email", table_name="users")
    op.drop_column("users", "email")
\`\`\`
## How Alembic knows where you are
1. Revisions form a **linked list**: each points to its parent via \`down_revision\`. The newest is **head**; before the first is **base**.
2. Alembic keeps a one-row table in YOUR database: \`alembic_version(version_num)\` storing the current revision id.
3. \`alembic upgrade head\` = read the current version → walk the chain forward → run each \`upgrade()\` in order → update \`alembic_version\` after each.

## Commands you'll actually use
- \`alembic revision --autogenerate -m "msg"\` — compare your SQLAlchemy models to the DB and draft a migration
- \`alembic upgrade head\` / \`alembic downgrade -1\`
- \`alembic current\` / \`alembic history\`
`,
        },
        {
          kind: 'quiz',
          prompt: 'What is stored in the `alembic_version` table?',
          options: [
            'Every SQL statement ever run',
            'The id of the latest revision applied to this database',
            'The Alembic package version',
            'A backup of the schema',
          ],
          answer: 1,
          explain: "Just one value: the revision id this database is currently at. That's how Alembic knows which migrations still need to run.",
        },
        {
          kind: 'quiz',
          prompt: 'You renamed the model field `username` → `handle` and ran `--autogenerate`. What will it most likely generate?',
          options: [
            'A rename_column operation',
            'drop_column("username") + add_column("handle") — which DELETES the data',
            'Nothing — renames are ignored',
            'An error',
          ],
          answer: 1,
          explain:
            'Autogenerate only sees "a column vanished and a new one appeared". It can\'t know it was a rename. **Always read autogenerated migrations before running them** — fix it to `op.alter_column("users", "username", new_column_name="handle")`.',
        },
      ],
    },
    {
      id: 'alembic-3',
      title: 'Write a Migration by Hand',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'What op.add_column really runs',
          eli5: "Alembic's `op` functions are a **translator**: you write Python, it speaks the right SQL dialect to your database.",
          body: `
Alembic's \`op.*\` functions just generate SQL for your database (Postgres, MySQL, SQLite…). Under the hood:

\`\`\`
op.add_column("users", sa.Column("email", sa.String(255)))
-- ALTER TABLE users ADD COLUMN email VARCHAR(255);

op.create_table("posts", ...)
-- CREATE TABLE posts (...);

# then Alembic itself runs:
-- UPDATE alembic_version SET version_num = 'b7c2_add_email';
\`\`\`
You can see the SQL without running it: \`alembic upgrade head --sql\` (offline mode) — great for DBAs reviewing production changes.
`,
        },
        {
          kind: 'code',
          lang: 'sql',
          title: 'Be Alembic: run revision b7c2',
          instructions: `
The database is at revision \`a1f3_create_users\` with a \`users(id, username)\` table.

Write the SQL that revision \`b7c2_add_email\` would run:
1. Add a nullable \`email\` column of type \`TEXT\` to \`users\`
2. Create a \`posts\` table: \`id INTEGER PRIMARY KEY\`, \`user_id INTEGER NOT NULL REFERENCES users(id)\`, \`title TEXT NOT NULL\`
3. Update \`alembic_version\` to \`'b7c2_add_email'\`

The checker inspects the version and the columns of both tables.
`,
          setup: V1_SCHEMA,
          starter: `-- 1. ALTER TABLE ...\n\n-- 2. CREATE TABLE posts (...)\n\n-- 3. UPDATE alembic_version ...\n`,
          tests: `SELECT
  (SELECT version_num FROM alembic_version) AS version,
  (SELECT group_concat(name, ',') FROM pragma_table_info('users')) AS users_cols,
  (SELECT group_concat(name, ',') FROM pragma_table_info('posts')) AS posts_cols;`,
          hint: "ALTER TABLE users ADD COLUMN email TEXT; CREATE TABLE posts (...); UPDATE alembic_version SET version_num = 'b7c2_add_email';",
          solution: `ALTER TABLE users ADD COLUMN email TEXT;\n\nCREATE TABLE posts (\n  id INTEGER PRIMARY KEY,\n  user_id INTEGER NOT NULL REFERENCES users(id),\n  title TEXT NOT NULL\n);\n\nUPDATE alembic_version SET version_num = 'b7c2_add_email';\n`,
        },
        {
          kind: 'quiz',
          prompt: 'The `users` table has 10 million rows. You add `email TEXT NOT NULL` with no default. What happens?',
          options: [
            'It works instantly',
            'It fails — existing rows have no value for a NOT NULL column',
            'Alembic fills in empty strings',
            'Postgres sets them to NULL',
          ],
          answer: 1,
          explain:
            'Classic production gotcha. Safe pattern: (1) add the column as nullable, (2) backfill data in batches, (3) a later migration sets NOT NULL. This is part of the **expand → migrate → contract** approach to zero-downtime migrations.',
        },
      ],
    },
    {
      id: 'alembic-4',
      title: 'BOSS: Build Your Own Alembic',
      boss: true,
      minutes: 25,
      steps: [
        {
          kind: 'concept',
          title: 'The algorithm behind `alembic upgrade`',
          eli5: "It's a **treasure map with arrows**: each revision points to the one before it. To get from where you are to the newest, follow the arrows.",
          body: `
Alembic's core is surprisingly small: a **graph** of revisions where each one points to its \`down_revision\`.

\`\`\`
None ← a1 ← b2 ← c3 ← d4   (head)
\`\`\`
To upgrade from \`b2\` to head: start at the head and walk *backwards* via \`down_revision\` until you hit \`b2\`, collecting ids. Reverse that list → \`[c3, d4]\`. Run them in order.

If two developers both create a migration off \`b2\`, you get **two heads** — Alembic refuses to upgrade until you create a *merge revision* (\`alembic merge heads\`). Now you know why!
`,
        },
        {
          kind: 'code',
          lang: 'python',
          title: 'Implement the migration planner',
          instructions: `
\`REVISIONS\` maps each revision id to its \`down_revision\` (\`None\` for the first).

1. \`find_heads(revisions)\` → sorted list of revisions that no other revision points to as its parent.
2. \`upgrade_plan(revisions, current, target)\` → list of revision ids to run, in order, to go from \`current\` (or \`None\` for an empty DB) to \`target\`. Raise \`ValueError\` if \`target\` doesn't descend from \`current\`.
3. \`downgrade_plan(revisions, current, target)\` → revisions whose \`downgrade()\` must run, newest first, to go back to \`target\`.
`,
          starter: `REVISIONS = {\n    "a1": None,\n    "b2": "a1",\n    "c3": "b2",\n    "d4": "c3",\n}\n\n\ndef find_heads(revisions):\n    pass\n\n\ndef upgrade_plan(revisions, current, target):\n    pass\n\n\ndef downgrade_plan(revisions, current, target):\n    pass\n\n\nprint(find_heads(REVISIONS))\nprint(upgrade_plan(REVISIONS, "b2", "d4"))\n`,
          tests: `# test: single head
assert find_heads(REVISIONS) == ["d4"], find_heads(REVISIONS)
# test: detects two heads (a branch)
assert find_heads({**REVISIONS, "x9": "b2"}) == ["d4", "x9"]
# test: upgrade from the middle
assert upgrade_plan(REVISIONS, "b2", "d4") == ["c3", "d4"], upgrade_plan(REVISIONS, "b2", "d4")
# test: upgrade an empty database
assert upgrade_plan(REVISIONS, None, "c3") == ["a1", "b2", "c3"]
# test: already up to date
assert upgrade_plan(REVISIONS, "d4", "d4") == []
# test: downgrade
assert downgrade_plan(REVISIONS, "d4", "b2") == ["d4", "c3"]
assert downgrade_plan(REVISIONS, "b2", None) == ["b2", "a1"]
# test: impossible upgrade raises ValueError
try:
    upgrade_plan({**REVISIONS, "x9": "b2"}, "c3", "x9")
    assert False, "expected ValueError"
except ValueError:
    pass`,
          hint: 'Walk backwards: path = []; rev = target; while rev != current: if rev is None: raise ValueError(...); path.append(rev); rev = revisions[rev]. Then return path reversed. Downgrade is the same walk from current to target, not reversed.',
          solution: `REVISIONS = {\n    "a1": None,\n    "b2": "a1",\n    "c3": "b2",\n    "d4": "c3",\n}\n\n\ndef find_heads(revisions):\n    parents = set(revisions.values())\n    return sorted(r for r in revisions if r not in parents)\n\n\ndef _walk_back(revisions, start, stop):\n    path = []\n    rev = start\n    while rev != stop:\n        if rev is None:\n            raise ValueError(f"{stop} is not an ancestor of {start}")\n        path.append(rev)\n        rev = revisions[rev]\n    return path\n\n\ndef upgrade_plan(revisions, current, target):\n    return list(reversed(_walk_back(revisions, target, current)))\n\n\ndef downgrade_plan(revisions, current, target):\n    return _walk_back(revisions, current, target)\n`,
        },
      ],
    },
  ],
  comingSoon: [
    'Autogenerate: what it catches and what it misses',
    'Data migrations (backfilling rows safely)',
    'Branches & merge heads in a team',
    'Zero-downtime migrations: expand → migrate → contract',
    'Running migrations in CI/CD & on deploy',
    'Prisma Migrate & Drizzle: the same ideas in TypeScript',
  ],
}
