import type { CodeStep } from '../types'

/** Checkpoint names, read from the tests before anything runs (so the list shows up front). */
export function checkpointNames(step: CodeStep): string[] {
  if (step.lang === 'sql') {
    return ['returns the right columns', /order\s+by/i.test(step.solution) ? 'returns the right rows in the right order' : 'returns the right rows']
  }
  if (step.lang === 'python') {
    const names = [...step.tests.matchAll(/^# test:\s*(.+)$/gm)].map((m) => m[1].trim())
    return names.length ? names : ['checks pass']
  }
  return [...step.tests.matchAll(/\btest\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g)].map((m) => m[2].replace(/\\(.)/g, '$1'))
}
