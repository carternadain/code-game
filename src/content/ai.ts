import type { Realm } from '../types'

export const ai: Realm = {
  id: 'ai',
  name: 'The AI Lab',
  topic: 'AI Engineering: LLMs, Embeddings, RAG, Agents',
  icon: '🤖',
  color: '#00cec9',
  when: 'Month 8–9',
  blurb: 'Stop treating AI as magic. Learn how LLMs work, then build embeddings search, RAG, and an agent loop from scratch.',
  lessons: [
    {
      id: 'ai-1',
      title: 'How LLMs Actually Work',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'A very good next-word guesser',
          eli5: 'An LLM is **super-powered autocomplete**. It read a huge library and learned to guess the next word really, really well — so well that the guesses look like thinking.',
          body: `
A Large Language Model does one thing: given some text, predict the **next token**. Then append it and repeat.

## Tokens
Text is chopped into **tokens** — common words or word pieces (~4 characters of English on average). "unbelievable" might be \`un\` + \`believ\` + \`able\`. Pricing, speed and limits are all in tokens.

## Training
1. **Pre-training** — read a huge chunk of the internet, books and code; learn to predict the next token. This is where knowledge and skills come from.
2. **Post-training** — fine-tune with human (and AI) feedback to be a helpful, honest assistant that follows instructions.

## Things that follow from this
- **Context window** — the model only "sees" the tokens in the current request (system prompt + conversation + documents). No memory between API calls unless you send it again.
- **Knowledge cutoff** — it doesn't know what happened after training. Give it fresh data in the prompt (→ RAG).
- **Hallucination** — it generates *plausible* text. Without grounding, plausible ≠ true.
- **Temperature** — randomness in picking tokens. Low = focused and repeatable; high = more varied.
- **Stateless API** — every request includes the whole conversation so far.
`,
        },
        {
          kind: 'quiz',
          prompt: "You ask a model about your company's internal refund policy. It answers confidently — and wrongly. Why?",
          options: [
            'The temperature was too low',
            'It never saw that document; it generated a plausible-sounding answer',
            'The API is broken',
            'It needs a bigger context window',
          ],
          answer: 1,
          explain:
            "The model has no access to private data unless you put it in the context. That's exactly the problem RAG solves: retrieve the real policy and include it in the prompt.",
        },
        {
          kind: 'concept',
          title: 'Calling a model from code',
          eli5: 'Calling an LLM API is **texting a very smart friend**: you send the whole conversation so far, they text back one reply. They forget everything between texts unless you resend it.',
          body: `
Every major provider has an HTTP API. With Anthropic's TypeScript SDK:

\`\`\`
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic()          // reads ANTHROPIC_API_KEY from env

const msg = await client.messages.create({
  model: 'claude-sonnet-5-5',
  max_tokens: 1024,
  system: 'You are a patient coding tutor. Never give full solutions.',
  messages: [{ role: 'user', content: 'Why is my useEffect running twice?' }],
})
console.log(msg.content[0].text)
\`\`\`
- **system** — standing instructions (persona, rules, format)
- **messages** — the conversation, alternating \`user\` / \`assistant\`
- **max_tokens** — cap on the response length

Never call the API directly from the browser with your key — put it behind your own server.
`,
        },
        {
          kind: 'explain',
          prompt: 'Explain to a non-technical friend what an LLM is doing when it "answers a question", and why it sometimes makes things up.',
          keyPoints: [
            'Predicts the next token over and over',
            'Learned patterns from huge amounts of text',
            'Only knows what was in training data + what is in the prompt',
            "Generates plausible text, which isn't always true",
          ],
        },
      ],
    },
    {
      id: 'ai-2',
      title: 'Embeddings & Similarity',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Meaning as coordinates',
          eli5: 'Embeddings put sentences on a **map of meaning**. "I forgot my password" and "can\'t log in" land close together; "pizza recipes" lands far away.',
          body: `
An **embedding model** turns text into a **vector**: a list of numbers (often 256–3072 of them). Texts with similar *meaning* get vectors that point in similar *directions*:

- "How do I reset my password?" ≈ "I forgot my login" (close)
- "How do I reset my password?" vs "Best pizza in Phoenix" (far)

That's **semantic search**: it matches meaning, not keywords.

## Cosine similarity
How similar are two vectors? Compare their angle:
\`\`\`
cos(a, b) = (a · b) / (|a| × |b|)
a · b  = sum of a[i] * b[i]          (dot product)
|a|    = sqrt(sum of a[i]²)          (length)
\`\`\`
1 = same direction, 0 = unrelated, −1 = opposite.

Vectors are stored in a **vector database** (pgvector in Postgres, Pinecone, Qdrant, Chroma…) with an index for fast nearest-neighbour search.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Cosine similarity & top-k search',
          instructions: `
1. \`cosine(a, b)\` → cosine similarity of two equal-length number arrays.
2. \`topK(query, docs, k)\` → the \`k\` docs (each \`{ id, vector }\`) most similar to \`query\`, as an array of ids, most similar first.

This is the retrieval core of every RAG system and vector database.
`,
          starter: `function cosine(a, b) {\n  \n}\n\nfunction topK(query, docs, k) {\n  \n}\n\nconsole.log(cosine([1, 0], [1, 1]))\n`,
          tests: `test('same direction = 1', () => expect(Math.round(cosine([1, 2, 3], [2, 4, 6]) * 1000)).toBe(1000))
test('perpendicular = 0', () => expect(cosine([1, 0], [0, 5])).toBe(0))
test('opposite = -1', () => expect(Math.round(cosine([1, 1], [-1, -1]) * 1000)).toBe(-1000))
test('topK', () => {
  const docs = [
    { id: 'pizza', vector: [0, 1, 0] },
    { id: 'password', vector: [0.9, 0, 0.1] },
    { id: 'login', vector: [0.8, 0.1, 0.3] },
  ]
  expect(topK([1, 0, 0.2], docs, 2)).toEqual(['password', 'login'])
})`,
          hint: 'dot = a.reduce((s, x, i) => s + x * b[i], 0); norm = v => Math.sqrt(v.reduce((s, x) => s + x * x, 0)). topK: map to { id, score }, sort by score desc, slice(0, k), map to id.',
          solution: `function cosine(a, b) {\n  const dot = a.reduce((s, x, i) => s + x * b[i], 0)\n  const norm = (v) => Math.sqrt(v.reduce((s, x) => s + x * x, 0))\n  return dot / (norm(a) * norm(b))\n}\n\nfunction topK(query, docs, k) {\n  return docs\n    .map((d) => ({ id: d.id, score: cosine(query, d.vector) }))\n    .sort((x, y) => y.score - x.score)\n    .slice(0, k)\n    .map((d) => d.id)\n}\n`,
        },
      ],
    },
    {
      id: 'ai-3',
      title: 'RAG From Scratch',
      minutes: 20,
      steps: [
        {
          kind: 'concept',
          title: 'Retrieval-Augmented Generation',
          eli5: 'RAG is an **open-book exam** for the AI: before answering, it looks up the right pages in YOUR documents and answers from them instead of from memory.',
          body: `
**RAG** = before asking the model, *retrieve* relevant facts and put them in the prompt. The model answers from your data instead of its memory.

## Indexing (ahead of time)
1. **Load** documents (docs, PDFs, tickets, code)
2. **Chunk** them into pieces of a few hundred tokens, with some **overlap** so sentences at the edges aren't cut off from their context
3. **Embed** each chunk → vector
4. **Store** vectors + text in a vector DB

## Answering (per question)
5. Embed the question
6. **Retrieve** the top-k most similar chunks
7. **Augment** the prompt: "Answer using ONLY these sources… cite them… say you don't know if it's not there"
8. **Generate** the answer

## What makes RAG good in practice
- Chunking strategy (by headings/paragraphs, not just character counts)
- **Hybrid search**: vectors + keyword (BM25) together, then a **reranker**
- Metadata filters (only this customer's docs!)
- **Evals**: a test set of questions with known answers, so you can measure changes instead of vibes
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Chunker + prompt builder',
          instructions: `
1. \`chunk(words, size, overlap)\` — \`words\` is an array of words. Return an array of chunks (each an array of words) of length \`size\`, where each chunk starts \`size - overlap\` words after the previous one. Stop once a chunk reaches the end.

\`chunk(['a','b','c','d','e'], 3, 1)\` → \`[['a','b','c'], ['c','d','e']]\`

2. \`buildPrompt(question, chunks)\` — \`chunks\` are strings. Return:
\`\`\`
Answer the question using only the sources below. If the answer is not in the sources, say "I don't know".

[1] first chunk
[2] second chunk

Question: <question>
\`\`\`
`,
          starter: `function chunk(words, size, overlap) {\n  \n}\n\nfunction buildPrompt(question, chunks) {\n  \n}\n\nconsole.log(chunk('the quick brown fox jumps over the lazy dog'.split(' '), 4, 1))\n`,
          tests: `test('chunks with overlap', () => expect(chunk(['a', 'b', 'c', 'd', 'e'], 3, 1)).toEqual([['a', 'b', 'c'], ['c', 'd', 'e']]))
test('last chunk can be short', () => expect(chunk(['a', 'b', 'c', 'd'], 3, 1)).toEqual([['a', 'b', 'c'], ['c', 'd']]))
test('no overlap', () => expect(chunk(['a', 'b', 'c', 'd'], 2, 0)).toEqual([['a', 'b'], ['c', 'd']]))
test('short input = one chunk', () => expect(chunk(['a'], 5, 2)).toEqual([['a']]))
test('prompt format', () => expect(buildPrompt('Refund window?', ['Refunds within 30 days.', 'Shipping is free.'])).toBe(
  'Answer the question using only the sources below. If the answer is not in the sources, say "I don\\'t know".\\n\\n[1] Refunds within 30 days.\\n[2] Shipping is free.\\n\\nQuestion: Refund window?'))`,
          hint: 'for (let start = 0; ; start += size - overlap) { const c = words.slice(start, start + size); out.push(c); if (start + size >= words.length) break }',
          solution: `function chunk(words, size, overlap) {\n  const out = []\n  for (let start = 0; ; start += size - overlap) {\n    out.push(words.slice(start, start + size))\n    if (start + size >= words.length) break\n  }\n  return out\n}\n\nfunction buildPrompt(question, chunks) {\n  const sources = chunks.map((c, i) => \`[\${i + 1}] \${c}\`).join('\\n')\n  return (\n    'Answer the question using only the sources below. If the answer is not in the sources, say "I don\\'t know".\\n\\n' +\n    sources +\n    '\\n\\nQuestion: ' +\n    question\n  )\n}\n`,
        },
        {
          kind: 'quiz',
          prompt: 'Your RAG bot gives wrong answers. Retrieval returns the right chunk only 40% of the time. What should you fix first?',
          options: [
            'Switch to a bigger LLM',
            'Improve retrieval: chunking, hybrid search, reranking — and measure it with an eval set',
            'Raise the temperature',
            'Make the system prompt longer',
          ],
          answer: 1,
          explain:
            'If the right facts never reach the prompt, no model can answer correctly. Garbage in, garbage out. Measure retrieval quality (did the right chunk appear in the top-k?) separately from answer quality.',
        },
      ],
    },
    {
      id: 'ai-4',
      title: 'Tool Use & Agents',
      minutes: 20,
      steps: [
        {
          kind: 'concept',
          title: 'Letting the model take actions',
          eli5: 'An agent is an AI with a **toolbelt** and a **to-do loop**: think → pick a tool → see the result → think again → … → done.',
          body: `
**Tool use** (function calling): you describe tools to the model (name, description, JSON schema for inputs). Instead of answering directly, the model can reply "call \`get_weather\` with \`{ city: 'Phoenix' }\`". **Your code** runs the tool and sends the result back. The model never executes anything itself.

## The agent loop
\`\`\`
messages = [user question]
loop:
  reply = model(messages, tools)
  if reply wants a tool:
      result = run_tool(reply.tool, reply.input)
      messages += [reply, tool result]
  else:
      return reply.text          // done
\`\`\`
That's it — an **agent** is a model in a loop with tools. Claude Code (the thing that helped you build stuff!) is this loop with tools like "read file", "edit file" and "run command".

## MCP (Model Context Protocol)
An open standard for exposing tools and data to AI apps. Write an MCP server once (e.g. "query our Postgres", "search Jira") and any MCP-compatible client can use it.

## Guardrails
Cap the number of loop iterations, validate tool inputs, require human approval for dangerous actions, and log everything.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Write the agent loop',
          instructions: `
Write \`async function runAgent(model, tools, question, maxSteps = 5)\`:
- \`model(messages)\` returns either \`{ type: 'tool', name, input }\` or \`{ type: 'text', text }\`.
- \`tools\` is an object of async functions: \`tools[name](input)\`.
- Start with \`messages = [{ role: 'user', content: question }]\`.
- On a tool call: push \`{ role: 'assistant', content: reply }\`, run the tool, push \`{ role: 'tool', name, content: result }\`, and loop.
- Unknown tool → push \`{ role: 'tool', name, content: 'Error: unknown tool' }\` and keep going.
- On text: return the text. If you hit \`maxSteps\` model calls, return \`'Stopped: too many steps'\`.
`,
          starter: `async function runAgent(model, tools, question, maxSteps = 5) {\n  const messages = [{ role: 'user', content: question }]\n  \n}\n`,
          tests: `const tools = { add: async ({ a, b }) => a + b, weather: async ({ city }) => city + ': 41°C ☀️' }
test('answers directly', async () => expect(await runAgent(async () => ({ type: 'text', text: 'hi' }), tools, 'hello')).toBe('hi'))
test('uses a tool then answers', async () => {
  const model = async (msgs) => {
    const last = msgs[msgs.length - 1]
    if (last.role === 'user') return { type: 'tool', name: 'weather', input: { city: 'Phoenix' } }
    return { type: 'text', text: 'It is ' + last.content }
  }
  expect(await runAgent(model, tools, 'weather?')).toBe('It is Phoenix: 41°C ☀️')
})
test('chains tools', async () => {
  let calls = 0
  const model = async (msgs) => {
    calls++
    if (calls === 1) return { type: 'tool', name: 'add', input: { a: 2, b: 3 } }
    if (calls === 2) return { type: 'tool', name: 'add', input: { a: msgs[msgs.length - 1].content, b: 10 } }
    return { type: 'text', text: String(msgs[msgs.length - 1].content) }
  }
  expect(await runAgent(model, tools, '(2+3)+10')).toBe('15')
})
test('unknown tool is reported back', async () => {
  let saw = null
  const model = async (msgs) => {
    const last = msgs[msgs.length - 1]
    if (last.role === 'user') return { type: 'tool', name: 'nope', input: {} }
    saw = last.content
    return { type: 'text', text: 'ok' }
  }
  await runAgent(model, tools, 'x')
  expect(saw).toBe('Error: unknown tool')
})
test('stops runaway loops', async () => {
  expect(await runAgent(async () => ({ type: 'tool', name: 'add', input: { a: 1, b: 1 } }), tools, 'loop', 3)).toBe('Stopped: too many steps')
})`,
          hint: 'for (let step = 0; step < maxSteps; step++) { const reply = await model(messages); if (reply.type === "text") return reply.text; ... } return "Stopped: too many steps"',
          solution: `async function runAgent(model, tools, question, maxSteps = 5) {\n  const messages = [{ role: 'user', content: question }]\n  for (let step = 0; step < maxSteps; step++) {\n    const reply = await model(messages)\n    if (reply.type === 'text') return reply.text\n    messages.push({ role: 'assistant', content: reply })\n    const tool = tools[reply.name]\n    const result = tool ? await tool(reply.input) : 'Error: unknown tool'\n    messages.push({ role: 'tool', name: reply.name, content: result })\n  }\n  return 'Stopped: too many steps'\n}\n`,
        },
      ],
    },
    {
      id: 'ai-5',
      title: 'BOSS: Build a Mini Search Engine',
      boss: true,
      minutes: 25,
      steps: [
        {
          kind: 'concept',
          title: 'Keyword search: the other half of hybrid search',
          eli5: 'TF-IDF says: a word that shows up **a lot in one doc** but **rarely elsewhere** is a strong clue. "the" is everywhere, so it\'s useless; "refund" is rare, so it\'s gold.',
          body: `
Before embeddings, search engines ranked documents with **TF-IDF** (and its successor **BM25**, still used everywhere today, often combined with vectors):

- **TF** (term frequency) — a word that appears often in a document is probably important to it
- **IDF** (inverse document frequency) — a word that appears in *every* document ("the") tells you nothing

\`\`\`
tf(word, doc)  = count of word in doc / words in doc
idf(word)      = Math.log(totalDocs / docsContainingWord)
score(query, doc) = sum over query words of tf × idf
\`\`\`
Keyword search nails exact terms (error codes, names, SKUs); embeddings nail meaning. Production RAG uses both.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'TF-IDF search',
          instructions: `
Write \`search(docs, query)\` where \`docs\` is \`[{ id, text }]\`.

- Tokenize: lowercase, then split on anything that isn't a letter or digit (\`/[^a-z0-9]+/\`), dropping empty strings.
- Score each doc with the TF-IDF formula above (skip query words that appear in no docs).
- Return the ids of docs with score > 0, best first.
`,
          starter: `function tokenize(text) {\n  \n}\n\nfunction search(docs, query) {\n  \n}\n\nconst docs = [\n  { id: 'reset', text: 'How to reset your password if you forgot it' },\n  { id: 'billing', text: 'Update your billing details and payment method' },\n  { id: 'login', text: 'Login problems: password errors and two-factor codes' },\n]\nconsole.log(search(docs, 'forgot password'))\n`,
          tests: `const docs = [
  { id: 'reset', text: 'How to reset your password if you forgot it' },
  { id: 'billing', text: 'Update your billing details and payment method' },
  { id: 'login', text: 'Login problems: password errors and two-factor codes' },
]
test('tokenize', () => expect(tokenize('Two-Factor CODES!')).toEqual(['two', 'factor', 'codes']))
test('rare words rank higher', () => expect(search(docs, 'forgot password')).toEqual(['reset', 'login']))
test('billing', () => expect(search(docs, 'payment')).toEqual(['billing']))
test('no match', () => expect(search(docs, 'pizza')).toEqual([]))
test('words in every doc score 0', () => expect(search([{ id: 'a', text: 'x y' }, { id: 'b', text: 'x z' }], 'x')).toEqual([]))`,
          hint: 'Pre-tokenize every doc. df[word] = number of docs containing it. For each doc: score = Σ (count(word)/doc.length) * Math.log(N / df[word]). Filter score > 0, sort desc.',
          solution: `function tokenize(text) {\n  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)\n}\n\nfunction search(docs, query) {\n  const tokenized = docs.map((d) => ({ id: d.id, words: tokenize(d.text) }))\n  const df = {}\n  for (const d of tokenized) for (const w of new Set(d.words)) df[w] = (df[w] ?? 0) + 1\n  const N = docs.length\n  return tokenized\n    .map((d) => {\n      let score = 0\n      for (const q of tokenize(query)) {\n        if (!df[q]) continue\n        const tf = d.words.filter((w) => w === q).length / d.words.length\n        score += tf * Math.log(N / df[q])\n      }\n      return { id: d.id, score }\n    })\n    .filter((d) => d.score > 0)\n    .sort((a, b) => b.score - a.score)\n    .map((d) => d.id)\n}\n`,
        },
      ],
    },
  ],
  comingSoon: [
    'Prompt engineering that actually works',
    'Structured outputs & JSON schemas',
    'Streaming responses into a React UI',
    'Build a real RAG app with pgvector',
    'Evals: measuring LLM apps like you measure code',
    'Build an MCP server',
    'Fine-tuning vs RAG vs prompting',
    'AI safety: prompt injection & guardrails',
    'Using AI as a learning partner (not a crutch)',
  ],
}
