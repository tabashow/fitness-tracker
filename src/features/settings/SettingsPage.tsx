import ui from '../../components/ui.module.css'
import { updateSettings } from '../../db/settings'
import type { Settings } from '../../domain/types'
import { useSettings } from '../../hooks/useData'
import { useToday } from '../../hooks/useToday'
import { BackupSection } from './BackupSection'
import { GoalsSection } from './GoalsSection'
import styles from './SettingsPage.module.css'
import { TemplatesSection } from './TemplatesSection'

const THEMES: { value: Settings['theme']; label: string }[] = [
  { value: 'system', label: '端末に合わせる' },
  { value: 'light', label: 'ライト' },
  { value: 'dark', label: 'ダーク' },
]

/** 24 = 表示しない */
const REMINDER_HOURS = [24, 12, 14, 16, 17, 18, 19, 20, 21, 22]

export function SettingsPage() {
  const settings = useSettings()
  const today = useToday()
  if (!settings) return null

  return (
    <div className={styles.page}>
      <h1 className={ui.pageTitle}>設定</h1>

      {/* 目標が別の端末から読み込まれたときなどに入力欄を作り直す */}
      <GoalsSection key={JSON.stringify(settings.goalsHistory)} settings={settings} today={today} />

      <TemplatesSection />

      <section className={ui.card}>
        <h2 className={ui.sectionTitle}>表示</h2>
        <div className={styles.rows}>
          <div>
            <p className={styles.label}>テーマ</p>
            <div className={ui.segment} role="group" aria-label="テーマ">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={settings.theme === t.value}
                  onClick={() => updateSettings({ theme: t.value })}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <label className={styles.row}>
            <span className={styles.rowLabel}>リマインド</span>
            <select
              className={ui.input}
              value={settings.reminderHour}
              onChange={(e) => updateSettings({ reminderHour: Number(e.target.value) })}
            >
              {REMINDER_HOURS.map((h) => (
                <option key={h} value={h}>
                  {h === 24 ? '表示しない' : `${h}時以降に表示`}
                </option>
              ))}
            </select>
          </label>
          <p className={ui.hint}>その日にまだ記録がないとき、ホームに控えめなメッセージを出します。</p>
        </div>
      </section>

      <BackupSection />
    </div>
  )
}
