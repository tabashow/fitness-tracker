import { describe, expect, it } from 'vitest'
import { setGoalsFrom } from './goals'
import type { GoalsEntry } from './types'

const base: GoalsEntry[] = [{ effectiveFrom: '2026-09-28', goals: { aerobicMinutes: 150, activeDays: 4, strengthSessions: 2 } }]
const next = { aerobicMinutes: 180, activeDays: 5, strengthSessions: 2 }

describe('setGoalsFrom', () => {
  it('今週から適用するエントリを追加し、過去のエントリは残す', () => {
    expect(setGoalsFrom(base, '2026-10-12', next)).toEqual([...base, { effectiveFrom: '2026-10-12', goals: next }])
  })

  it('同じ週に再設定すると置き換える', () => {
    const once = setGoalsFrom(base, '2026-10-12', next)
    const twice = setGoalsFrom(once, '2026-10-12', { ...next, activeDays: 3 })
    expect(twice).toHaveLength(2)
    expect(twice[1].goals.activeDays).toBe(3)
  })

  it('最初のエントリと同じ週なら置き換えのみ', () => {
    expect(setGoalsFrom(base, '2026-09-28', next)).toEqual([{ effectiveFrom: '2026-09-28', goals: next }])
  })

  it.each([
    { aerobicMinutes: -1, activeDays: 4, strengthSessions: 2 },
    { aerobicMinutes: 150, activeDays: 8, strengthSessions: 2 },
    { aerobicMinutes: 150, activeDays: 4, strengthSessions: 1.5 },
  ])('範囲外の値は例外 %o', (goals) => {
    expect(() => setGoalsFrom(base, '2026-10-12', goals)).toThrow(RangeError)
  })
})
