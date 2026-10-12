import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { getSettings } from '../db/settings'
import { listTemplates } from '../db/templates'
import { allWorkouts, workoutsNewestFirst, workoutsOn } from '../db/workouts'
import { computeStreak } from '../domain/streak'
import type { DateKey } from '../domain/types'
import { weekStartOf } from '../domain/week'
import { summarizeWeek } from '../domain/weeklySummary'

export function useTemplates() {
  return useLiveQuery(listTemplates, [])
}

export function useWorkoutsOn(date: DateKey) {
  return useLiveQuery(() => workoutsOn(date), [date])
}

export function useAllWorkouts() {
  return useLiveQuery(allWorkouts, [])
}

export function useWorkoutsNewestFirst() {
  return useLiveQuery(workoutsNewestFirst, [])
}

export function useSettings() {
  return useLiveQuery(getSettings, [])
}

/** ホームに出す今週の集計とストリーク。個人利用で件数は少ないので全件から計算する */
export function useWeekStats(today: DateKey) {
  const workouts = useAllWorkouts()
  const settings = useSettings()
  return useMemo(() => {
    if (!workouts || !settings) return undefined
    const summary = summarizeWeek(workouts, weekStartOf(today), settings.goalsHistory)
    const streak = computeStreak(workouts, settings.goalsHistory, today)
    return { workouts, settings, summary, streak }
  }, [workouts, settings, today])
}
