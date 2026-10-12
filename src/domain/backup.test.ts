import { describe, expect, it } from 'vitest'
import { backupFileName, createBackup, parseBackup, workoutsToImport } from './backup'
import { DEFAULT_TEMPLATES, defaultSettings } from './defaults'
import { workout } from './testUtils'

const sample = () =>
  createBackup(
    {
      workouts: [workout('2026-10-12', 'walk', 20), workout('2026-10-13', 'other', 15, { countsAsAerobic: false, memo: 'テスト' })],
      templates: DEFAULT_TEMPLATES,
      settings: defaultSettings('2026-10-12'),
    },
    new Date('2026-10-14T12:00:00Z'),
  )

describe('parseBackup', () => {
  it('書き出したものはそのまま読み込める', () => {
    const backup = sample()
    const result = parseBackup(JSON.stringify(backup))
    expect(result).toEqual({ ok: true, backup })
  })

  it('JSON でないものは拒否', () => {
    expect(parseBackup('not json')).toMatchObject({ ok: false })
  })

  it('他アプリのファイルは拒否', () => {
    expect(parseBackup(JSON.stringify({ ...sample(), app: 'other' }))).toMatchObject({
      ok: false,
      error: expect.stringContaining('バックアップファイルではありません'),
    })
  })

  it('新しいスキーマバージョンは拒否（古いアプリで壊さない）', () => {
    expect(parseBackup(JSON.stringify({ ...sample(), schemaVersion: 99 }))).toMatchObject({ ok: false })
  })

  it('記録が 1 件でも不正なら全体を拒否', () => {
    const backup = sample()
    const broken = { ...backup, workouts: [...backup.workouts, { ...backup.workouts[0], id: 'x', minutes: 0 }] }
    expect(parseBackup(JSON.stringify(broken))).toMatchObject({ ok: false, error: expect.stringContaining('運動記録') })
  })

  it('不正な目標値の設定は拒否', () => {
    const backup = sample()
    const broken = {
      ...backup,
      settings: { ...backup.settings, goalsHistory: [{ effectiveFrom: '2026-10-12', goals: { aerobicMinutes: 150, activeDays: 9, strengthSessions: 2 } }] },
    }
    expect(parseBackup(JSON.stringify(broken))).toMatchObject({ ok: false, error: expect.stringContaining('設定') })
  })
})

describe('workoutsToImport', () => {
  it('新しい ID は取り込み、同じ ID は updatedAt が新しいときだけ上書き', () => {
    const a = workout('2026-10-12', 'walk', 20, { id: 'a', updatedAt: 100 })
    const b = workout('2026-10-12', 'bike', 30, { id: 'b', updatedAt: 100 })
    const incoming = [
      { ...a, updatedAt: 100 }, // 同じ → 取り込まない
      { ...b, minutes: 40, updatedAt: 200 }, // 新しい → 上書き
      workout('2026-10-13', 'walk', 10, { id: 'c' }), // 新規
    ]
    expect(workoutsToImport([a, b], incoming).map((w) => w.id)).toEqual(['b', 'c'])
  })

  it('古い版で上書きしない', () => {
    const a = workout('2026-10-12', 'walk', 20, { id: 'a', updatedAt: 200 })
    expect(workoutsToImport([a], [{ ...a, minutes: 5, updatedAt: 100 }])).toEqual([])
  })
})

describe('backupFileName', () => {
  it('日付入りのファイル名', () => {
    expect(backupFileName(new Date(2026, 9, 4))).toBe('undo-log-backup-20261004.json')
  })
})
