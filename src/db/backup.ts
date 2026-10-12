import { createBackup, workoutsToImport, type BackupFile } from '../domain/backup'
import { db } from './schema'
import { getSettings } from './settings'

export async function exportBackup(): Promise<BackupFile> {
  return db.transaction('r', db.workouts, db.templates, db.settings, async () =>
    createBackup({
      workouts: await db.workouts.toArray(),
      templates: await db.templates.orderBy('order').toArray(),
      settings: await getSettings(),
    }),
  )
}

export interface ImportSummary {
  added: number
  updated: number
  skipped: number
}

/**
 * バックアップを取り込む。記録は ID ごとにマージ（新しい方を残す）し、
 * テンプレートと設定はバックアップの内容で置き換える。
 */
export async function importBackup(backup: BackupFile): Promise<ImportSummary> {
  return db.transaction('rw', db.workouts, db.templates, db.settings, async () => {
    const existing = await db.workouts.toArray()
    const existingIds = new Set(existing.map((w) => w.id))
    const toWrite = workoutsToImport(existing, backup.workouts)
    await db.workouts.bulkPut(toWrite)
    await db.templates.clear()
    await db.templates.bulkPut(backup.templates)
    await db.settings.put(backup.settings)

    const updated = toWrite.filter((w) => existingIds.has(w.id)).length
    return { added: toWrite.length - updated, updated, skipped: backup.workouts.length - toWrite.length }
  })
}

/** 運動記録をすべて消す（テンプレートと設定は残す） */
export async function deleteAllWorkouts(): Promise<void> {
  await db.workouts.clear()
}
