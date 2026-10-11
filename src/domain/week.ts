import { addDays, addWeeks, format, parseISO, startOfWeek } from 'date-fns'
import type { DateKey } from './types'

/** 週は月曜始まり */
const WEEK_OPTIONS = { weekStartsOn: 1 } as const

export function toDateKey(date: Date): DateKey {
  return format(date, 'yyyy-MM-dd')
}

export function fromDateKey(key: DateKey): Date {
  return parseISO(key)
}

/** その日を含む週の月曜日 */
export function weekStartOf(key: DateKey): DateKey {
  return toDateKey(startOfWeek(fromDateKey(key), WEEK_OPTIONS))
}

export function shiftWeeks(weekStart: DateKey, weeks: number): DateKey {
  return toDateKey(addWeeks(fromDateKey(weekStart), weeks))
}

export function shiftDays(key: DateKey, days: number): DateKey {
  return toDateKey(addDays(fromDateKey(key), days))
}

/** 週の 7 日分（月〜日） */
export function daysOfWeek(weekStart: DateKey): DateKey[] {
  return Array.from({ length: 7 }, (_, i) => shiftDays(weekStart, i))
}

export function weekEndOf(weekStart: DateKey): DateKey {
  return shiftDays(weekStart, 6)
}

export function isInWeek(key: DateKey, weekStart: DateKey): boolean {
  // DateKey は辞書順 = 日付順
  return key >= weekStart && key <= weekEndOf(weekStart)
}
