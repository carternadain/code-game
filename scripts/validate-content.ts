/**
 * Checks every lesson before it ships:
 *  - ids are unique, quiz answers are in range, visual frames are non-empty
 *  - every JS/TS/Python/SQL challenge: the SOLUTION passes its tests and the STARTER fails them
 * React challenges need a browser, so they're only syntax-checked here.
 *
 * Run: npm run validate
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import vm from 'node:vm'
import initSqlJs from 'sql.js'
import { transform } from 'sucrase'
import { ALL_LESSONS } from '../src/content'
import { checkpointNames } from '../src/engine/checkpoints'
import { HARNESS } from '../src/engine/harness'
import type { CodeStep } from '../src/types'

const require = createRequire(import.meta.url)
let failures = 0
const fail = (where: string, msg: string) => {
  failures++
  console.log(`  ✘ ${where}: ${msg}`)
}

type Outcome = { ok: boolean; detail: string }
let lastNames: string[] = []

async function runJs(code: string, tests: string, ts: boolean, setup = ''): Promise<Outcome> {
  const compiled = ts ? transform(code, { transforms: ['typescript'] }).code : code
  const src = `${HARNESS}
(async () => {
  let error
  try { await (async () => {\n${setup}\n;\n${compiled}\n;\n${tests}\n})() } catch (e) { error = String(e && e.message || e) }
  return { error, tests: error ? [] : await __runTests() }
})()`
  try {
    const ctx = vm.createContext({ console: { ...console }, setTimeout, Promise, performance, Proxy })
    const r = await Promise.race([
      vm.runInContext(src, ctx, { timeout: 3000 }) as Promise<{ error?: string; tests: { name: string; pass: boolean; message?: string }[] }>,
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000)),
    ])
    if (r.error) return { ok: false, detail: r.error }
    const bad = r.tests.filter((t) => !t.pass)
    if (!r.tests.length) return { ok: false, detail: 'no tests ran' }
    lastNames = r.tests.map((t) => t.name)
    return { ok: bad.length === 0, detail: bad.map((t) => `${t.name}: ${t.message}`).join('; ') }
  } catch (e) {
    return { ok: false, detail: (e as Error).message }
  }
}

const dir = mkdtempSync(join(tmpdir(), 'cq-'))
function runPython(code: string, tests: string): Outcome {
  const file = join(dir, 'check.py')
  writeFileSync(file, code + '\n\n' + tests.replace(/^# test:.*$/gm, '') + '\n')
  try {
    execFileSync('python3', ['-I', file], { stdio: 'pipe', timeout: 8000 })
    return { ok: true, detail: '' }
  } catch (e) {
    const err = e as { stderr?: Buffer }
    return {
      ok: false,
      detail: String(err.stderr ?? e)
        .trim()
        .split('\n')
        .slice(-1)[0],
    }
  }
}

const SQL = await initSqlJs({ locateFile: () => require.resolve('sql.js/dist/sql-wasm.wasm') })
function runSqlCheck(step: CodeStep, code: string): Outcome {
  const exec = (q: string) => {
    const db = new SQL.Database()
    try {
      if (step.setup) db.run(step.setup)
      const main = db.exec(q)
      const check = step.tests.trim() ? db.exec(step.tests) : main
      return JSON.stringify(check[check.length - 1] ?? null)
    } finally {
      db.close()
    }
  }
  try {
    const expected = exec(step.solution)
    if (expected === 'null') return { ok: false, detail: 'solution returns no rows' }
    const got = exec(code)
    return { ok: got === expected, detail: got === expected ? '' : 'result differs from solution' }
  } catch (e) {
    return { ok: false, detail: (e as Error).message }
  }
}

const ids = new Set<string>()
const allIds = new Set(ALL_LESSONS.map((x) => x.lesson.id))
let checked = 0
for (const { realm, lesson } of ALL_LESSONS) {
  const where = `${realm.id}/${lesson.id}`
  if (ids.has(lesson.id)) fail(where, 'duplicate lesson id')
  // A lesson can only build on lessons that come before it in the course (which also rules out cycles).
  for (const u of lesson.uses ?? []) {
    if (!allIds.has(u)) fail(where, `uses unknown lesson "${u}"`)
    else if (!ids.has(u)) fail(where, `uses "${u}", which comes later in the course`)
  }
  ids.add(lesson.id)

  for (const [i, step] of lesson.steps.entries()) {
    const at = `${where}#${i}`
    if (step.kind === 'quiz' && (step.answer < 0 || step.answer >= step.options.length)) fail(at, 'quiz answer out of range')
    if (step.kind === 'visual' && step.frames.some((f) => !f.lanes.length)) fail(at, 'visual frame with no lanes')
    if (step.kind !== 'code') continue
    checked++

    if (step.lang === 'react') {
      try {
        transform(step.solution, { transforms: ['typescript', 'jsx'] })
      } catch (e) {
        fail(at, 'react solution does not compile: ' + (e as Error).message)
      }
      continue
    }

    let good: Outcome
    let starter: Outcome
    if (step.lang === 'python') {
      good = runPython(step.solution, step.tests)
      starter = runPython(step.starter, step.tests)
    } else if (step.lang === 'sql') {
      good = { ok: true, detail: '' }
      starter = runSqlCheck(step, step.starter)
      const self = runSqlCheck(step, step.solution)
      if (!self.ok) good = self
    } else {
      good = await runJs(step.solution, step.tests, step.lang === 'typescript', step.setup)
      const listed = checkpointNames(step)
      if (good.ok && JSON.stringify(listed) !== JSON.stringify(lastNames))
        fail(at, `checkpoint list ${JSON.stringify(listed)} != tests ${JSON.stringify(lastNames)}`)
      starter = await runJs(step.starter, step.tests, step.lang === 'typescript', step.setup)
    }
    if (!good.ok) fail(at, `SOLUTION fails: ${good.detail}`)
    if (starter.ok) fail(at, 'starter code already passes (nothing to do!)')
  }
}

console.log(`\nChecked ${ALL_LESSONS.length} lessons, ${checked} code challenges.`)
if (failures) {
  console.log(`${failures} problem(s).`)
  process.exit(1)
}
console.log('All good ✔')
process.exit(0)
