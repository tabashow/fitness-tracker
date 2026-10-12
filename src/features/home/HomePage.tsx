import { useState } from 'react'
import ui from '../../components/ui.module.css'
import { getReminder } from '../../domain/reminder'
import { toDateKey } from '../../domain/week'
import { useWeekStats } from '../../hooks/useData'
import { useNow } from '../../hooks/useToday'
import { RecordSheet } from '../record/RecordSheet'
import styles from './HomePage.module.css'
import { QuickTemplates } from './QuickTemplates'
import reminderStyles from './ReminderBanner.module.css'
import { StreakBadge } from './StreakBadge'
import { TodayList } from './TodayList'
import { WeekProgress } from './WeekProgress'

export function HomePage() {
  const now = useNow()
  const today = toDateKey(now)
  const stats = useWeekStats(today)
  const [recording, setRecording] = useState(false)

  const reminder =
    stats &&
    getReminder({
      workouts: stats.workouts,
      today,
      hour: now.getHours(),
      reminderHour: stats.settings.reminderHour,
      summary: stats.summary,
    })

  return (
    <div className={styles.page}>
      <h1 className={ui.pageTitle}>ホーム</h1>
      {stats && (
        <>
          <WeekProgress summary={stats.summary} />
          <StreakBadge streak={stats.streak} summary={stats.summary} />
        </>
      )}
      {reminder && (
        <p className={reminderStyles.banner} role="note">
          {reminder}
        </p>
      )}
      <QuickTemplates today={today} />
      <TodayList today={today} />

      <button type="button" className={styles.fab} aria-label="運動を記録" onClick={() => setRecording(true)}>
        ＋
      </button>
      <RecordSheet open={recording} today={today} onClose={() => setRecording(false)} />
    </div>
  )
}
