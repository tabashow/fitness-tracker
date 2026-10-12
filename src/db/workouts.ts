import type { DateKey, Template, Workout } from '../domain/types'
import { createWorkout, updateWorkout, workoutsFromTemplate, type WorkoutInput, type WorkoutPatch } from '../domain/workout'
import { db } from './schema'

export async function addWorkout(input: WorkoutInput): Promise<Workout> {
  const workout = createWorkout(input)
  await db.workouts.add(workout)
  return workout
}

export async function addFromTemplate(template: Template, date: DateKey): Promise<Workout[]> {
  const workouts = workoutsFromTemplate(template, date)
  await db.workouts.bulkAdd(workouts)
  return workouts
}

export async function deleteWorkouts(ids: string[]): Promise<void> {
  await db.workouts.bulkDelete(ids)
}

export function workoutsOn(date: DateKey): Promise<Workout[]> {
  return db.workouts.where('date').equals(date).sortBy('createdAt')
}

export function workoutsBetween(from: DateKey, to: DateKey): Promise<Workout[]> {
  return db.workouts.where('date').between(from, to, true, true).toArray()
}

export async function editWorkout(id: string, patch: WorkoutPatch): Promise<Workout> {
  return db.transaction('rw', db.workouts, async () => {
    const current = await db.workouts.get(id)
    if (!current) throw new Error('記録が見つかりません')
    const updated = updateWorkout(current, patch)
    await db.workouts.put(updated)
    return updated
  })
}

export function allWorkouts(): Promise<Workout[]> {
  return db.workouts.toArray()
}

/** 日付の新しい順（同じ日は記録した順） */
export async function workoutsNewestFirst(): Promise<Workout[]> {
  const all = await db.workouts.toArray()
  return all.sort((a, b) => b.date.localeCompare(a.date) || a.createdAt - b.createdAt)
}
