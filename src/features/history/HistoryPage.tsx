import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import ui from '../../components/ui.module.css'
import { WorkoutList } from '../../components/WorkoutList'
import type { DateKey, Workout } from '../../domain/types'
import { fromDateKey } from '../../domain/week'
import { useWorkoutsNewestFirst } from '../../hooks/useData'
import styles from './HistoryPage.module.css'

const PAGE_DAYS = 30

export function HistoryPage() {
  const workouts = useWorkoutsNewestFirst()
  const [visibleDays, setVisibleDays] = useState(PAGE_DAYS)

  const days = useMemo(() => {
    const groups: { date: DateKey; workouts: Workout[]; minutes: number }[] = []
    for (const w of workouts ?? []) {
      const last = groups.at(-1)
      if (last?.date === w.date) {
        last.workouts.push(w)
        last.minutes += w.minutes
      } else {
        groups.push({ date: w.date, workouts: [w], minutes: w.minutes })
      }
    }
    return groups
  }, [workouts])

  if (!workouts) return null

  return (
    <div className={styles.page}>
      <h1 className={ui.pageTitle}>履歴</h1>
      {days.length === 0 ? (
        <p className={ui.hint}>まだ記録がありません。ホームの＋から記録できます。</p>
      ) : (
        <>
          <p className={ui.hint}>
            {workouts.length}件・{days.length}日分。行をタップすると編集できます。
          </p>
          {days.slice(0, visibleDays).map((day) => (
            <section key={day.date}>
              <h2 className={styles.dayHeader}>
                <span>{format(fromDateKey(day.date), 'yyyy年M月d日(E)', { locale: ja })}</span>
                <span className={styles.total}>計 {day.minutes}分</span>
              </h2>
              <WorkoutList workouts={day.workouts} />
            </section>
          ))}
          {days.length > visibleDays && (
            <button type="button" className={ui.secondary} onClick={() => setVisibleDays((n) => n + PAGE_DAYS)}>
              もっと見る（残り {days.length - visibleDays}日分）
            </button>
          )}
        </>
      )}
    </div>
  )
}
