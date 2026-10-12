import { DEFAULT_GOALS, type Settings, type Template } from './types'

/** 初回起動時に入れるテンプレート。設定画面で編集できる */
export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tpl-gym',
    name: 'いつものジム',
    items: [
      { kind: 'bike', minutes: 30, intensity: 'moderate' },
      { kind: 'strength', minutes: 20, intensity: 'moderate' },
    ],
    order: 0,
  },
  {
    id: 'tpl-post-meal-walk',
    name: '食後ウォーク',
    items: [{ kind: 'walk', minutes: 15, intensity: 'light', postMeal: true }],
    order: 1,
  },
]

export function defaultSettings(effectiveFrom: string): Settings {
  return {
    id: 'singleton',
    goalsHistory: [{ effectiveFrom, goals: DEFAULT_GOALS }],
    theme: 'system',
    reminderHour: 18,
  }
}
