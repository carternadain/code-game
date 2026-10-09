import type { Lesson, QuizStep, Realm, VisualStep } from '../types'
import { ai } from './ai'
import { algorithms } from './algorithms'
import { aws } from './aws'
import { debugging, devops, git, security } from './bonus'
import { csFundamentals } from './csFundamentals'
import { javascript } from './javascript'
import { migrations } from './migrations'
import { powerOn } from './powerOn'
import { python } from './python'
import { react } from './react'
import { servers } from './servers'
import { sql } from './sql'
import { systemDesign } from './systemDesign'
import { typescript } from './typescript'
import {
  alembicVisual,
  binarySearchVisual,
  callStackVisual,
  eventLoopVisual,
  hashMapVisual,
  joinVisual,
  ragVisual,
  reactStateVisual,
  referencesVisual,
  requestVisual,
} from './visuals'

/** Animated step-throughs, shown right after each lesson's first concept card. */
const VISUALS: Record<string, VisualStep> = {
  'js-4': referencesVisual,
  'cs-2': callStackVisual,
  'cs-4': eventLoopVisual,
  'react-2': reactStateVisual,
  'sql-3': joinVisual,
  'alembic-2': alembicVisual,
  'dsa-2': hashMapVisual,
  'dsa-4': binarySearchVisual,
  'srv-1': requestVisual,
  'ai-3': ragVisual,
}
for (const realm of [javascript, csFundamentals, react, sql, migrations, algorithms, servers, ai]) {
  for (const lesson of realm.lessons) {
    const visual = VISUALS[lesson.id]
    if (visual && !lesson.steps.includes(visual)) lesson.steps.splice(1, 0, visual)
  }
}

/** Realms in suggested order. Everything is open — this order is a recommendation, not a lock. */
export const REALMS: Realm[] = [
  powerOn,
  javascript,
  csFundamentals,
  git,
  typescript,
  react,
  debugging,
  python,
  sql,
  migrations,
  algorithms,
  servers,
  security,
  devops,
  systemDesign,
  aws,
  ai,
]

export const ALL_LESSONS: { realm: Realm; lesson: Lesson }[] = REALMS.flatMap((realm) => realm.lessons.map((lesson) => ({ realm, lesson })))

export function findLesson(id: string) {
  return ALL_LESSONS.find((x) => x.lesson.id === id)
}

/** Look up a quiz by its review-card id (`lessonId#stepIndex`). */
export function findQuiz(cardId: string): { realm: Realm; lesson: Lesson; quiz: QuizStep } | undefined {
  const [lessonId, idx] = cardId.split('#')
  const found = findLesson(lessonId)
  const step = found?.lesson.steps[Number(idx)]
  return found && step?.kind === 'quiz' ? { ...found, quiz: step } : undefined
}

/** The first lesson you haven't finished, in suggested order. */
export function nextLesson(completed: Record<string, unknown>) {
  return ALL_LESSONS.find((x) => !completed[x.lesson.id])
}
