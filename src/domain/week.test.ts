import { describe, expect, it } from 'vitest'
import { daysOfWeek, isInWeek, shiftWeeks, weekStartOf } from './week'

describe('weekStartOf', () => {
  it('月曜はその日自身', () => {
    expect(weekStartOf('2026-10-05')).toBe('2026-10-05')
  })
  it('日曜は前の月曜（月曜始まり）', () => {
    expect(weekStartOf('2026-10-04')).toBe('2026-09-28')
  })
  it('月をまたぐ週', () => {
    expect(weekStartOf('2026-10-01')).toBe('2026-09-28')
  })
  it('年をまたぐ週', () => {
    expect(weekStartOf('2027-01-02')).toBe('2026-12-28')
  })
})

describe('週のユーティリティ', () => {
  it('daysOfWeek は月〜日の 7 日', () => {
    expect(daysOfWeek('2026-12-28')).toEqual([
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
    ])
  })
  it('isInWeek は日曜まで含み翌月曜は含まない', () => {
    expect(isInWeek('2026-10-04', '2026-09-28')).toBe(true)
    expect(isInWeek('2026-10-05', '2026-09-28')).toBe(false)
    expect(isInWeek('2026-09-27', '2026-09-28')).toBe(false)
  })
  it('shiftWeeks', () => {
    expect(shiftWeeks('2026-10-05', -1)).toBe('2026-09-28')
    expect(shiftWeeks('2026-12-28', 1)).toBe('2027-01-04')
  })
})
