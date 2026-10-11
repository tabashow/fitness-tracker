import { DEFAULT_GOALS, type DateKey, type Goals, type GoalsEntry, type Workout } from './types'
import { isInWeek } from './week'

export interface WeeklySummary {
  weekStart: DateKey
  goals: Goals
  aerobicMinutes: number
  activeDays: number
  strengthSessions: number
  rates: { aerobic: number; activeDays: number; strength: number }
  /** 3 目標の達成率（各 1 が上限）の平均。0〜1 */
  overallRate: number
  /** ストリーク判定に使う主目標（運動日数）の達成 */
  activeDaysMet: boolean
  allMet: boolean
}

export function isAerobic(w: Workout): boolean {
  if (w.kind === 'bike' || w.kind === 'walk') return true
  if (w.kind === 'other') return w.countsAsAerobic !== false
  return false
}

/** その週に適用される目標。effectiveFrom が週開始以前の最新エントリ */
export function goalsForWeek(history: GoalsEntry[], weekStart: DateKey): Goals {
  if (history.length === 0) return DEFAULT_GOALS
  const sorted = [...history].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))
  const applicable = sorted.filter((e) => e.effectiveFrom <= weekStart)
  // 履歴より前の週には最初の目標を当てはめる
  return (applicable.at(-1) ?? sorted[0]).goals
}

function rate(actual: number, goal: number): number {
  if (goal <= 0) return 1
  return Math.min(actual / goal, 1)
}

export function summarizeWeek(
  workouts: Workout[],
  weekStart: DateKey,
  goalsHistory: GoalsEntry[],
): WeeklySummary {
  const goals = goalsForWeek(goalsHistory, weekStart)
  const inWeek = workouts.filter((w) => isInWeek(w.date, weekStart))

  const aerobicMinutes = inWeek.filter(isAerobic).reduce((sum, w) => sum + w.minutes, 0)
  const activeDays = new Set(inWeek.map((w) => w.date)).size
  // 同じ日に筋トレが複数あっても 1 回と数える
  const strengthSessions = new Set(inWeek.filter((w) => w.kind === 'strength').map((w) => w.date))
    .size

  const rates = {
    aerobic: rate(aerobicMinutes, goals.aerobicMinutes),
    activeDays: rate(activeDays, goals.activeDays),
    strength: rate(strengthSessions, goals.strengthSessions),
  }
  const overallRate = (rates.aerobic + rates.activeDays + rates.strength) / 3

  return {
    weekStart,
    goals,
    aerobicMinutes,
    activeDays,
    strengthSessions,
    rates,
    overallRate,
    activeDaysMet: rates.activeDays >= 1,
    allMet: rates.aerobic >= 1 && rates.activeDays >= 1 && rates.strength >= 1,
  }
}
