import { newId } from './id'
import type { ActivityKind, DateKey, Intensity, Template, Workout } from './types'

export const MAX_MINUTES = 600

export interface WorkoutInput {
  date: DateKey
  kind: ActivityKind
  minutes: number
  intensity?: Intensity
  postMeal?: boolean
  countsAsAerobic?: boolean
  memo?: string
}

export function isValidMinutes(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= MAX_MINUTES
}

export function createWorkout(input: WorkoutInput, now: number = Date.now(), id: string = newId()): Workout {
  if (!isValidMinutes(input.minutes)) {
    throw new RangeError(`minutes は 1〜${MAX_MINUTES} の整数: ${input.minutes}`)
  }
  const memo = input.memo?.trim()
  return {
    id,
    date: input.date,
    kind: input.kind,
    minutes: input.minutes,
    intensity: input.intensity ?? 'moderate',
    postMeal: input.postMeal ?? false,
    // その他以外では意味を持たないので保存しない
    ...(input.kind === 'other' ? { countsAsAerobic: input.countsAsAerobic ?? true } : {}),
    ...(memo ? { memo } : {}),
    createdAt: now,
    updatedAt: now,
  }
}

/** テンプレートの各項目から、その日の記録を作る。並び順を保つため createdAt を 1ms ずつずらす */
export function workoutsFromTemplate(template: Template, date: DateKey, now: number = Date.now()): Workout[] {
  return template.items.map((item, i) => createWorkout({ ...item, date }, now + i))
}

export type WorkoutPatch = Partial<Omit<WorkoutInput, 'date'>> & { date?: DateKey }

/** 既存の記録を編集する。検証と正規化は新規作成と同じルール */
export function updateWorkout(workout: Workout, patch: WorkoutPatch, now: number = Date.now()): Workout {
  const merged = { ...workout, ...patch }
  return { ...createWorkout(merged, workout.createdAt, workout.id), updatedAt: now }
}
