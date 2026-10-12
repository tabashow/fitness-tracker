import { endOfMonth } from 'date-fns'
import type { DateKey, Workout } from './types'
import { daysOfWeek, shiftWeeks, toDateKey, weekStartOf } from './week'
import { isAerobic } from './weeklySummary'

/** 月間カレンダーの週ごとの日付（月曜始まり。前後の月の日も含めて 7 日 × n 週） */
export function monthGrid(year: number, month: number): DateKey[][] {
  const first = toDateKey(new Date(year, month, 1))
  const last = toDateKey(endOfMonth(new Date(year, month, 1)))
  const weeks: DateKey[][] = []
  for (let w = weekStartOf(first); w <= last; w = shiftWeeks(w, 1)) {
    weeks.push(daysOfWeek(w))
  }
  return weeks
}

export interface DayActivity {
  minutes: number
  aerobic: boolean
  strength: boolean
}

/** 日付ごとの運動内容。記録のない日は含まない */
export function activityByDay(workouts: Workout[]): Map<DateKey, DayActivity> {
  const map = new Map<DateKey, DayActivity>()
  for (const w of workouts) {
    const day = map.get(w.date) ?? { minutes: 0, aerobic: false, strength: false }
    day.minutes += w.minutes
    day.aerobic ||= isAerobic(w)
    day.strength ||= w.kind === 'strength'
    map.set(w.date, day)
  }
  return map
}
