/** All game state. Lives in localStorage — no account, no server. */

export interface ReviewCard {
  /** `${lessonId}#${stepIndex}` */
  id: string
  due: string
  intervalDays: number
}

export interface Progress {
  xp: number
  gems: number
  combo: number
  streak: number
  bestStreak: number
  lastActiveDay: string | null
  freezes: number
  completed: Record<string, { day: string; perfect: boolean }>
  /** Steps finished inside lessons still in progress, so you can resume. */
  stepProgress: Record<string, number>
  minutesByDay: Record<string, number>
  review: ReviewCard[]
  achievements: string[]
  journal: Record<string, string>
  drafts: Record<string, string>
  /** Day of the last exported backup file. */
  lastBackup?: string
  stats: { codePasses: number; noHintPasses: number; langsPassed: string[]; bossesBeaten: number; quizRight: number }
}

export const today = (d = new Date()) => {
  const z = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}
export const addDays = (day: string, n: number) => {
  const [y, m, d] = day.split('-').map(Number)
  return today(new Date(y, m - 1, d + n))
}

export const initialProgress = (): Progress => ({
  xp: 0,
  gems: 20,
  combo: 0,
  streak: 0,
  bestStreak: 0,
  lastActiveDay: null,
  freezes: 0,
  completed: {},
  stepProgress: {},
  minutesByDay: {},
  review: [],
  achievements: [],
  journal: {},
  drafts: {},
  stats: { codePasses: 0, noHintPasses: 0, langsPassed: [], bossesBeaten: 0, quizRight: 0 },
})

const KEY = 'code-quest:v1'

export function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initialProgress(), ...JSON.parse(raw) }
  } catch {
    /* private mode or corrupted — start fresh */
  }
  return initialProgress()
}

export function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage full or blocked — progress just won't persist */
  }
}

// ---------- Levels ----------

const TITLES = [
  'Noob',
  'Button Masher',
  'Script Kiddie',
  'Console Logger',
  'Bug Squasher',
  'Junior Dev',
  'Code Wrangler',
  'Stack Tracer',
  'Full-Stack Adventurer',
  'Query Wizard',
  'Algorithm Ace',
  'Mid-Level Mage',
  'Systems Thinker',
  'Cloud Captain',
  'Senior Sorcerer',
  'Architect',
  'Staff Legend',
]

/** Level n needs 60·n² total XP — early levels come fast, later ones take real work. */
export const xpForLevel = (level: number) => 60 * (level - 1) ** 2
export const levelFor = (xp: number) => Math.floor(Math.sqrt(xp / 60)) + 1
export const titleFor = (level: number) => TITLES[Math.min(level - 1, TITLES.length - 1)]

// ---------- Streaks ----------

/** Call on any meaningful activity. Handles streak growth, breaks and freezes. */
export function touchStreak(p: Progress): Progress {
  const t = today()
  if (p.lastActiveDay === t) return p
  let { streak, freezes } = p
  if (p.lastActiveDay === addDays(t, -1)) streak += 1
  else if (p.lastActiveDay === addDays(t, -2) && freezes > 0) {
    freezes -= 1
    streak += 1
  } else streak = 1
  return { ...p, streak, freezes, bestStreak: Math.max(p.bestStreak, streak), lastActiveDay: t }
}

/** Streak as it stands right now (it's broken if you missed yesterday and have no freeze). */
export function liveStreak(p: Progress): number {
  if (!p.lastActiveDay) return 0
  const t = today()
  if (p.lastActiveDay === t || p.lastActiveDay === addDays(t, -1)) return p.streak
  if (p.lastActiveDay === addDays(t, -2) && p.freezes > 0) return p.streak
  return 0
}

// ---------- Spaced repetition ----------

/** Wrong answers come back tomorrow; right answers come back later and later (1 → 3 → 7 → 17 days…). */
export function scheduleReview(p: Progress, id: string, correct: boolean): Progress {
  const existing = p.review.find((c) => c.id === id)
  const interval = correct ? Math.max(1, Math.round((existing?.intervalDays ?? 1) * 2.5)) : 1
  const card = { id, due: addDays(today(), interval), intervalDays: interval }
  return { ...p, review: [...p.review.filter((c) => c.id !== id), card] }
}

export const dueReviews = (p: Progress) => p.review.filter((c) => c.due <= today())

// ---------- Achievements ----------

export interface Achievement {
  id: string
  icon: string
  name: string
  desc: string
  check: (p: Progress) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', icon: '🌱', name: 'Hello, World', desc: 'Finish your first lesson', check: (p) => Object.keys(p.completed).length >= 1 },
  { id: 'first-run', icon: '▶️', name: 'It Compiles!', desc: 'Pass your first coding challenge', check: (p) => p.stats.codePasses >= 1 },
  { id: 'streak-3', icon: '🔥', name: 'Warming Up', desc: '3-day streak', check: (p) => p.bestStreak >= 3 },
  { id: 'streak-7', icon: '🔥', name: 'On Fire', desc: '7-day streak', check: (p) => p.bestStreak >= 7 },
  { id: 'streak-30', icon: '☄️', name: 'Unstoppable', desc: '30-day streak', check: (p) => p.bestStreak >= 30 },
  { id: 'streak-100', icon: '👑', name: 'Habit Formed', desc: '100-day streak', check: (p) => p.bestStreak >= 100 },
  { id: 'no-ai-10', icon: '🧠', name: 'Raw Brainpower', desc: 'Pass 10 challenges without hints', check: (p) => p.stats.noHintPasses >= 10 },
  { id: 'polyglot', icon: '🗣️', name: 'Polyglot', desc: 'Pass challenges in 4 languages', check: (p) => p.stats.langsPassed.length >= 4 },
  { id: 'boss-1', icon: '🐉', name: 'Boss Slayer', desc: 'Defeat a realm boss', check: (p) => p.stats.bossesBeaten >= 1 },
  { id: 'boss-5', icon: '⚔️', name: 'Dragon Hunter', desc: 'Defeat 5 realm bosses', check: (p) => p.stats.bossesBeaten >= 5 },
  { id: 'feynman', icon: '🎓', name: 'Feynman Mode', desc: 'Explain 5 concepts in your own words', check: (p) => Object.keys(p.journal).length >= 5 },
  { id: 'quiz-50', icon: '🎯', name: 'Sharpshooter', desc: 'Answer 50 quiz questions right', check: (p) => p.stats.quizRight >= 50 },
  { id: 'level-5', icon: '⭐', name: 'Junior Dev', desc: 'Reach level 6', check: (p) => levelFor(p.xp) >= 6 },
  { id: 'level-10', icon: '🌟', name: 'Mid-Level', desc: 'Reach level 12', check: (p) => levelFor(p.xp) >= 12 },
]

export function newAchievements(p: Progress): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !p.achievements.includes(a.id) && a.check(p))
}
