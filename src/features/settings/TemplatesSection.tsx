import { useState } from 'react'
import ui from '../../components/ui.module.css'
import { moveTemplate } from '../../db/templates'
import { KIND_LABELS } from '../../domain/labels'
import type { Template } from '../../domain/types'
import { useTemplates } from '../../hooks/useData'
import styles from './SettingsPage.module.css'
import { TemplateEditorSheet } from './TemplateEditorSheet'

export function TemplatesSection() {
  const templates = useTemplates()
  const [editing, setEditing] = useState<Template | 'new' | null>(null)

  return (
    <section className={ui.card}>
      <h2 className={ui.sectionTitle}>テンプレート</h2>
      <p className={ui.hint}>ホームに表示され、1タップで記録できます。</p>
      <ul className={styles.templates}>
        {templates?.map((t, i) => (
          <li key={t.id} className={styles.template}>
            <button type="button" className={styles.templateMain} onClick={() => setEditing(t)}>
              <strong>{t.name}</strong>
              <span>{t.items.map((item) => `${KIND_LABELS[item.kind]}${item.minutes}分`).join(' + ')}</span>
            </button>
            <button
              type="button"
              className={styles.move}
              aria-label={`${t.name}を上へ`}
              disabled={i === 0}
              onClick={() => moveTemplate(t.id, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              className={styles.move}
              aria-label={`${t.name}を下へ`}
              disabled={i === templates.length - 1}
              onClick={() => moveTemplate(t.id, 1)}
            >
              ↓
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className={`${ui.secondary} ${styles.save}`} onClick={() => setEditing('new')}>
        ＋ テンプレートを追加
      </button>
      <TemplateEditorSheet template={editing} onClose={() => setEditing(null)} />
    </section>
  )
}
