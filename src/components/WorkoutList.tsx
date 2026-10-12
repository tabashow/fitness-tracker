import { useState } from 'react'
import { deleteWorkouts } from '../db/workouts'
import { INTENSITY_LABELS, KIND_ICONS, KIND_LABELS } from '../domain/labels'
import type { Workout } from '../domain/types'
import { EditWorkoutSheet } from '../features/record/EditWorkoutSheet'
import { useToast } from './Toast'
import styles from './WorkoutList.module.css'

/** 記録の一覧。行をタップで編集、× で削除（2 段階） */
export function WorkoutList({ workouts }: { workouts: Workout[] }) {
  const [confirming, setConfirming] = useState<string | null>(null)
  const [editing, setEditing] = useState<Workout | null>(null)
  const toast = useToast()

  const remove = async (w: Workout) => {
    setConfirming(null)
    try {
      await deleteWorkouts([w.id])
      toast({ message: `${KIND_LABELS[w.kind]} ${w.minutes}分を削除しました` })
    } catch (e) {
      toast({ message: `削除できませんでした: ${(e as Error).message}` })
    }
  }

  return (
    <>
      <ul className={styles.list}>
        {workouts.map((w) => (
          <li key={w.id} className={styles.item}>
            <button
              type="button"
              className={styles.main}
              aria-label={`${KIND_LABELS[w.kind]} ${w.minutes}分を編集`}
              onClick={() => setEditing(w)}
            >
              <span aria-hidden>{KIND_ICONS[w.kind]}</span>
              <span className={styles.body}>
                <span className={styles.kind}>{KIND_LABELS[w.kind]}</span>
                {w.memo && <span className={styles.memo}>{w.memo}</span>}
              </span>
              {confirming !== w.id && (
                <>
                  <span>{w.minutes}分</span>
                  <span className={styles.meta}>
                    {INTENSITY_LABELS[w.intensity]}
                    {w.postMeal && '・食後'}
                  </span>
                </>
              )}
            </button>
            {confirming === w.id ? (
              <span className={styles.confirm}>
                <button type="button" className={styles.cancel} onClick={() => setConfirming(null)}>
                  やめる
                </button>
                <button type="button" className={styles.danger} onClick={() => remove(w)}>
                  削除
                </button>
              </span>
            ) : (
              <button
                type="button"
                className={styles.delete}
                aria-label={`${KIND_LABELS[w.kind]} ${w.minutes}分を削除`}
                onClick={() => setConfirming(w.id)}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      <EditWorkoutSheet workout={editing} onClose={() => setEditing(null)} />
    </>
  )
}
