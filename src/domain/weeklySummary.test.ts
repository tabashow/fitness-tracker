import { describe, expect, it } from 'vitest'
import type { GoalsEntry } from './types'
import { workout } from './testUtils'
import { goalsForWeek, summarizeWeek } from './weeklySummary'

const WEEK = '2026-10-05' // 月曜

describe('summarizeWeek', () => {
  it('記録なしはすべて 0', () => {
    const s = summarizeWeek([], WEEK, [])
    expect(s.aerobicMinutes).toBe(0)
    expect(s.activeDays).toBe(0)
    expect(s.strengthSessions).toBe(0)
    expect(s.overallRate).toBe(0)
    expect(s.activeDaysMet).toBe(false)
  })

  it('有酸素はバイク・ウォーキング・その他(既定)を合計し、筋トレは含めない', () => {
    const s = summarizeWeek(
      [
        workout('2026-10-05', 'bike', 30),
        workout('2026-10-06', 'walk', 20),
        workout('2026-10-07', 'other', 15),
        workout('2026-10-07', 'strength', 40),
      ],
      WEEK,
      [],
    )
    expect(s.aerobicMinutes).toBe(65)
  })

  it('その他で countsAsAerobic=false なら有酸素に含めない', () => {
    const s = summarizeWeek([workout('2026-10-05', 'other', 30, { countsAsAerobic: false })], WEEK, [])
    expect(s.aerobicMinutes).toBe(0)
    expect(s.activeDays).toBe(1)
  })

  it('運動日数は日付のユニーク数、筋トレは同日複数でも 1 回', () => {
    const s = summarizeWeek(
      [
        workout('2026-10-05', 'bike'),
        workout('2026-10-05', 'strength'),
        workout('2026-10-05', 'strength'),
        workout('2026-10-08', 'strength'),
      ],
      WEEK,
      [],
    )
    expect(s.activeDays).toBe(2)
    expect(s.strengthSessions).toBe(2)
  })

  it('週の範囲外（前週の日曜・翌週の月曜）は集計しない', () => {
    const s = summarizeWeek(
      [workout('2026-10-04', 'walk', 60), workout('2026-10-11', 'walk', 10), workout('2026-10-12', 'walk', 60)],
      WEEK,
      [],
    )
    expect(s.aerobicMinutes).toBe(10)
    expect(s.activeDays).toBe(1)
  })

  it('達成率は各目標 100% を上限に平均する', () => {
    // 有酸素 300分(200%→100%)、日数 2/4 (50%)、筋トレ 0/2 (0%)
    const s = summarizeWeek([workout('2026-10-05', 'bike', 150), workout('2026-10-06', 'bike', 150)], WEEK, [])
    expect(s.rates).toEqual({ aerobic: 1, activeDays: 0.5, strength: 0 })
    expect(s.overallRate).toBeCloseTo(0.5)
    expect(s.allMet).toBe(false)
  })

  it('全目標達成', () => {
    const s = summarizeWeek(
      [
        workout('2026-10-05', 'bike', 40),
        workout('2026-10-05', 'strength', 20),
        workout('2026-10-07', 'walk', 40),
        workout('2026-10-09', 'bike', 40),
        workout('2026-10-09', 'strength', 20),
        workout('2026-10-11', 'walk', 30),
      ],
      WEEK,
      [],
    )
    expect(s.aerobicMinutes).toBe(150)
    expect(s.activeDays).toBe(4)
    expect(s.strengthSessions).toBe(2)
    expect(s.overallRate).toBe(1)
    expect(s.activeDaysMet).toBe(true)
    expect(s.allMet).toBe(true)
  })
})

describe('goalsForWeek', () => {
  const history: GoalsEntry[] = [
    { effectiveFrom: '2026-10-12', goals: { aerobicMinutes: 180, activeDays: 5, strengthSessions: 2 } },
    { effectiveFrom: '2026-09-28', goals: { aerobicMinutes: 150, activeDays: 4, strengthSessions: 2 } },
  ]

  it('履歴が空なら既定値', () => {
    expect(goalsForWeek([], WEEK).activeDays).toBe(4)
  })
  it('週開始以前で最新の目標を使う（順不同でも可）', () => {
    expect(goalsForWeek(history, '2026-10-05').activeDays).toBe(4)
    expect(goalsForWeek(history, '2026-10-12').activeDays).toBe(5)
    expect(goalsForWeek(history, '2026-11-02').activeDays).toBe(5)
  })
  it('履歴より前の週は最初の目標', () => {
    expect(goalsForWeek(history, '2026-09-01').activeDays).toBe(4)
  })
  it('目標変更後も過去の週の判定は変わらない', () => {
    const fourDays = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08'].map((d) => workout(d, 'walk'))
    expect(summarizeWeek(fourDays, '2026-10-05', history).activeDaysMet).toBe(true)
    const nextWeek = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15'].map((d) => workout(d, 'walk'))
    expect(summarizeWeek(nextWeek, '2026-10-12', history).activeDaysMet).toBe(false)
  })
})
