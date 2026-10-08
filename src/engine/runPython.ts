import type { RunResult, TestResult } from '../types'

const PYODIDE = 'https://cdn.jsdelivr.net/npm/pyodide@0.27.7/'
const TIMEOUT_MS = 8000

/**
 * Real CPython compiled to WebAssembly (Pyodide), running in a Web Worker.
 * The first load downloads ~10MB, so we keep the worker alive between runs.
 */
const WORKER_SRC = `
importScripts('${PYODIDE}pyodide.js');
const ready = loadPyodide({ indexURL: '${PYODIDE}' });
ready.then(() => self.postMessage({ type: 'ready' }), (e) => self.postMessage({ type: 'load-error', error: String(e) }));

self.onmessage = async (e) => {
  const { id, code, chunks } = e.data;
  const py = await ready;
  const logs = [];
  py.setStdout({ batched: (s) => logs.push(s) });
  py.setStderr({ batched: (s) => logs.push('✖ ' + s) });
  const ns = py.globals.get('dict')();
  const clean = (err) => {
    // Keep just the useful tail of the Python traceback.
    const lines = String(err.message || err).trim().split('\\n');
    const idx = lines.findIndex((l) => l.includes('File "<exec>"'));
    return (idx >= 0 ? lines.slice(idx) : lines.slice(-3)).join('\\n');
  };
  let error;
  try { await py.runPythonAsync(code, { globals: ns }); }
  catch (err) { error = clean(err); }
  const tests = [];
  if (!error) {
    for (const [name, src] of chunks) {
      try { await py.runPythonAsync(src, { globals: ns }); tests.push({ name, pass: true }); }
      catch (err) {
        const msg = clean(err).split('\\n').pop();
        tests.push({ name, pass: false, message: msg.replace(/^AssertionError:?\\s*/, '') || 'Assertion failed' });
      }
    }
  }
  ns.destroy();
  self.postMessage({ type: 'result', id, logs, tests, error });
};
`

let worker: Worker | null = null
let ready: Promise<void> | null = null

function boot() {
  if (worker && ready) return { worker, ready }
  const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }))
  const w = new Worker(url)
  worker = w
  ready = new Promise<void>((resolve, reject) => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === 'ready') resolve()
      if (e.data?.type === 'load-error') reject(new Error(e.data.error))
      if (e.data?.type === 'ready' || e.data?.type === 'load-error') w.removeEventListener('message', onMsg)
    }
    w.addEventListener('message', onMsg)
  })
  return { worker: w, ready }
}

/** Start downloading Python in the background (call when a Python lesson opens). */
export function warmUpPython() {
  boot().ready.catch(() => {})
}

/** Splits tests on `# test: name` lines so each check gets its own ✔/✘. */
function splitTests(tests: string): [string, string][] {
  if (!tests.trim()) return []
  if (!tests.includes('# test:')) return [['checks pass', tests]]
  return tests
    .split(/^# test:/m)
    .filter((c) => c.trim())
    .map((c) => {
      const nl = c.indexOf('\n')
      return [c.slice(0, nl).trim(), c.slice(nl + 1)]
    })
}

export async function runPython(code: string, tests: string): Promise<RunResult> {
  const { worker: w, ready: r } = boot()
  try {
    await r
  } catch (e) {
    worker = null
    ready = null
    return { logs: [], tests: [], error: 'Could not load Python (are you offline?): ' + (e as Error).message }
  }
  const id = Math.random().toString(36).slice(2)
  return new Promise<RunResult>((resolve) => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type !== 'result' || e.data.id !== id) return
      clearTimeout(timer)
      w.removeEventListener('message', onMsg)
      resolve({ logs: e.data.logs, tests: e.data.tests as TestResult[], error: e.data.error })
    }
    const timer = setTimeout(() => {
      w.removeEventListener('message', onMsg)
      w.terminate()
      worker = null
      ready = null
      resolve({
        logs: [],
        tests: [],
        error: `⏱ Timed out after ${TIMEOUT_MS / 1000}s. Infinite loop? Python was restarted.`,
      })
    }, TIMEOUT_MS)
    w.addEventListener('message', onMsg)
    w.postMessage({ id, code, chunks: splitTests(tests) })
  })
}
