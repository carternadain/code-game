/** Client for /api/feedback (the Vercel function that asks Claude to grade an explanation). */

export interface Feedback {
  score: number
  verdict: string
  gotRight: string[]
  missing: string[]
  tryThis: string
}

export type FeedbackResult = { ok: true; feedback: Feedback } | { ok: false; reason: 'not-set-up' | 'passcode' | 'error'; message: string }

const PASS_KEY = 'code-quest:passcode'

export function getPasscode(): string {
  try {
    return localStorage.getItem(PASS_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setPasscode(value: string) {
  try {
    localStorage.setItem(PASS_KEY, value)
  } catch {
    /* storage blocked: you'll be asked again next time */
  }
}

export async function requestFeedback(prompt: string, keyPoints: string[], answer: string): Promise<FeedbackResult> {
  let res: Response
  try {
    res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-passcode': getPasscode() },
      body: JSON.stringify({ prompt, keyPoints, answer }),
    })
  } catch {
    return { ok: false, reason: 'error', message: "Couldn't reach the feedback server. Check your connection." }
  }
  // Running locally with `npm run dev` there is no /api route: the dev server answers with the app's HTML.
  const isJson = res.headers.get('content-type')?.includes('application/json')
  if (res.status === 404 || res.status === 503 || !isJson) {
    return { ok: false, reason: 'not-set-up', message: "AI feedback isn't set up yet." }
  }
  const data = await res.json().catch(() => null)
  if (res.status === 401) return { ok: false, reason: 'passcode', message: data?.error ?? 'Passcode needed.' }
  if (!res.ok || !data || typeof data.score !== 'number') {
    return { ok: false, reason: 'error', message: data?.error ?? 'Something went wrong getting feedback.' }
  }
  return { ok: true, feedback: data as Feedback }
}
