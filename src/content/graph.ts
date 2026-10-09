import type { Lesson } from '../types'

/**
 * Which earlier lessons each lesson builds on. New lessons set `uses` inline; this map covers the
 * original ones. It powers the warm-up questions, the "Builds on" chips and the skill tree.
 */
export const PREREQS: Record<string, string[]> = {
  'start-2': ['start-1'],
  'start-3': ['start-2'],
  'start-4': ['start-1', 'start-2', 'start-3'],

  'js-b1': ['start-2'],
  'js-b2': ['js-b1'],
  'js-b3': ['js-b2'],
  'js-b4': ['js-b3'],
  'js-b5': ['js-b1', 'js-b3'],
  'js-b6': ['js-b5'],
  'js-b7': ['js-b6'],
  'js-b8': ['js-b2', 'js-b7'],
  'js-2': ['js-b4', 'js-b7'],
  'js-3': ['js-2', 'js-b7'],
  'js-4': ['js-b3', 'js-b4'],
  'js-5': ['js-b7', 'js-4'],

  'think-1': ['js-b7', 'js-2'],
  'think-2': ['think-1'],
  'think-3': ['js-3', 'think-2'],
  'think-4': ['js-3', 'js-4', 'think-3'],
  'think-5': ['js-4', 'think-3'],
  'think-6': ['think-4', 'think-5'],

  'cs-1': ['start-2', 'js-b5'],
  'cs-2': ['js-b7', 'cs-1'],
  'cs-3': ['js-4', 'cs-2'],
  'cs-4': ['cs-2'],
  'cs-5': ['start-1', 'js-b2'],

  'git-1': ['start-3'],

  'ts-1': ['js-b2', 'js-b7'],
  'ts-2': ['ts-1', 'js-4'],
  'ts-3': ['ts-2', 'js-2'],
  'ts-4': ['ts-3', 'js-3'],
  'ts-5': ['ts-3', 'ts-4'],

  'react-1': ['js-b7', 'js-3', 'ts-2'],
  'react-2': ['react-1', 'think-4'],
  'react-3': ['react-2'],
  'react-4': ['react-2', 'cs-4'],
  'react-5': ['react-3', 'react-4'],

  'debug-1': ['js-2', 'cs-2'],

  'py-1': ['js-b7', 'js-2'],
  'py-2': ['py-1', 'js-3'],
  'py-3': ['py-1', 'think-5'],
  'py-4': ['py-2', 'py-3'],

  'sql-1': ['start-3'],
  'sql-2': ['sql-1'],
  'sql-3': ['sql-1', 'sql-2'],
  'sql-4': ['sql-1', 'sql-2'],
  'sql-5': ['sql-2', 'sql-3'],

  'alembic-1': ['sql-1', 'git-1'],
  'alembic-2': ['alembic-1', 'py-1'],
  'alembic-3': ['alembic-2'],
  'alembic-4': ['alembic-3', 'py-2'],

  'dsa-1': ['js-2', 'think-1'],
  'dsa-2': ['dsa-1', 'js-4'],
  'dsa-3': ['dsa-1', 'cs-2'],
  'dsa-4': ['dsa-1'],
  'dsa-5': ['dsa-3', 'cs-2'],
  'dsa-6': ['dsa-3', 'dsa-5'],

  'srv-1': ['start-3'],
  'srv-2': ['srv-1', 'js-4'],
  'srv-3': ['srv-2', 'js-5'],
  'srv-4': ['srv-3', 'dsa-2'],

  'sec-1': ['sql-1', 'srv-1'],
  'ops-1': ['git-1', 'srv-1'],

  'sd-1': ['srv-1', 'sql-4'],
  'sd-2': ['sd-1', 'dsa-2'],
  'sd-3': ['sd-1', 'sql-4'],
  'sd-4': ['sd-1', 'cs-4'],
  'sd-5': ['sd-2', 'sd-3', 'sd-4'],

  'aws-1': ['sd-1'],
  'aws-2': ['aws-1', 'js-4'],
  'aws-3': ['aws-1', 'srv-2'],
  'aws-4': ['aws-2', 'aws-3', 'sd-5'],

  'ai-1': ['dsa-2', 'srv-1'],
  'ai-2': ['ai-1', 'js-3'],
  'ai-3': ['ai-2'],
  'ai-4': ['ai-1', 'srv-2'],
  'ai-5': ['ai-2', 'ai-3'],
}

/** The lessons that `lesson` builds on (inline `uses` first, then the map above). */
export function prereqIds(lesson: Lesson): string[] {
  return lesson.uses ?? PREREQS[lesson.id] ?? []
}
