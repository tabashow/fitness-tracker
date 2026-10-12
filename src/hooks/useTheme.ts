import { useEffect } from 'react'
import { useSettings } from './useData'

/** 設定のテーマを html[data-theme] に反映する。system なら OS に従う */
export function useApplyTheme() {
  const theme = useSettings()?.theme
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light' || theme === 'dark') root.dataset.theme = theme
    else delete root.dataset.theme
  }, [theme])
}
