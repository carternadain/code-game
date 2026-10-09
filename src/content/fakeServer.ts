/**
 * A pretend web server for lessons about fetch, HTTP and APIs. It's plain JS source used as a code
 * challenge's `setup`: it defines `fetch` in the learner's scope, so `await fetch('/api/quests')`
 * behaves like the real thing (status codes, JSON, a small delay) with no network at all.
 *
 * Routes:
 *   GET    /api/quests            → 200 [quests]           (?done=true|false filters)
 *   GET    /api/quests/:id        → 200 quest | 404 { error }
 *   POST   /api/quests            → 201 quest | 400 { error } (needs a non-empty title)
 *   PATCH  /api/quests/:id        → 200 quest | 404
 *   DELETE /api/quests/:id        → 204 | 404
 *   GET    /api/heroes            → 200 [heroes]
 *   GET    /api/heroes/:id        → 200 hero | 404
 *   GET    /api/me                → 200 { name } with header Authorization: 'Bearer letmein', else 401
 *   GET    /api/slow              → 200 { ok: true } after 300ms
 *   GET    /api/flaky             → 500 on the 1st and 2nd call, then 200 { ok: true }
 *   GET    /api/broken            → 500 { error }
 *   any URL starting with https://offline.example → rejects with TypeError('Failed to fetch')
 *   anything else                 → 404
 *
 * Tests can read `__requests` (every call: { method, url, body, headers }) and `__api.quests`.
 */
export const FAKE_API = String.raw`
const __api = {
  quests: [
    { id: 1, title: 'Slay the Bug Dragon', reward: 500, done: false },
    { id: 2, title: 'Fix Prod at 2am', reward: 300, done: true },
    { id: 3, title: 'Write the Docs', reward: 50, done: false },
  ],
  heroes: [
    { id: 1, name: 'Ada', level: 14, guildId: 1 },
    { id: 2, name: 'Linus', level: 9, guildId: 2 },
    { id: 3, name: 'Grace', level: 21, guildId: 1 },
  ],
  nextId: 4,
  flakyCalls: 0,
};
const __requests = [];
const __respond = (status, body) => {
  const text = body === undefined ? '' : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: { 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 401: 'Unauthorized', 404: 'Not Found', 500: 'Internal Server Error' }[status] || '',
    headers: { get: (name) => (String(name).toLowerCase() === 'content-type' && text ? 'application/json' : null) },
    json: async () => {
      if (!text) throw new SyntaxError('Unexpected end of JSON input');
      return JSON.parse(text);
    },
    text: async () => text,
  };
};
const __wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function fetch(url, options = {}) {
  url = String(url);
  const method = (options.method || 'GET').toUpperCase();
  const headers = options.headers || {};
  let body = options.body;
  __requests.push({ method, url, body, headers });
  if (url.startsWith('https://offline.example')) {
    await __wait(10);
    throw new TypeError('Failed to fetch');
  }
  const [path, query = ''] = url.replace(/^https?:\/\/[^/]+/, '').split('?');
  const params = Object.fromEntries(query.split('&').filter(Boolean).map((kv) => kv.split('=').map(decodeURIComponent)));
  if (path === '/api/slow') {
    await __wait(300);
    return __respond(200, { ok: true });
  }
  await __wait(20);
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return __respond(400, { error: 'Body must be JSON. Did you forget JSON.stringify?' }); }
  } else if (body !== undefined) {
    return __respond(400, { error: 'Body must be a JSON string. Did you forget JSON.stringify?' });
  }
  const m = path.match(/^\/api\/(quests|heroes)(?:\/(\d+))?$/);
  if (m) {
    const list = __api[m[1]];
    const id = m[2] && Number(m[2]);
    const found = id && list.find((x) => x.id === id);
    if (id && !found) return __respond(404, { error: m[1].slice(0, -1) + ' ' + id + ' not found' });
    if (method === 'GET') {
      if (found) return __respond(200, found);
      const rows = 'done' in params ? list.filter((x) => String(x.done) === params.done) : list;
      return __respond(200, rows);
    }
    if (m[1] === 'quests' && method === 'POST' && !id) {
      if (!body || typeof body.title !== 'string' || !body.title.trim()) return __respond(400, { error: 'title is required' });
      const quest = { id: __api.nextId++, title: body.title, reward: Number(body.reward) || 0, done: false };
      list.push(quest);
      return __respond(201, quest);
    }
    if (m[1] === 'quests' && method === 'PATCH' && found) {
      Object.assign(found, body || {}, { id: found.id });
      return __respond(200, found);
    }
    if (m[1] === 'quests' && method === 'DELETE' && found) {
      list.splice(list.indexOf(found), 1);
      return __respond(204);
    }
    return __respond(405, { error: method + ' not allowed here' });
  }
  if (path === '/api/me') {
    const auth = headers.Authorization || headers.authorization;
    return auth === 'Bearer letmein' ? __respond(200, { name: 'Ada' }) : __respond(401, { error: 'Not logged in' });
  }
  if (path === '/api/flaky') {
    __api.flakyCalls++;
    return __api.flakyCalls <= 2 ? __respond(500, { error: 'Server hiccup' }) : __respond(200, { ok: true });
  }
  if (path === '/api/broken') return __respond(500, { error: 'Something exploded' });
  return __respond(404, { error: 'No route for ' + method + ' ' + path });
}
`
