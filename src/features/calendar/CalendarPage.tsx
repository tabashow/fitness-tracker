import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import ui from '../../components/ui.module.css'
import { WorkoutList } from '../../components/WorkoutList'
import { activityByDay, monthGrid } from '../../domain/calendar'
import type { DateKey } from '../../domain/types'
import { fromDateKey } from '../../domain/week'
import { summarizeWeek } from '../../domain/weeklySummary'
import { useAllWorkouts, useSettings } from '../../hooks/useData'
import { useToday } from '../../hooks/useToday'
import styles from './CalendarPage.module.css'

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

export function CalendarPage() {
  const today = useToday()
  const [month, setMonth] = useState(() => {
    const d = fromDateKey(today)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selected, setSelected] = useState<DateKey>(today)
  const workouts = useAllWorkouts()
  const settings = useSettings()

  const weeks = useMemo(() => monthGrid(month.year, month.month), [month])
  const byDay = useMemo(() => activityByDay(workouts ?? []), [workouts])
  const selectedWorkouts = useMemo(
    () => (workouts ?? []).filter((w) => w.date === selected).sort((a, b) => a.createdAt - b.createdAt),
    [workouts, selected],
  )

  const shift = (delta: number) =>
    setMonth(({ year, month: m }) => {
      const d = new Date(year, m + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  const monthPrefix = `${month.year}-${String(month.month + 1).padStart(2, '0')}`
  const activeDaysInMonth = [...byDay.keys()].filter((k) => k.startsWith(monthPrefix)).length

  return (
    <div className={styles.page}>
      <h1 className={ui.pageTitle}>カレンダー</h1>

      <section className={ui.card}>
        <div className={styles.header}>
          <button type="button" className={styles.nav} aria-label="前の月" onClick={() => shift(-1)}>
            ‹
          </button>
          <div className={styles.monthTitle}>
            <strong>
              {month.year}年{month.month + 1}月
            </strong>
            <span>運動した日 {activeDaysInMonth}日</span>
          </div>
          <button type="button" className={styles.nav} aria-label="次の月" onClick={() => shift(1)}>
            ›
          </button>
        </div>

        <div className={styles.grid} role="grid">
          <div className={styles.row} role="row">
            {WEEKDAYS.map((d) => (
              <span key={d} className={styles.weekday} role="columnheader">
                {d}
              </span>
            ))}
            <span className={styles.weekday} role="columnheader" aria-label="週の達成">
              週
            </span>
          </div>
          {weeks.map((days) => {
            const summary = settings && summarizeWeek(workouts ?? [], days[0], settings.goalsHistory)
            const isPast = days[6] < today
            return (
              <div key={days[0]} className={styles.row} role="row">
                {days.map((day) => {
                  const act = byDay.get(day)
                  const inMonth = day.startsWith(monthPrefix)
                  const cls = [
                    styles.day,
                    !inMonth && styles.outside,
                    day === today && styles.today,
                    day === selected && styles.selected,
                    act && styles.active,
                  ]
                    .filter(Boolean)
                    .join(' ')
                  return (
                    <button
                      key={day}
                      type="button"
                      role="gridcell"
                      className={cls}
                      aria-pressed={day === selected}
                      aria-label={`${format(fromDateKey(day), 'M月d日(E)', { locale: ja })}${act ? ` 運動${act.minutes}分` : ''}`}
                      onClick={() => setSelected(day)}
                    >
                      <span className={styles.date}>{fromDateKey(day).getDate()}</span>
                      <span className={styles.dots} aria-hidden>
                        {act?.aerobic && <span className={styles.dotAerobic} />}
                        {act?.strength && <span className={styles.dotStrength} />}
                        {act && !act.aerobic && !act.strength && <span className={styles.dotOther} />}
                      </span>
                    </button>
                  )
                })}
                <span className={styles.weekMark} role="gridcell">
                  {summary?.allMet ? (
                    <span title="全目標達成" aria-label="全目標達成">
                      ★
                    </span>
                  ) : summary?.activeDaysMet ? (
                    <span title="運動日数達成" aria-label="運動日数達成" className={styles.check}>
                      ✓
                    </span>
                  ) : isPast && summary && summary.activeDays > 0 ? (
                    <span className={styles.partial} aria-label={`${summary.activeDays}日`}>
                      {summary.activeDays}
                    </span>
                  ) : null}
                </span>
              </div>
            )
          })}
        </div>

        <ul className={styles.legend}>
          <li>
            <span className={styles.dotAerobic} /> 有酸素
          </li>
          <li>
            <span className={styles.dotStrength} /> 筋トレ
          </li>
          <li>
            <span className={styles.check}>✓</span> 週{settings?.goalsHistory.at(-1)?.goals.activeDays ?? 4}日達成
          </li>
          <li>★ 全目標達成</li>
        </ul>
      </section>

      <section>
        <h2 className={styles.dayTitle}>{format(fromDateKey(selected), 'M月d日(E)', { locale: ja })}の記録</h2>
        {selectedWorkouts.length === 0 ? (
          <p className={ui.hint}>記録はありません</p>
        ) : (
          <WorkoutList workouts={selectedWorkouts} />
        )}
      </section>
    </div>
  )
}
