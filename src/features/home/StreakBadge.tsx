import type { Streak } from '../../domain/streak'
import type { WeeklySummary } from '../../domain/weeklySummary'
import styles from './StreakBadge.module.css'

export function StreakBadge({ streak, summary }: { streak: Streak; summary: WeeklySummary }) {
  const remaining = summary.goals.activeDays - summary.activeDays
  const sub = streak.thisWeekAchieved
    ? '今週も達成！'
    : streak.current > 0
      ? `今週あと${remaining}日で${streak.current + 1}週連続`
      : `今週あと${remaining}日で達成`

  return (
    <section className={styles.badge} aria-label="連続達成">
      <span className={styles.flame} aria-hidden>
        {streak.current > 0 ? '🔥' : '🌱'}
      </span>
      <div className={styles.text}>
        <span className={styles.main}>
          連続達成 <strong>{streak.current}</strong> 週
        </span>
        <span className={styles.sub}>{sub}</span>
      </div>
      {streak.best > 0 && <span className={styles.best}>最長 {streak.best}週</span>}
    </section>
  )
}
