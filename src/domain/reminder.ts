import { differenceInCalendarDays } from 'date-fns'
import type { DateKey, Workout } from './types'
import { fromDateKey, weekEndOf } from './week'
import type { WeeklySummary } from './weeklySummary'

export interface ReminderInput {
  workouts: Workout[]
  today: DateKey
  /** 現在時刻（0〜23） */
  hour: number
  reminderHour: number
  summary: WeeklySummary
}

/**
 * 「今日まだ動いていない」日に控えめなメッセージを返す。表示不要なら null。
 */
export function getReminder({ workouts, today, hour, reminderHour, summary }: ReminderInput): string | null {
  if (hour < reminderHour) return null
  if (workouts.some((w) => w.date === today)) return null

  // 今日を含む残り日数
  const daysLeft = differenceInCalendarDays(fromDateKey(weekEndOf(summary.weekStart)), fromDateKey(today)) + 1
  const daysNeeded = summary.goals.activeDays - summary.activeDays

  if (daysNeeded <= 0) {
    return '今週の目標は達成済み。余裕があれば食後に少し歩くのも◎'
  }
  if (daysNeeded === daysLeft) {
    return `目標まであと${daysNeeded}日。今日動けばまだ届きます`
  }
  return '今日はまだ記録がありません。食後に10分歩きませんか？'
}
