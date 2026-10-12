import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { exportBackup, importBackup } from './backup'
import { db } from './schema'
import { changeGoals, getSettings, updateSettings } from './settings'
import { deleteTemplate, listTemplates, moveTemplate, saveTemplate } from './templates'
import { addWorkout, editWorkout } from './workouts'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('設定', () => {
  it('テーマなどを部分更新できる', async () => {
    await updateSettings({ theme: 'dark', reminderHour: 20 })
    expect(await getSettings()).toMatchObject({ theme: 'dark', reminderHour: 20 })
  })

  it('目標変更は今週の月曜から適用される', async () => {
    await changeGoals({ aerobicMinutes: 180, activeDays: 5, strengthSessions: 2 }, '2099-01-07') // 水曜
    const { goalsHistory } = await getSettings()
    expect(goalsHistory.at(-1)).toEqual({
      effectiveFrom: '2099-01-05',
      goals: { aerobicMinutes: 180, activeDays: 5, strengthSessions: 2 },
    })
  })
})

describe('テンプレート', () => {
  it('追加は末尾、並べ替え、削除', async () => {
    await saveTemplate({ name: ' 朝ウォーク ', items: [{ kind: 'walk', minutes: 20, intensity: 'light' }] })
    let names = (await listTemplates()).map((t) => t.name)
    expect(names).toEqual(['いつものジム', '食後ウォーク', '朝ウォーク'])

    const added = (await listTemplates())[2]
    await moveTemplate(added.id, -1)
    names = (await listTemplates()).map((t) => t.name)
    expect(names).toEqual(['いつものジム', '朝ウォーク', '食後ウォーク'])

    await moveTemplate((await listTemplates())[0].id, -1) // 先頭より前へは動かない
    expect((await listTemplates())[0].name).toBe('いつものジム')

    await deleteTemplate(added.id)
    expect(await listTemplates()).toHaveLength(2)
  })

  it('既存テンプレートの編集は順番を保つ', async () => {
    const [gym] = await listTemplates()
    await saveTemplate({ id: gym.id, name: 'ジム（短め）', items: [{ kind: 'bike', minutes: 20, intensity: 'moderate' }] })
    const [first] = await listTemplates()
    expect(first).toMatchObject({ id: gym.id, name: 'ジム（短め）', order: 0 })
  })

  it('名前が空・運動なしは保存しない', async () => {
    await expect(saveTemplate({ name: ' ', items: [{ kind: 'walk', minutes: 10, intensity: 'light' }] })).rejects.toThrow()
    await expect(saveTemplate({ name: 'x', items: [] })).rejects.toThrow()
  })
})

describe('記録の編集', () => {
  it('編集すると内容と updatedAt が変わる', async () => {
    const w = await addWorkout({ date: '2026-10-12', kind: 'walk', minutes: 20 })
    const edited = await editWorkout(w.id, { minutes: 35, postMeal: true })
    expect(edited).toMatchObject({ id: w.id, minutes: 35, postMeal: true, createdAt: w.createdAt })
    expect((await db.workouts.get(w.id))?.minutes).toBe(35)
  })
})

describe('バックアップ', () => {
  it('書き出し → 全消去 → 読み込みで元に戻る', async () => {
    await addWorkout({ date: '2026-10-12', kind: 'walk', minutes: 20 })
    await addWorkout({ date: '2026-10-13', kind: 'strength', minutes: 30 })
    await updateSettings({ theme: 'dark' })
    const backup = await exportBackup()

    await db.delete()
    await db.open()
    const summary = await importBackup(backup)

    expect(summary).toEqual({ added: 2, updated: 0, skipped: 0 })
    expect(await db.workouts.count()).toBe(2)
    expect((await getSettings()).theme).toBe('dark')
  })

  it('同じバックアップを 2 回読み込んでも重複しない', async () => {
    await addWorkout({ date: '2026-10-12', kind: 'walk', minutes: 20 })
    const backup = await exportBackup()
    expect(await importBackup(backup)).toEqual({ added: 0, updated: 0, skipped: 1 })
    expect(await db.workouts.count()).toBe(1)
  })
})
