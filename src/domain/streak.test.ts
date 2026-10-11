import { describe, expect, it } from 'vitest'
import { computeStreak } from './streak'
import { workout } from './testUtils'
import { daysOfWeek } from './week'

/** 週の月曜から n 日分ウォーキングした記録 */
const activeWeek = (weekStart: string, days = 4) =>
  daysOfWeek(weekStart)
    .slice(0, days)
    .map((d) => workout(d, 'walk'))

describe('computeStreak', () => {
  const today = '2026-10-07' // 水曜。今週は 2026-10-05 〜

  it('記録なしは 0', () => {
    expect(computeStreak([], [], today)).toEqual({ current: 0, thisWeekAchieved: false, best: 0 })
  })

  it('今週が未達でも進行中なので、先週までの連続はそのまま数える', () => {
    const w = [...activeWeek('2026-09-21'), ...activeWeek('2026-09-28'), workout('2026-10-05', 'walk')]
    expect(computeStreak(w, [], today)).toEqual({ current: 2, thisWeekAchieved: false, best: 2 })
  })

  it('今週も達成済みなら今週を含める', () => {
    const w = [...activeWeek('2026-09-28'), ...activeWeek('2026-10-05')]
    expect(computeStreak(w, [], '2026-10-11')).toEqual({ current: 2, thisWeekAchieved: true, best: 2 })
  })

  it('未達の週で途切れる', () => {
    const w = [
      ...activeWeek('2026-09-07'),
      ...activeWeek('2026-09-14'),
      ...activeWeek('2026-09-21'),
      ...activeWeek('2026-09-28', 3), // 3日だけ → 未達
    ]
    const s = computeStreak(w, [], today)
    expect(s.current).toBe(0)
    expect(s.best).toBe(3)
  })

  it('記録のない週を挟むと途切れる', () => {
    const w = [...activeWeek('2026-09-14'), ...activeWeek('2026-09-28')]
    expect(computeStreak(w, [], today).current).toBe(1)
  })

  it('年をまたいで連続を数える', () => {
    const w = [...activeWeek('2026-12-21'), ...activeWeek('2026-12-28'), ...activeWeek('2027-01-04')]
    expect(computeStreak(w, [], '2027-01-12').current).toBe(3)
  })

  it('主目標(運動日数)のみで判定し、有酸素・筋トレ未達でも継続', () => {
    const w = daysOfWeek('2026-09-28')
      .slice(0, 4)
      .map((d) => workout(d, 'other', 5, { countsAsAerobic: false }))
    expect(computeStreak(w, [], today).current).toBe(1)
  })
})
