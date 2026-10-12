import { describe, expect, it } from 'vitest'
import { DEFAULT_TEMPLATES } from './defaults'
import { newId } from './id'
import { createWorkout, updateWorkout, workoutsFromTemplate } from './workout'

describe('createWorkout', () => {
  it('省略した項目は既定値（強度=普通、食後=false）', () => {
    const w = createWorkout({ date: '2026-10-12', kind: 'walk', minutes: 20 }, 1000, 'id1')
    expect(w).toEqual({
      id: 'id1',
      date: '2026-10-12',
      kind: 'walk',
      minutes: 20,
      intensity: 'moderate',
      postMeal: false,
      createdAt: 1000,
      updatedAt: 1000,
    })
  })

  it('countsAsAerobic は「その他」のときだけ保存し、既定は true', () => {
    expect(createWorkout({ date: '2026-10-12', kind: 'other', minutes: 10 }).countsAsAerobic).toBe(true)
    expect(
      createWorkout({ date: '2026-10-12', kind: 'other', minutes: 10, countsAsAerobic: false }).countsAsAerobic,
    ).toBe(false)
    expect(createWorkout({ date: '2026-10-12', kind: 'bike', minutes: 10, countsAsAerobic: false })).not.toHaveProperty(
      'countsAsAerobic',
    )
  })

  it('メモは前後の空白を除き、空なら保存しない', () => {
    expect(createWorkout({ date: '2026-10-12', kind: 'walk', minutes: 5, memo: '  公園  ' }).memo).toBe('公園')
    expect(createWorkout({ date: '2026-10-12', kind: 'walk', minutes: 5, memo: '   ' })).not.toHaveProperty('memo')
  })

  it.each([0, -5, 1.5, 601, Number.NaN])('不正な分数 %s は例外', (minutes) => {
    expect(() => createWorkout({ date: '2026-10-12', kind: 'walk', minutes })).toThrow(RangeError)
  })
})

describe('workoutsFromTemplate', () => {
  it('項目ごとに別 ID の記録を作り、日付をそろえる', () => {
    const gym = DEFAULT_TEMPLATES[0]
    const ws = workoutsFromTemplate(gym, '2026-10-12', 5)
    expect(ws.map((w) => [w.kind, w.minutes, w.date])).toEqual([
      ['bike', 30, '2026-10-12'],
      ['strength', 20, '2026-10-12'],
    ])
    expect(new Set(ws.map((w) => w.id)).size).toBe(2)
    expect(ws.map((w) => w.createdAt)).toEqual([5, 6])
  })

  it('食後フラグを引き継ぐ', () => {
    const [w] = workoutsFromTemplate(DEFAULT_TEMPLATES[1], '2026-10-12')
    expect(w.postMeal).toBe(true)
    expect(w.intensity).toBe('light')
  })
})

describe('newId', () => {
  it('randomUUID がない環境でも UUID v4 形式', () => {
    const original = crypto.randomUUID
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true })
    try {
      expect(newId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    } finally {
      Object.defineProperty(crypto, 'randomUUID', { value: original, configurable: true })
    }
  })
})

describe('updateWorkout', () => {
  const original = createWorkout({ date: '2026-10-12', kind: 'other', minutes: 20, memo: 'ヨガ' }, 1000, 'id1')

  it('変更した項目と updatedAt だけが変わり、id と createdAt は保つ', () => {
    const w = updateWorkout(original, { minutes: 30, intensity: 'hard' }, 2000)
    expect(w).toMatchObject({ id: 'id1', minutes: 30, intensity: 'hard', memo: 'ヨガ', createdAt: 1000, updatedAt: 2000 })
  })

  it('種別をその他以外に変えると countsAsAerobic を消す', () => {
    expect(updateWorkout(original, { kind: 'walk' })).not.toHaveProperty('countsAsAerobic')
  })

  it('メモを空にすると消える', () => {
    expect(updateWorkout(original, { memo: '' })).not.toHaveProperty('memo')
  })

  it('不正な分数は例外', () => {
    expect(() => updateWorkout(original, { minutes: 0 })).toThrow(RangeError)
  })
})
