import { format } from 'date-fns'
import { useRef, useState } from 'react'
import { ConfirmButton } from '../../components/ConfirmButton'
import { useToast } from '../../components/Toast'
import ui from '../../components/ui.module.css'
import { deleteAllWorkouts, exportBackup, importBackup } from '../../db/backup'
import { backupFileName, parseBackup, type BackupFile } from '../../domain/backup'
import styles from './SettingsPage.module.css'

/** スマホでは共有シート（「ファイルに保存」など）、PC ではダウンロード */
async function saveFile(file: File) {
  const touch = window.matchMedia('(pointer: coarse)').matches
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return // ユーザーが閉じた
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function BackupSection() {
  const toast = useToast()
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<BackupFile | null>(null)

  const exportData = async () => {
    try {
      const backup = await exportBackup()
      const file = new File([JSON.stringify(backup, null, 2)], backupFileName(), { type: 'application/json' })
      await saveFile(file)
    } catch (e) {
      toast({ message: `書き出せませんでした: ${(e as Error).message}` })
    }
  }

  const pickFile = async (file: File | undefined) => {
    if (!file) return
    const result = parseBackup(await file.text())
    if (fileInput.current) fileInput.current.value = ''
    if (!result.ok) {
      toast({ message: result.error })
      return
    }
    setPending(result.backup)
  }

  const applyImport = async () => {
    if (!pending) return
    try {
      const s = await importBackup(pending)
      toast({ message: `読み込みました（追加 ${s.added}件・更新 ${s.updated}件・変更なし ${s.skipped}件）` })
    } catch (e) {
      toast({ message: `読み込めませんでした: ${(e as Error).message}` })
    } finally {
      setPending(null)
    }
  }

  const deleteAll = async () => {
    await deleteAllWorkouts()
    toast({ message: 'すべての記録を削除しました' })
  }

  return (
    <section className={ui.card}>
      <h2 className={ui.sectionTitle}>バックアップ</h2>
      <p className={ui.hint}>
        データはこの端末のブラウザ内にだけ保存され、外部には送信されません。機種変更やブラウザのデータ削除に備えて、ときどき書き出しておいてください。
      </p>
      <div className={styles.buttons}>
        <button type="button" className={ui.primary} onClick={exportData}>
          書き出す（JSON）
        </button>
        <button type="button" className={ui.secondary} onClick={() => fileInput.current?.click()}>
          読み込む
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
      </div>

      {pending && (
        <div className={styles.importConfirm} role="alertdialog" aria-label="読み込みの確認">
          <p>
            {format(new Date(pending.exportedAt), 'yyyy/M/d H:mm')} のバックアップ（記録 {pending.workouts.length}件）を読み込みます。
            記録は今のデータと統合され、テンプレートと設定はバックアップの内容に置き換わります。
          </p>
          <div className={styles.buttons}>
            <button type="button" className={ui.secondary} onClick={() => setPending(null)}>
              やめる
            </button>
            <button type="button" className={ui.primary} onClick={applyImport}>
              読み込む
            </button>
          </div>
        </div>
      )}

      <div className={styles.danger}>
        <ConfirmButton confirmLabel="本当にすべて削除" onConfirm={deleteAll}>
          すべての記録を削除
        </ConfirmButton>
        <p className={ui.hint}>テンプレートと設定は残ります。</p>
      </div>
    </section>
  )
}
