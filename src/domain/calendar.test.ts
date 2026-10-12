import { describe, expect, it } from 'vitest'
import { activityByDay, monthGrid } from './calendar'
import { workout } from './testUtils'

describe('monthGrid', () => {
  it('2026年10月は 9/28(月) から 11/1(日) までの 5 週', () => {
    const weeks = monthGrid(2026, 9)
    expect(weeks).toHaveLength(5)
    expect(weeks[0][0]).toBe('2026-09-28')
    expect(weeks.at(-1)?.at(-1)).toBe('2026-11-01')
    expect(weeks.every((w) => w.length === 7)).toBe(true)
  })

  it('1日が月曜で末日が日曜の月は前後を含まない（2027年2月は 4 週）', () => {
    const weeks = monthGrid(2027, 1)
    expect(weeks).toHaveLength(4)
    expect(weeks[0][0]).toBe('2027-02-01')
    expect(weeks[3][6]).toBe('2027-02-28')
  })

  it('6 週にまたがる月（2026年8月）', () => {
    const weeks = monthGrid(2026, 7)
    expect(weeks).toHaveLength(6)
    expect(weeks[0][0]).toBe('2026-07-27')
    expect(weeks[5][6]).toBe('2026-09-06')
  })
})

describe('activityByDay', () => {
  it('日ごとに合計分数と有酸素・筋トレの有無をまとめる', () => {
    const map = activityByDay([
      workout('2026-10-12', 'bike', 30),
      workout('2026-10-12', 'strength', 20),
      workout('2026-10-13', 'other', 10, { countsAsAerobic: false }),
    ])
    expect(map.get('2026-10-12')).toEqual({ minutes: 50, aerobic: true, strength: true })
    expect(map.get('2026-10-13')).toEqual({ minutes: 10, aerobic: false, strength: false })
    expect(map.has('2026-10-14')).toBe(false)
  })
})
