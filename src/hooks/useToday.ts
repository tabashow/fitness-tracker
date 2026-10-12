import { useEffect, useState } from 'react'
import type { DateKey } from '../domain/types'
import { toDateKey } from '../domain/week'

/** 現在時刻（1 分ごと・アプリに戻ったときに更新） */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const update = () => setNow(new Date())
    const timer = setInterval(update, 60_000)
    document.addEventListener('visibilitychange', update)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  return now
}

/** 今日の日付。アプリを開いたまま日付が変わっても追従する */
export function useToday(): DateKey {
  return toDateKey(useNow())
}
