/**
 * Vercel serverless function: grades a learner's "explain it back" answer with Claude.
 *
 * Setup (Vercel → Project → Settings → Environment Variables):
 *   ANTHROPIC_API_KEY  – required. Without it this returns 503 and the app falls back to the checklist.
 *   FEEDBACK_PASSCODE  – optional. If set, requests must send the same value in the x-passcode header,
 *                        so strangers who find your URL can't spend your API credits.
 */
import Anthropic from '@anthropic-ai/sdk'

const MAX_ANSWER_CHARS = 4000

const FEEDBACK_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'integer', description: '1 = misunderstands it, 3 = partly there, 5 = could teach it' },
    verdict: { type: 'string', description: 'One short, encouraging sentence summing up the explanation.' },
    gotRight: { type: 'array', items: { type: 'string' }, description: 'Specific things the learner explained correctly.' },
    missing: { type: 'array', items: { type: 'string' }, description: 'Key ideas missing or explained wrong, each as a plain-language fix.' },
    tryThis: { type: 'string', description: 'A simple analogy or one-sentence explanation they could use next time.' },
  },
  required: ['score', 'verdict', 'gotRight', 'missing', 'tryThis'],
  additionalProperties: false,
} as const

const SYSTEM = `You are a warm, honest coding tutor grading a beginner's spoken or written explanation of a concept (the Feynman technique).
The learner is a junior developer rebuilding their fundamentals, and a visual learner who likes simple analogies.
Grade understanding, not wording, grammar or filler words (spoken answers are transcribed and messy). Never invent mistakes.
Be specific: quote or paraphrase what they said. Keep every item short and in plain language. Do not write code.`

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'AI feedback is not set up. Add ANTHROPIC_API_KEY in your Vercel project settings.' }, { status: 503 })
  }
  const passcode = process.env.FEEDBACK_PASSCODE
  if (passcode && request.headers.get('x-passcode') !== passcode) {
    return Response.json({ error: 'Wrong or missing passcode.' }, { status: 401 })
  }

  let body: { prompt?: unknown; keyPoints?: unknown; answer?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Send JSON with prompt, keyPoints and answer.' }, { status: 400 })
  }
  const { prompt, keyPoints, answer } = body
  if (typeof prompt !== 'string' || typeof answer !== 'string' || !Array.isArray(keyPoints)) {
    return Response.json({ error: 'Send JSON with prompt, keyPoints and answer.' }, { status: 400 })
  }
  if (!answer.trim()) return Response.json({ error: 'The explanation is empty.' }, { status: 400 })

  const client = new Anthropic()
  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      // Grading a short paragraph is a simple job: low effort keeps it fast and cheap.
      output_config: { effort: 'low', format: { type: 'json_schema', schema: FEEDBACK_SCHEMA } },
      // If a safety classifier declines, let Anthropic re-run the request on its recommended fallback model.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Question the learner was answering:\n${prompt}\n\nA strong answer covers:\n${keyPoints
            .map((k) => `- ${String(k)}`)
            .join('\n')}\n\nThe learner's explanation:\n<explanation>\n${answer.slice(0, MAX_ANSWER_CHARS)}\n</explanation>`,
        },
      ],
    })

    if (response.stop_reason === 'refusal') {
      return Response.json({ error: "Claude couldn't grade this one. Try rephrasing your explanation." }, { status: 422 })
    }
    const text = response.content.find((b) => b.type === 'text')
    if (!text || text.type !== 'text') return Response.json({ error: 'No feedback came back. Try again.' }, { status: 502 })
    return Response.json(JSON.parse(text.text))
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: 'The ANTHROPIC_API_KEY in Vercel is invalid.' }, { status: 500 })
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: 'Too many requests right now. Wait a minute and try again.' }, { status: 429 })
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: `Claude API error (${error.status}). Try again in a bit.` }, { status: 502 })
    }
    return Response.json({ error: 'Something went wrong getting feedback.' }, { status: 500 })
  }
}
