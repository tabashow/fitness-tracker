import { useState } from 'react'
import { ConfirmButton } from '../../components/ConfirmButton'
import { Sheet } from '../../components/Sheet'
import { useToast } from '../../components/Toast'
import ui from '../../components/ui.module.css'
import { deleteWorkouts, editWorkout } from '../../db/workouts'
import { INTENSITIES, INTENSITY_LABELS, KIND_ICONS, KIND_LABELS, KINDS } from '../../domain/labels'
import type { Workout } from '../../domain/types'
import { isValidMinutes, MAX_MINUTES } from '../../domain/workout'
import { useToday } from '../../hooks/useToday'
import styles from './EditWorkoutSheet.module.css'

export function EditWorkoutSheet({ workout, onClose }: { workout: Workout | null; onClose: () => void }) {
  return (
    <Sheet open={workout !== null} title="記録を編集" onClose={onClose}>
      {workout && <EditForm key={workout.id} workout={workout} onDone={onClose} />}
    </Sheet>
  )
}

function EditForm({ workout, onDone }: { workout: Workout; onDone: () => void }) {
  const toast = useToast()
  const today = useToday()
  const [form, setForm] = useState({
    kind: workout.kind,
    minutes: String(workout.minutes),
    intensity: workout.intensity,
    postMeal: workout.postMeal,
    countsAsAerobic: workout.countsAsAerobic ?? true,
    date: workout.date,
    memo: workout.memo ?? '',
  })
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }))
  const minutes = Number(form.minutes)

  const save = async () => {
    try {
      await editWorkout(workout.id, { ...form, minutes })
      toast({ message: '記録を更新しました' })
      onDone()
    } catch (e) {
      toast({ message: `保存できませんでした: ${(e as Error).message}` })
    }
  }

  const remove = async () => {
    await deleteWorkouts([workout.id])
    toast({ message: '記録を削除しました' })
    onDone()
  }

  return (
    <div className={styles.form}>
      <div className={styles.kinds}>
        {KINDS.map((k) => (
          <button key={k} type="button" className={styles.kind} aria-pressed={form.kind === k} onClick={() => set('kind', k)}>
            <span aria-hidden>{KIND_ICONS[k]}</span>
            {KIND_LABELS[k]}
          </button>
        ))}
      </div>

      <label className={styles.field}>
        <span>時間</span>
        <input
          className={ui.input}
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_MINUTES}
          value={form.minutes}
          onChange={(e) => set('minutes', e.target.value)}
        />
        <span>分</span>
      </label>

      <div className={ui.segment} role="group" aria-label="強度">
        {INTENSITIES.map((i) => (
          <button key={i} type="button" aria-pressed={form.intensity === i} onClick={() => set('intensity', i)}>
            {INTENSITY_LABELS[i]}
          </button>
        ))}
      </div>

      {form.kind === 'walk' && (
        <label className={ui.toggle}>
          <input type="checkbox" checked={form.postMeal} onChange={(e) => set('postMeal', e.target.checked)} />
          食後ウォーキング
        </label>
      )}
      {form.kind === 'other' && (
        <label className={ui.toggle}>
          <input
            type="checkbox"
            checked={form.countsAsAerobic}
            onChange={(e) => set('countsAsAerobic', e.target.checked)}
          />
          有酸素に含める
        </label>
      )}

      <label className={styles.field}>
        <span>日付</span>
        <input
          className={ui.input}
          type="date"
          value={form.date}
          max={today}
          onChange={(e) => e.target.value && set('date', e.target.value)}
        />
      </label>
      <label className={styles.field}>
        <span>メモ</span>
        <input className={ui.input} type="text" value={form.memo} placeholder="任意" onChange={(e) => set('memo', e.target.value)} />
      </label>

      <div className={styles.actions}>
        <ConfirmButton confirmLabel="本当に削除" onConfirm={remove}>
          削除
        </ConfirmButton>
        <button type="button" className={ui.primary} disabled={!isValidMinutes(minutes)} onClick={save}>
          保存
        </button>
      </div>
    </div>
  )
}
