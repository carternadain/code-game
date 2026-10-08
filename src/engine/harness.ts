/**
 * The tiny test framework injected before learner code runs (JS, TS and React).
 * It's plain JS source because it executes inside a Web Worker or a sandboxed iframe.
 *
 * Learner tests look like:
 *   test('adds two numbers', () => { expect(add(2, 3)).toBe(5) })
 */
export const HARNESS = String.raw`
const __logs = [];
const __tests = [];
const __fmt = (v) => {
  if (typeof v === 'string') return v;
  if (v instanceof Error) return v.name + ': ' + v.message;
  if (typeof v === 'function') return '[Function ' + (v.name || 'anonymous') + ']';
  if (v === undefined) return 'undefined';
  try { return JSON.stringify(v); } catch { return String(v); }
};
const __log = (prefix) => (...args) => __logs.push(prefix + args.map(__fmt).join(' '));
console.log = __log('');
console.info = __log('');
console.warn = __log('⚠ ');
console.error = __log('✖ ');
console.table = (rows) => __logs.push(JSON.stringify(rows, null, 2));

function __eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function expect(actual) {
  const fail = (msg) => { throw new Error(msg); };
  return {
    toBe(exp) { if (!Object.is(actual, exp)) fail('Expected ' + __fmt(exp) + ' but got ' + __fmt(actual)); },
    toEqual(exp) { if (!__eq(actual, exp)) fail('Expected ' + __fmt(exp) + ' but got ' + __fmt(actual)); },
    toBeTruthy() { if (!actual) fail('Expected something truthy but got ' + __fmt(actual)); },
    toBeFalsy() { if (actual) fail('Expected something falsy but got ' + __fmt(actual)); },
    toContain(x) {
      const ok = typeof actual === 'string' ? actual.includes(x) : Array.isArray(actual) && actual.some((y) => __eq(y, x));
      if (!ok) fail('Expected ' + __fmt(actual) + ' to contain ' + __fmt(x));
    },
    toBeGreaterThan(n) { if (!(actual > n)) fail('Expected ' + __fmt(actual) + ' > ' + n); },
    toBeLessThan(n) { if (!(actual < n)) fail('Expected ' + __fmt(actual) + ' < ' + n); },
    toThrow() {
      try { actual(); } catch { return; }
      fail('Expected the function to throw, but it did not');
    },
  };
}
function test(name, fn) { __tests.push([name, fn]); }
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

async function __runTests() {
  const results = [];
  for (const [name, fn] of __tests) {
    try { await fn(); results.push({ name, pass: true }); }
    catch (e) { results.push({ name, pass: false, message: e && e.message ? e.message : String(e) }); }
  }
  return results;
}
`
