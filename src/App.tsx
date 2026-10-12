import { Navigate, Route, Routes } from 'react-router'
import { BottomNav } from './components/BottomNav'
import { CalendarPage } from './features/calendar/CalendarPage'
import { HistoryPage } from './features/history/HistoryPage'
import { HomePage } from './features/home/HomePage'
import { SettingsPage } from './features/settings/SettingsPage'
import styles from './App.module.css'
import { useApplyTheme } from './hooks/useTheme'

export default function App() {
  useApplyTheme()
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
