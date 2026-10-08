import initSqlJs, { type Database, type QueryExecResult, type SqlJsStatic } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import type { RunResult } from '../types'

/** SQLite compiled to WebAssembly. Every run gets a brand-new in-memory database. */
let sqlPromise: Promise<SqlJsStatic> | null = null
const getSql = () => (sqlPromise ??= initSqlJs({ locateFile: () => wasmUrl }))

function lastResult(results: QueryExecResult[]) {
  const r = results[results.length - 1]
  return r ? { columns: r.columns, values: r.values as unknown[][] } : { columns: [], values: [] }
}

function exec(SQL: SqlJsStatic, setup: string, code: string, after: string) {
  const db: Database = new SQL.Database()
  try {
    if (setup.trim()) db.run(setup)
    const main = lastResult(db.exec(code))
    const check = after.trim() ? lastResult(db.exec(after)) : main
    return { main, check }
  } finally {
    db.close()
  }
}

const canon = (rows: unknown[][], ordered: boolean) => {
  const s = rows.map((r) => JSON.stringify(r))
  return JSON.stringify(ordered ? s : [...s].sort())
}

export async function runSql(code: string, setup: string, tests: string, solution: string): Promise<RunResult> {
  const SQL = await getSql()
  let mine
  try {
    mine = exec(SQL, setup, code, tests)
  } catch (e) {
    return { logs: [], tests: [], error: (e as Error).message }
  }
  const expected = exec(SQL, setup, solution, tests)
  const ordered = /order\s+by/i.test(solution)
  const sameCols = mine.check.columns.length === expected.check.columns.length
  const sameRows = canon(mine.check.values, ordered) === canon(expected.check.values, ordered)

  const results = [
    {
      name: 'returns the right columns',
      pass: sameCols,
      message: sameCols ? undefined : `Expected ${expected.check.columns.length} column(s): ${expected.check.columns.join(', ')}`,
    },
    {
      name: ordered ? 'returns the right rows in the right order' : 'returns the right rows',
      pass: sameRows,
      message: sameRows
        ? undefined
        : `Expected ${expected.check.values.length} row(s), got ${mine.check.values.length}. ` +
          `First expected row: ${JSON.stringify(expected.check.values[0] ?? null)}`,
    },
  ]
  return { logs: [], tests: results, table: mine.main }
}
