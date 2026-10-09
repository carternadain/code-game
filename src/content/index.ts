import type { Lesson, QuizStep, Realm, VisualStep } from '../types'
import { ai } from './ai'
import { algorithms } from './algorithms'
import { aws } from './aws'
import { debugging, devops, git, security } from './bonus'
import { csFundamentals } from './csFundamentals'
import { graphs, linkedLists, remixDsa, remixJs, remixWeb, sorting } from './dsaMore'
import { pythonSql, sqlWrites, terminal, testing } from './gaps'
import { javascript } from './javascript'
import { migrations } from './migrations'
import { powerOn } from './powerOn'
import { guildParts } from './project'
import { PREREQS } from './graph'
import { python } from './python'
import { react } from './react'
import { servers } from './servers'
import { sql } from './sql'
import { systemDesign } from './systemDesign'
import { thinking } from './thinking'
import { typescript } from './typescript'
import { reactData, web } from './web'
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

/** Puts extra lessons into a realm right after `afterId` (or at the end when it's missing). */
function insertAfter(realm: Realm, afterId: string | undefined, extra: Lesson[]) {
  if (!extra.length || realm.lessons.includes(extra[0])) return
  const at = afterId ? realm.lessons.findIndex((l) => l.id === afterId) : -1
  realm.lessons.splice(at >= 0 ? at + 1 : realm.lessons.length, 0, ...extra)
}
/** Puts extra lessons just before the realm's boss. */
function insertBeforeBoss(realm: Realm, extra: Lesson[]) {
  const boss = realm.lessons.findIndex((l) => l.boss)
  insertAfter(realm, boss > 0 ? realm.lessons[boss - 1].id : undefined, extra)
}
insertBeforeBoss(javascript, remixJs)
insertAfter(sql, 'sql-1', sqlWrites.slice(0, 1))
insertAfter(sql, 'sql-4', sqlWrites.slice(1))
if (pythonSql.length && !migrations.lessons.includes(pythonSql[0])) migrations.lessons.unshift(...pythonSql)
insertAfter(debugging, 'debug-1', testing)
insertAfter(react, 'react-4', reactData)
insertAfter(algorithms, 'dsa-3', [...linkedLists, ...sorting])
insertAfter(algorithms, 'dsa-5', graphs)
insertBeforeBoss(algorithms, remixDsa)
insertBeforeBoss(web, remixWeb)

/** Realms in suggested order. Everything is open — this order is a recommendation, not a lock. */
export const REALMS: Realm[] = [
  powerOn,
  javascript,
  thinking,
  csFundamentals,
  git,
  terminal,
  typescript,
  web,
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

// The Guild Tracker project parts go in last, so `after` can point at any lesson above.
for (const part of guildParts) {
  const realm = REALMS.find((r) => r.id === part.realm)
  if (realm) insertAfter(realm, part.after, [part.lesson])
}

export const ALL_LESSONS: { realm: Realm; lesson: Lesson }[] = REALMS.flatMap((realm) => realm.lessons.map((lesson) => ({ realm, lesson })))

// Every lesson knows what it builds on (inline `uses` wins over the map in graph.ts).
for (const { lesson } of ALL_LESSONS) lesson.uses ??= PREREQS[lesson.id] ?? []

/** Lessons that build directly on `id`. */
export function dependentsOf(id: string) {
  return ALL_LESSONS.filter((x) => x.lesson.uses?.includes(id))
}

/** The Guild Tracker parts, in order, wherever they live in the course. */
export const PROJECT_PARTS = ALL_LESSONS.filter((x) => x.lesson.project).sort((a, b) => a.lesson.project!.part - b.lesson.project!.part)

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
