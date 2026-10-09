import type { RunResult } from '../types'
import { HARNESS } from './harness'
import { stripTypes } from './runJs'

const TIMEOUT_MS = 5000
// Bundled with the app (public/vendor) so previews work offline. The iframe has no origin, so use absolute URLs.
const vendor = (file: string) => new URL(`${import.meta.env.BASE_URL}vendor/${file}`, window.location.href).href
const REACT = vendor('react.development.js')
const REACT_DOM = vendor('react-dom.development.js')

/**
 * Renders the learner's `App` component inside a sandboxed iframe (its own document,
 * no access to this page) and runs the tests against the rendered DOM.
 *
 * In tests: `screen` is the preview document, `$`/`$$` query it, `text(sel)` reads text,
 * `click(el)` / `type(el, text)` interact and wait a tick so React can re-render.
 */
export function runReact(userCode: string, tests: string, iframe: HTMLIFrameElement, setup = ''): Promise<RunResult> {
  let compiled: string
  try {
    // Imports are resolved for you: React and its hooks are globals in the preview.
    const cleaned = userCode
      .replace(/^\s*import\s.*$/gm, '')
      .replace(/^\s*export\s+default\s+/gm, '')
      .replace(/^\s*export\s+/gm, '')
    compiled = stripTypes(cleaned, true)
  } catch (e) {
    return Promise.resolve({ logs: [], tests: [], error: 'Compile error: ' + (e as Error).message })
  }

  const runId = Math.random().toString(36).slice(2)
  const html = `<!doctype html><html><head><meta charset="utf-8">
<style>
  body { font-family: system-ui, sans-serif; padding: 12px; color: #1d1d27; background: #fff; }
  button { font: inherit; padding: 4px 10px; cursor: pointer; }
</style>
<script src="${REACT}"></script>
<script src="${REACT_DOM}"></script>
</head><body><div id="root"></div>
<script>
${HARNESS}
const screen = document;
async function click(el) {
  if (!el) throw new Error('click(): element not found');
  el.click();
  await tick(20);
}
/** Types into a controlled input the way a real user would (React listens for 'input' events). */
async function type(el, text) {
  if (!el) throw new Error('type(): element not found');
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set;
  setter.call(el, text);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  await tick(20);
}
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const text = (sel) => ($(sel) ? $(sel).textContent : null);
const __send = (payload) => parent.postMessage(Object.assign({ __cq: '${runId}' }, payload), '*');
let __error;
window.addEventListener('error', (e) => { __error = __error || e.message; });
// A real browser reloads the page on an un-prevented form submit. Stop that here, but say so.
document.addEventListener('submit', (e) => {
  if (e.defaultPrevented) return;
  e.preventDefault();
  console.warn('A form was submitted without e.preventDefault() — in a real app the page would reload and your state would be lost!');
});
(async () => {
  try {
    if (!window.React) throw new Error('Could not load React for the preview');
    // Your code gets its own scope so its variable names can't clash with the test helpers.
    const __App = (() => {
      const { useState, useEffect, useRef, useMemo, useReducer, useCallback, useContext, createContext, Fragment } = React;
${setup}
;
${compiled}
;
      return typeof App === 'function' ? App : undefined;
    })();
    if (!__App) throw new Error('Define a component called App');
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(__App));
    await tick(50);
${tests}
  } catch (e) {
    __error = (e && e.name ? e.name + ': ' : '') + (e && e.message ? e.message : String(e));
  }
  const tests = __error ? [] : await __runTests();
  __send({ logs: __logs, tests, error: __error });
})();
</script></body></html>`

  return new Promise<RunResult>((resolve) => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframe.contentWindow || e.data?.__cq !== runId) return
      cleanup()
      resolve({ logs: e.data.logs, tests: e.data.tests, error: e.data.error })
    }
    const timer = setTimeout(() => {
      cleanup()
      iframe.srcdoc = '<p style="font-family:sans-serif">⏱ Preview stopped (timed out).</p>'
      resolve({ logs: [], tests: [], error: `⏱ Timed out after ${TIMEOUT_MS / 1000}s. Infinite render loop?` })
    }, TIMEOUT_MS)
    const cleanup = () => {
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
    }
    window.addEventListener('message', onMessage)
    iframe.srcdoc = html
  })
}
