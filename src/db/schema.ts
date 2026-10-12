import Dexie, { type EntityTable } from 'dexie'
import { DEFAULT_TEMPLATES, defaultSettings } from '../domain/defaults'
import type { Settings, Template, Workout } from '../domain/types'
import { toDateKey, weekStartOf } from '../domain/week'

export class AppDB extends Dexie {
  workouts!: EntityTable<Workout, 'id'>
  templates!: EntityTable<Template, 'id'>
  settings!: EntityTable<Settings, 'id'>

  constructor(name = 'undo-log') {
    super(name)
    // スキーマを変えるときは version を上げて追記する（既存の定義は書き換えない）
    this.version(1).stores({
      workouts: 'id, date, kind',
      templates: 'id, order',
      settings: 'id',
    })
    this.on('populate', async (tx) => {
      await tx.table('templates').bulkAdd(DEFAULT_TEMPLATES)
      await tx.table('settings').add(defaultSettings(weekStartOf(toDateKey(new Date()))))
    })
  }
}

export const db = new AppDB()
