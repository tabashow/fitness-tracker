import type { ActivityKind, Intensity, Settings, Template, Workout } from './types'
import { isValidGoals } from './goals'
import { isValidMinutes } from './workout'

export const BACKUP_APP = 'undo-log'
export const BACKUP_SCHEMA_VERSION = 1

export interface BackupFile {
  app: typeof BACKUP_APP
  schemaVersion: number
  exportedAt: string
  workouts: Workout[]
  templates: Template[]
  settings: Settings
}

export function createBackup(
  data: { workouts: Workout[]; templates: Template[]; settings: Settings },
  now: Date = new Date(),
): BackupFile {
  return { app: BACKUP_APP, schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt: now.toISOString(), ...data }
}

const KINDS: ActivityKind[] = ['bike', 'strength', 'walk', 'other']
const INTENSITIES: Intensity[] = ['light', 'moderate', 'hard']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

function isWorkout(v: unknown): v is Workout {
  return (
    isObj(v) &&
    typeof v.id === 'string' &&
    typeof v.date === 'string' &&
    DATE_RE.test(v.date) &&
    KINDS.includes(v.kind as ActivityKind) &&
    typeof v.minutes === 'number' &&
    isValidMinutes(v.minutes) &&
    INTENSITIES.includes(v.intensity as Intensity) &&
    typeof v.postMeal === 'boolean' &&
    (v.countsAsAerobic === undefined || typeof v.countsAsAerobic === 'boolean') &&
    (v.memo === undefined || typeof v.memo === 'string') &&
    typeof v.createdAt === 'number' &&
    typeof v.updatedAt === 'number'
  )
}

function isTemplate(v: unknown): v is Template {
  return (
    isObj(v) &&
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.order === 'number' &&
    Array.isArray(v.items) &&
    v.items.every(
      (i) =>
        isObj(i) &&
        KINDS.includes(i.kind as ActivityKind) &&
        typeof i.minutes === 'number' &&
        isValidMinutes(i.minutes) &&
        INTENSITIES.includes(i.intensity as Intensity),
    )
  )
}

function isSettings(v: unknown): v is Settings {
  return (
    isObj(v) &&
    v.id === 'singleton' &&
    Array.isArray(v.goalsHistory) &&
    v.goalsHistory.length > 0 &&
    v.goalsHistory.every(
      (e) => isObj(e) && typeof e.effectiveFrom === 'string' && DATE_RE.test(e.effectiveFrom) && isObj(e.goals) && isValidGoals(e.goals as never),
    ) &&
    ['system', 'light', 'dark'].includes(v.theme as string) &&
    typeof v.reminderHour === 'number'
  )
}

export type ParseResult = { ok: true; backup: BackupFile } | { ok: false; error: string }

/** 読み込んだ JSON 文字列を検証する。1 件でも不正なら全体を拒否する（中途半端に取り込まない） */
export function parseBackup(text: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'JSON として読み込めませんでした' }
  }
  if (!isObj(data) || data.app !== BACKUP_APP) {
    return { ok: false, error: 'undo-log のバックアップファイルではありません' }
  }
  if (typeof data.schemaVersion !== 'number' || data.schemaVersion > BACKUP_SCHEMA_VERSION) {
    return { ok: false, error: 'このバージョンのアプリでは読み込めない形式です。アプリを更新してください' }
  }
  if (!Array.isArray(data.workouts) || !data.workouts.every(isWorkout)) {
    return { ok: false, error: '運動記録の形式が正しくありません' }
  }
  if (!Array.isArray(data.templates) || !data.templates.every(isTemplate)) {
    return { ok: false, error: 'テンプレートの形式が正しくありません' }
  }
  if (!isSettings(data.settings)) {
    return { ok: false, error: '設定の形式が正しくありません' }
  }
  return { ok: true, backup: data as unknown as BackupFile }
}

/**
 * 取り込む記録のうち、実際に書き込むもの。
 * 同じ ID がある場合は updatedAt が新しい方を残す（同じ端末への再読み込みでも重複しない）。
 */
export function workoutsToImport(existing: Workout[], incoming: Workout[]): Workout[] {
  const byId = new Map(existing.map((w) => [w.id, w]))
  return incoming.filter((w) => {
    const current = byId.get(w.id)
    return !current || w.updatedAt > current.updatedAt
  })
}

export function backupFileName(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `undo-log-backup-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.json`
}
