import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './schema'
import { listTemplates } from './templates'
import { addFromTemplate, addWorkout, deleteWorkouts, workoutsBetween, workoutsOn } from './workouts'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('初期データ', () => {
  it('初回起動でテンプレートと設定が入る', async () => {
    const templates = await listTemplates()
    expect(templates.map((t) => t.name)).toEqual(['いつものジム', '食後ウォーク'])
    const settings = await db.settings.get('singleton')
    expect(settings?.goalsHistory[0].goals).toEqual({ aerobicMinutes: 150, activeDays: 4, strengthSessions: 2 })
  })
})

describe('記録の追加と取り消し', () => {
  it('追加した記録をその日の記録として取得できる', async () => {
    await addWorkout({ date: '2026-10-12', kind: 'walk', minutes: 20 })
    await addWorkout({ date: '2026-10-13', kind: 'bike', minutes: 30 })
    expect((await workoutsOn('2026-10-12')).map((w) => w.kind)).toEqual(['walk'])
  })

  it('テンプレートで複数件まとめて追加し、取り消しで全部消える', async () => {
    const [gym] = await listTemplates()
    const added = await addFromTemplate(gym, '2026-10-12')
    expect(await db.workouts.count()).toBe(2)
    await deleteWorkouts(added.map((w) => w.id))
    expect(await db.workouts.count()).toBe(0)
  })

  it('期間指定は両端を含む', async () => {
    for (const date of ['2026-10-11', '2026-10-12', '2026-10-18', '2026-10-19']) {
      await addWorkout({ date, kind: 'walk', minutes: 10 })
    }
    const ws = await workoutsBetween('2026-10-12', '2026-10-18')
    expect(ws.map((w) => w.date).sort()).toEqual(['2026-10-12', '2026-10-18'])
  })
})
