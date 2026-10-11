import type { ActivityKind, DateKey, Workout } from './types'

let seq = 0

/** テスト用の Workout を最小限の指定で作る */
export function workout(date: DateKey, kind: ActivityKind, minutes = 30, extra: Partial<Workout> = {}): Workout {
  seq++
  return {
    id: `w${seq}`,
    date,
    kind,
    minutes,
    intensity: 'moderate',
    postMeal: false,
    createdAt: 0,
    updatedAt: 0,
    ...extra,
  }
}
