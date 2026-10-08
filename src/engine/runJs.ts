import { transform } from 'sucrase'
import type { RunResult } from '../types'
import { HARNESS } from './harness'

const TIMEOUT_MS = 3000

/** Strips TypeScript types (like `tsc` emitting JS). Type *checking* happens in the editor first. */
export function stripTypes(code: string, jsx = false): string {
  return transform(code, {
    transforms: jsx ? ['typescript', 'jsx'] : ['typescript'],
    jsxRuntime: 'classic',
    production: true,
  }).code
}

/**
 * Runs code in a throwaway Web Worker: separate thread, no access to the page,
 * and we can kill it if it loops forever (try `while (true) {}` — you'll see).
 */
export function runJs(userCode: string, tests: string, lang: 'javascript' | 'typescript'): Promise<RunResult> {
  let compiled: string
  try {
    compiled = lang === 'typescript' ? stripTypes(userCode) : userCode
  } catch (e) {
    return Promise.resolve({ logs: [], tests: [], error: 'Compile error: ' + (e as Error).message })
  }

  const source = `${HARNESS}
self.onmessage = async () => {
  let error;
  try {
    await (async () => {
${compiled}
;
${tests}
    })();
  } catch (e) {
    error = (e && e.name ? e.name + ': ' : '') + (e && e.message ? e.message : String(e));
  }
  const tests = error ? [] : await __runTests();
  self.postMessage({ logs: __logs, tests, error });
};`

  const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))
  const worker = new Worker(url)

  return new Promise<RunResult>((resolve) => {
    const finish = (r: RunResult) => {
      clearTimeout(timer)
      worker.terminate()
      URL.revokeObjectURL(url)
      resolve(r)
    }
    const timer = setTimeout(
      () =>
        finish({
          logs: [],
          tests: [],
          error: `⏱ Timed out after ${TIMEOUT_MS / 1000}s. Infinite loop? The worker was terminated.`,
        }),
      TIMEOUT_MS,
    )
    worker.onmessage = (e) => finish(e.data as RunResult)
    worker.onerror = (e) => {
      e.preventDefault()
      finish({ logs: [], tests: [], error: 'SyntaxError: ' + e.message })
    }
    worker.postMessage('go')
  })
}
