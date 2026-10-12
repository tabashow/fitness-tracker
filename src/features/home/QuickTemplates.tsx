import { useState } from 'react'
import { useToast } from '../../components/Toast'
import { addFromTemplate, deleteWorkouts } from '../../db/workouts'
import { KIND_ICONS, KIND_LABELS } from '../../domain/labels'
import type { DateKey, Template } from '../../domain/types'
import { useTemplates } from '../../hooks/useData'
import styles from './QuickTemplates.module.css'

function describe(template: Template): string {
  return template.items.map((i) => `${KIND_LABELS[i.kind]}${i.minutes}分`).join(' + ')
}

/** 1 タップで記録するテンプレートボタン。誤タップは取り消しトーストで戻せる */
export function QuickTemplates({ today }: { today: DateKey }) {
  const templates = useTemplates()
  const toast = useToast()
  const [busy, setBusy] = useState<string | null>(null)

  const record = async (template: Template) => {
    if (busy) return
    setBusy(template.id)
    try {
      const added = await addFromTemplate(template, today)
      toast({
        message: `「${template.name}」を記録しました`,
        action: { label: '取り消し', onClick: () => void deleteWorkouts(added.map((w) => w.id)) },
      })
    } catch (e) {
      toast({ message: `保存できませんでした: ${(e as Error).message}` })
    } finally {
      setBusy(null)
    }
  }

  if (!templates?.length) return null
  return (
    <section className={styles.list} aria-label="テンプレートで記録">
      {templates.map((t) => (
        <button
          key={t.id}
          type="button"
          className={styles.button}
          disabled={busy === t.id}
          onClick={() => record(t)}
        >
          <span className={styles.icons} aria-hidden>
            {t.items.map((i) => KIND_ICONS[i.kind]).join('')}
          </span>
          <span className={styles.name}>{t.name}</span>
          <span className={styles.detail}>{describe(t)}</span>
        </button>
      ))}
    </section>
  )
}
