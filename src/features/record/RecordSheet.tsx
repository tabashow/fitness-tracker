import { useState } from 'react'
import { Sheet } from '../../components/Sheet'
import { useToast } from '../../components/Toast'
import { addWorkout, deleteWorkouts } from '../../db/workouts'
import { INTENSITIES, INTENSITY_LABELS, KIND_ICONS, KIND_LABELS, KINDS, MINUTE_PRESETS } from '../../domain/labels'
import type { ActivityKind, DateKey, Intensity } from '../../domain/types'
import { isValidMinutes, MAX_MINUTES } from '../../domain/workout'
import styles from './RecordSheet.module.css'

interface RecordSheetProps {
  open: boolean
  today: DateKey
  onClose: () => void
}

/**
 * 手動記録。＋ → 種別 → 時間 の 3 タップで保存する。
 * 強度・食後・日付・メモは既定値のままなら触らなくてよい。
 */
export function RecordSheet({ open, today, onClose }: RecordSheetProps) {
  return (
    <Sheet open={open} title="運動を記録" onClose={onClose}>
      {/* 開くたびに入力をリセットするため、開いている間だけマウントする */}
      {open && <RecordForm today={today} onSaved={onClose} />}
    </Sheet>
  )
}

function RecordForm({ today, onSaved }: { today: DateKey; onSaved: () => void }) {
  const toast = useToast()
  const [kind, setKind] = useState<ActivityKind | null>(null)
  const [intensity, setIntensity] = useState<Intensity>('moderate')
  const [postMeal, setPostMeal] = useState(false)
  const [countsAsAerobic, setCountsAsAerobic] = useState(true)
  const [date, setDate] = useState(today)
  const [memo, setMemo] = useState('')
  const [customMinutes, setCustomMinutes] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async (minutes: number) => {
    if (!kind || saving || !isValidMinutes(minutes)) return
    setSaving(true)
    try {
      const w = await addWorkout({ date, kind, minutes, intensity, postMeal, countsAsAerobic, memo })
      toast({
        message: `${KIND_LABELS[kind]} ${minutes}分を記録しました`,
        action: { label: '取り消し', onClick: () => void deleteWorkouts([w.id]) },
      })
      onSaved()
    } catch (e) {
      setSaving(false)
      toast({ message: `保存できませんでした: ${(e as Error).message}` })
    }
  }

  const custom = Number(customMinutes)

  return (
    <div className={styles.form}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>種別</legend>
        <div className={styles.kinds}>
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              className={styles.kind}
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
            >
              <span className={styles.kindIcon} aria-hidden>
                {KIND_ICONS[k]}
              </span>
              {KIND_LABELS[k]}
            </button>
          ))}
        </div>
      </fieldset>

      {kind && (
        <>
          <fieldset className={styles.group}>
            <legend className={styles.legend}>時間（タップで記録）</legend>
            <div className={styles.minutes}>
              {MINUTE_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={styles.minute}
                  aria-label={`${m}分で記録`}
                  disabled={saving}
                  onClick={() => save(m)}
                >
                  {m}
                  <small>分</small>
                </button>
              ))}
            </div>
            <div className={styles.custom}>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_MINUTES}
                placeholder="分数を入力"
                aria-label="分数を入力"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
              />
              <button
                type="button"
                className={styles.customSave}
                disabled={saving || !isValidMinutes(custom)}
                onClick={() => save(custom)}
              >
                記録
              </button>
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>強度</legend>
            <div className={styles.segment}>
              {INTENSITIES.map((i) => (
                <button key={i} type="button" aria-pressed={intensity === i} onClick={() => setIntensity(i)}>
                  {INTENSITY_LABELS[i]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className={styles.toggles}>
            {kind === 'walk' && (
              <label className={styles.toggle}>
                <input type="checkbox" checked={postMeal} onChange={(e) => setPostMeal(e.target.checked)} />
                食後ウォーキング
              </label>
            )}
            {kind === 'other' && (
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={countsAsAerobic}
                  onChange={(e) => setCountsAsAerobic(e.target.checked)}
                />
                有酸素に含める
              </label>
            )}
          </div>

          <div className={styles.extras}>
            <label className={styles.field}>
              <span>日付</span>
              <input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>メモ</span>
              <input type="text" value={memo} placeholder="任意" onChange={(e) => setMemo(e.target.value)} />
            </label>
          </div>
        </>
      )}
    </div>
  )
}
