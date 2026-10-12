import { newId } from '../domain/id'
import type { Template, TemplateItem } from '../domain/types'
import { isValidMinutes } from '../domain/workout'
import { db } from './schema'

export function listTemplates(): Promise<Template[]> {
  return db.templates.orderBy('order').toArray()
}

function validate(name: string, items: TemplateItem[]) {
  if (!name.trim()) throw new Error('名前を入力してください')
  if (items.length === 0) throw new Error('運動を 1 つ以上追加してください')
  if (!items.every((i) => isValidMinutes(i.minutes))) throw new Error('時間は 1〜600 分で入力してください')
}

/** id がなければ末尾に追加、あれば更新 */
export async function saveTemplate(input: { id?: string; name: string; items: TemplateItem[] }): Promise<void> {
  validate(input.name, input.items)
  await db.transaction('rw', db.templates, async () => {
    const existing = input.id ? await db.templates.get(input.id) : undefined
    const order = existing?.order ?? ((await db.templates.orderBy('order').last())?.order ?? -1) + 1
    await db.templates.put({ id: existing?.id ?? newId(), name: input.name.trim(), items: input.items, order })
  })
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.templates.delete(id)
}

/** 隣のテンプレートと順番を入れ替える */
export async function moveTemplate(id: string, direction: -1 | 1): Promise<void> {
  await db.transaction('rw', db.templates, async () => {
    const list = await db.templates.orderBy('order').toArray()
    const i = list.findIndex((t) => t.id === id)
    const j = i + direction
    if (i < 0 || j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    await db.templates.bulkPut(list.map((t, order) => ({ ...t, order })))
  })
}
