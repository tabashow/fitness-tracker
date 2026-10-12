import { WorkoutList } from '../../components/WorkoutList'
import type { DateKey } from '../../domain/types'
import { useWorkoutsOn } from '../../hooks/useData'
import styles from './TodayList.module.css'

export function TodayList({ today }: { today: DateKey }) {
  const workouts = useWorkoutsOn(today)
  if (!workouts) return null

  return (
    <section>
      <h2 className={styles.heading}>今日の記録</h2>
      {workouts.length === 0 ? <p className={styles.empty}>まだ記録がありません</p> : <WorkoutList workouts={workouts} />}
    </section>
  )
}
