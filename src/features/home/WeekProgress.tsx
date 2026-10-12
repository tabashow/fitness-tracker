import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { fromDateKey, weekEndOf } from '../../domain/week'
import type { WeeklySummary } from '../../domain/weeklySummary'
import styles from './WeekProgress.module.css'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatDay(key: string) {
  return format(fromDateKey(key), 'M/d(E)', { locale: ja })
}

/** 今週の総合達成率（大きなリング）と目標ごとの進捗 */
export function WeekProgress({ summary }: { summary: WeeklySummary }) {
  const percent = Math.round(summary.overallRate * 100)
  const { goals } = summary
  const bars = [
    { label: '有酸素', value: summary.aerobicMinutes, goal: goals.aerobicMinutes, unit: '分', rate: summary.rates.aerobic, color: 'var(--aerobic)' },
    { label: '運動日', value: summary.activeDays, goal: goals.activeDays, unit: '日', rate: summary.rates.activeDays, color: 'var(--accent)' },
    { label: '筋トレ', value: summary.strengthSessions, goal: goals.strengthSessions, unit: '回', rate: summary.rates.strength, color: 'var(--strength)' },
  ]

  return (
    <section className={styles.card} aria-label="今週の進捗">
      <p className={styles.range}>
        今週 {formatDay(summary.weekStart)}〜{formatDay(weekEndOf(summary.weekStart))}
      </p>
      <div className={styles.ringWrap}>
        <svg viewBox="0 0 120 120" className={styles.ring} role="img" aria-label={`総合達成率 ${percent}%`}>
          <circle cx="60" cy="60" r={RADIUS} className={styles.track} />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            className={styles.progress}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - summary.overallRate)}
          />
        </svg>
        <div className={styles.center}>
          <span className={styles.percent}>
            {percent}
            <small>%</small>
          </span>
          <span className={styles.caption}>{summary.allMet ? '全目標達成！' : '総合達成率'}</span>
        </div>
      </div>

      <ul className={styles.bars}>
        {bars.map((b) => (
          <li key={b.label} className={styles.bar}>
            <span className={styles.barLabel}>{b.label}</span>
            <span className={styles.track2}>
              <span className={styles.fill} style={{ width: `${b.rate * 100}%`, background: b.color }} />
            </span>
            <span className={styles.value}>
              {b.rate >= 1 && <span aria-label="達成">✓ </span>}
              {b.value}
              <span className={styles.goal}>
                /{b.goal}
                {b.unit}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
