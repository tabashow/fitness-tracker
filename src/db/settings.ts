import { defaultSettings } from '../domain/defaults'
import { setGoalsFrom } from '../domain/goals'
import type { Goals, Settings } from '../domain/types'
import { toDateKey, weekStartOf } from '../domain/week'
import { db } from './schema'

export async function getSettings(): Promise<Settings> {
  return (await db.settings.get('singleton')) ?? defaultSettings(weekStartOf(toDateKey(new Date())))
}

export async function updateSettings(patch: Partial<Omit<Settings, 'id' | 'goalsHistory'>>): Promise<void> {
  await db.transaction('rw', db.settings, async () => {
    await db.settings.put({ ...(await getSettings()), ...patch })
  })
}

/** 今週から新しい目標を適用する。過去の週の判定は変わらない */
export async function changeGoals(goals: Goals, today: string): Promise<void> {
  await db.transaction('rw', db.settings, async () => {
    const settings = await getSettings()
    await db.settings.put({ ...settings, goalsHistory: setGoalsFrom(settings.goalsHistory, weekStartOf(today), goals) })
  })
}
