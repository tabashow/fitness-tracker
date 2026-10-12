import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useState } from 'react'
import { useToast } from '../../components/Toast'
import ui from '../../components/ui.module.css'
import { changeGoals } from '../../db/settings'
import { GOAL_LIMITS, isValidGoals } from '../../domain/goals'
import type { Goals, Settings } from '../../domain/types'
import { fromDateKey, weekStartOf } from '../../domain/week'
import { goalsForWeek } from '../../domain/weeklySummary'
import styles from './SettingsPage.module.css'

const FIELDS: { key: keyof Goals; label: string; unit: string }[] = [
  { key: 'aerobicMinutes', label: '有酸素', unit: '分/週' },
  { key: 'activeDays', label: '運動日数', unit: '日/週' },
  { key: 'strengthSessions', label: '筋トレ', unit: '回/週' },
]

export function GoalsSection({ settings, today }: { settings: Settings; today: string }) {
  const weekStart = weekStartOf(today)
  const current = goalsForWeek(settings.goalsHistory, weekStart)
  const [draft, setDraft] = useState<Record<keyof Goals, string>>({
    aerobicMinutes: String(current.aerobicMinutes),
    activeDays: String(current.activeDays),
    strengthSessions: String(current.strengthSessions),
  })
  const toast = useToast()

  const goals: Goals = {
    aerobicMinutes: Number(draft.aerobicMinutes),
    activeDays: Number(draft.activeDays),
    strengthSessions: Number(draft.strengthSessions),
  }
  const changed = FIELDS.some(({ key }) => goals[key] !== current[key])
  const valid = isValidGoals(goals)

  const save = async () => {
    try {
      await changeGoals(goals, today)
      toast({ message: '目標を更新しました' })
    } catch (e) {
      toast({ message: `保存できませんでした: ${(e as Error).message}` })
    }
  }

  return (
    <section className={ui.card}>
      <h2 className={ui.sectionTitle}>週の目標</h2>
      <div className={styles.rows}>
        {FIELDS.map(({ key, label, unit }) => (
          <label key={key} className={styles.row}>
            <span className={styles.rowLabel}>{label}</span>
            <input
              className={`${ui.input} ${styles.number}`}
              type="number"
              inputMode="numeric"
              min={GOAL_LIMITS[key].min}
              max={GOAL_LIMITS[key].max}
              value={draft[key]}
              onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
            />
            <span className={styles.unit}>{unit}</span>
          </label>
        ))}
      </div>
      <p className={ui.hint}>
        今週（{format(fromDateKey(weekStart), 'M/d(E)', { locale: ja })}〜）から適用されます。過去の週の達成判定は変わりません。
      </p>
      <button type="button" className={`${ui.primary} ${styles.save}`} disabled={!changed || !valid} onClick={save}>
        目標を保存
      </button>
    </section>
  )
}
