import { describe, expect, it } from 'vitest'
import { getReminder } from './reminder'
import { workout } from './testUtils'
import { summarizeWeek } from './weeklySummary'

const WEEK = '2026-10-05'

function remind(workouts: ReturnType<typeof workout>[], today: string, hour = 19) {
  return getReminder({ workouts, today, hour, reminderHour: 18, summary: summarizeWeek(workouts, WEEK, []) })
}

describe('getReminder', () => {
  it('リマインド時刻前は出さない', () => {
    expect(remind([], '2026-10-06', 17)).toBeNull()
  })

  it('今日すでに記録があれば出さない', () => {
    expect(remind([workout('2026-10-06', 'walk')], '2026-10-06')).toBeNull()
  })

  it('今日未記録なら通常メッセージ', () => {
    expect(remind([], '2026-10-06')).toContain('まだ記録がありません')
  })

  it('残り日数ちょうどで目標に届く場合は後押しメッセージ', () => {
    // 金曜時点で 1 日 → 残り金土日 3 日、必要 3 日
    expect(remind([workout('2026-10-05', 'walk')], '2026-10-09')).toContain('あと3日')
  })

  it('週の目標達成済みならさらに控えめに', () => {
    const w = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08'].map((d) => workout(d, 'walk'))
    expect(remind(w, '2026-10-09')).toContain('達成済み')
  })
})
