import type { DateKey, Goals, GoalsEntry } from './types'

export const GOAL_LIMITS: Record<keyof Goals, { min: number; max: number }> = {
  aerobicMinutes: { min: 0, max: 2000 },
  activeDays: { min: 0, max: 7 },
  strengthSessions: { min: 0, max: 7 },
}

export function isValidGoals(goals: Goals): boolean {
  return (Object.keys(GOAL_LIMITS) as (keyof Goals)[]).every((key) => {
    const v = goals[key]
    return Number.isInteger(v) && v >= GOAL_LIMITS[key].min && v <= GOAL_LIMITS[key].max
  })
}

/**
 * weekStart の週から新しい目標を適用する。過去の週の判定は変えない。
 * 同じ週以降のエントリは置き換える（同じ週に何度変えても最後の値だけ残る）。
 */
export function setGoalsFrom(history: GoalsEntry[], weekStart: DateKey, goals: Goals): GoalsEntry[] {
  if (!isValidGoals(goals)) throw new RangeError('目標値が範囲外です')
  return [...history.filter((e) => e.effectiveFrom < weekStart), { effectiveFrom: weekStart, goals }].sort((a, b) =>
    a.effectiveFrom.localeCompare(b.effectiveFrom),
  )
}
