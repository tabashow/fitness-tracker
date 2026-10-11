import type { DateKey, GoalsEntry, Workout } from './types'
import { shiftWeeks, weekStartOf } from './week'
import { summarizeWeek } from './weeklySummary'

export interface Streak {
  /** 連続達成週数（今週が達成済みなら今週も含む） */
  current: number
  /** 今週すでに主目標を達成したか。未達でも今週は進行中なので途切れ扱いにしない */
  thisWeekAchieved: boolean
  /** 過去最長 */
  best: number
}

/** ストリークは「運動日数の目標を達成した週」の連続数 */
export function computeStreak(
  workouts: Workout[],
  goalsHistory: GoalsEntry[],
  today: DateKey,
): Streak {
  const thisWeek = weekStartOf(today)
  const achieved = (weekStart: DateKey) =>
    summarizeWeek(workouts, weekStart, goalsHistory).activeDaysMet

  const thisWeekAchieved = achieved(thisWeek)

  let current = thisWeekAchieved ? 1 : 0
  for (let w = shiftWeeks(thisWeek, -1); achieved(w); w = shiftWeeks(w, -1)) {
    current++
  }

  const best = Math.max(current, bestStreak(workouts, goalsHistory, thisWeek))
  return { current, thisWeekAchieved, best }
}

function bestStreak(workouts: Workout[], goalsHistory: GoalsEntry[], thisWeek: DateKey): number {
  if (workouts.length === 0) return 0
  const earliest = workouts.reduce((min, w) => (w.date < min ? w.date : min), workouts[0].date)
  let best = 0
  let run = 0
  for (let w = weekStartOf(earliest); w <= thisWeek; w = shiftWeeks(w, 1)) {
    if (summarizeWeek(workouts, w, goalsHistory).activeDaysMet) {
      run++
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }
  return best
}
