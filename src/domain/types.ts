export type ActivityKind = 'bike' | 'strength' | 'walk' | 'other'
export type Intensity = 'light' | 'moderate' | 'hard'

/** 'YYYY-MM-DD'（ローカル日付） */
export type DateKey = string

export interface Workout {
  id: string
  date: DateKey
  kind: ActivityKind
  minutes: number
  intensity: Intensity
  postMeal: boolean
  /** kind === 'other' のときだけ参照。未指定は有酸素扱い */
  countsAsAerobic?: boolean
  memo?: string
  createdAt: number
  updatedAt: number
}

export interface TemplateItem {
  kind: ActivityKind
  minutes: number
  intensity: Intensity
  postMeal?: boolean
  countsAsAerobic?: boolean
}

export interface Template {
  id: string
  name: string
  items: TemplateItem[]
  order: number
}

export interface Goals {
  aerobicMinutes: number
  activeDays: number
  strengthSessions: number
}

export interface GoalsEntry {
  /** この週（月曜の日付）以降に適用 */
  effectiveFrom: DateKey
  goals: Goals
}

export interface Settings {
  id: 'singleton'
  goalsHistory: GoalsEntry[]
  theme: 'system' | 'light' | 'dark'
  reminderHour: number
}

export const DEFAULT_GOALS: Goals = {
  aerobicMinutes: 150,
  activeDays: 4,
  strengthSessions: 2,
}
