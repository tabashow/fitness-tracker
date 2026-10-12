import type { ActivityKind, Intensity } from './types'

export const KIND_LABELS: Record<ActivityKind, string> = {
  bike: 'エアロバイク',
  strength: '筋トレ',
  walk: 'ウォーキング',
  other: 'その他',
}

export const KIND_ICONS: Record<ActivityKind, string> = {
  bike: '🚴',
  strength: '🏋️',
  walk: '🚶',
  other: '✨',
}

export const INTENSITY_LABELS: Record<Intensity, string> = {
  light: '軽い',
  moderate: '普通',
  hard: 'きつい',
}

export const KINDS: ActivityKind[] = ['bike', 'strength', 'walk', 'other']
export const INTENSITIES: Intensity[] = ['light', 'moderate', 'hard']
export const MINUTE_PRESETS = [10, 15, 20, 30, 45, 60]
