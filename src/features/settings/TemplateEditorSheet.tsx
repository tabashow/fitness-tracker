import { useState } from 'react'
import { ConfirmButton } from '../../components/ConfirmButton'
import { Sheet } from '../../components/Sheet'
import { useToast } from '../../components/Toast'
import ui from '../../components/ui.module.css'
import { deleteTemplate, saveTemplate } from '../../db/templates'
import { INTENSITIES, INTENSITY_LABELS, KIND_LABELS, KINDS } from '../../domain/labels'
import type { ActivityKind, Intensity, Template } from '../../domain/types'
import { isValidMinutes, MAX_MINUTES } from '../../domain/workout'
import styles from './TemplateEditorSheet.module.css'

/** template: 編集対象。'new' なら新規作成、null なら閉じている */
export function TemplateEditorSheet({ template, onClose }: { template: Template | 'new' | null; onClose: () => void }) {
  const isNew = template === 'new'
  return (
    <Sheet open={template !== null} title={isNew ? 'テンプレートを追加' : 'テンプレートを編集'} onClose={onClose}>
      {template && <EditorForm key={isNew ? 'new' : template.id} template={isNew ? null : template} onDone={onClose} />}
    </Sheet>
  )
}

interface DraftItem {
  kind: ActivityKind
  minutes: string
  intensity: Intensity
  postMeal: boolean
  countsAsAerobic: boolean
}

function EditorForm({ template, onDone }: { template: Template | null; onDone: () => void }) {
  const toast = useToast()
  const [name, setName] = useState(template?.name ?? '')
  const [items, setItems] = useState<DraftItem[]>(
    template?.items.map((i) => ({
      kind: i.kind,
      minutes: String(i.minutes),
      intensity: i.intensity,
      postMeal: i.postMeal ?? false,
      countsAsAerobic: i.countsAsAerobic ?? true,
    })) ?? [{ kind: 'walk', minutes: '20', intensity: 'moderate', postMeal: false, countsAsAerobic: true }],
  )

  const update = (index: number, patch: Partial<DraftItem>) =>
    setItems((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  const valid = name.trim() !== '' && items.length > 0 && items.every((i) => isValidMinutes(Number(i.minutes)))

  const save = async () => {
    try {
      await saveTemplate({
        id: template?.id,
        name,
        items: items.map((i) => ({
          kind: i.kind,
          minutes: Number(i.minutes),
          intensity: i.intensity,
          ...(i.kind === 'walk' && i.postMeal ? { postMeal: true } : {}),
          ...(i.kind === 'other' ? { countsAsAerobic: i.countsAsAerobic } : {}),
        })),
      })
      toast({ message: 'テンプレートを保存しました' })
      onDone()
    } catch (e) {
      toast({ message: `保存できませんでした: ${(e as Error).message}` })
    }
  }

  const remove = async () => {
    if (!template) return
    await deleteTemplate(template.id)
    toast({ message: `「${template.name}」を削除しました` })
    onDone()
  }

  return (
    <div className={styles.form}>
      <label className={styles.nameField}>
        <span>名前</span>
        <input className={ui.input} type="text" value={name} placeholder="例: いつものジム" onChange={(e) => setName(e.target.value)} />
      </label>

      <ol className={styles.items}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            <div className={styles.itemRow}>
              <select
                className={ui.input}
                aria-label="種別"
                value={item.kind}
                onChange={(e) => update(index, { kind: e.target.value as ActivityKind })}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABELS[k]}
                  </option>
                ))}
              </select>
              <input
                className={`${ui.input} ${styles.minutes}`}
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_MINUTES}
                aria-label="分数"
                value={item.minutes}
                onChange={(e) => update(index, { minutes: e.target.value })}
              />
              <span>分</span>
              <button
                type="button"
                className={styles.removeItem}
                aria-label="この運動を外す"
                disabled={items.length === 1}
                onClick={() => setItems((list) => list.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </div>
            <div className={ui.segment} role="group" aria-label="強度">
              {INTENSITIES.map((i) => (
                <button key={i} type="button" aria-pressed={item.intensity === i} onClick={() => update(index, { intensity: i })}>
                  {INTENSITY_LABELS[i]}
                </button>
              ))}
            </div>
            {item.kind === 'walk' && (
              <label className={ui.toggle}>
                <input type="checkbox" checked={item.postMeal} onChange={(e) => update(index, { postMeal: e.target.checked })} />
                食後ウォーキング
              </label>
            )}
            {item.kind === 'other' && (
              <label className={ui.toggle}>
                <input
                  type="checkbox"
                  checked={item.countsAsAerobic}
                  onChange={(e) => update(index, { countsAsAerobic: e.target.checked })}
                />
                有酸素に含める
              </label>
            )}
          </li>
        ))}
      </ol>

      <button
        type="button"
        className={ui.secondary}
        onClick={() =>
          setItems((list) => [...list, { kind: 'strength', minutes: '20', intensity: 'moderate', postMeal: false, countsAsAerobic: true }])
        }
      >
        ＋ 運動を追加
      </button>

      <div className={styles.actions}>
        {template && (
          <ConfirmButton confirmLabel="本当に削除" onConfirm={remove}>
            削除
          </ConfirmButton>
        )}
        <button type="button" className={ui.primary} disabled={!valid} onClick={save}>
          保存
        </button>
      </div>
    </div>
  )
}
