import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import styles from './Toast.module.css'

interface ToastOptions {
  message: string
  action?: { label: string; onClick: () => void }
}

const ToastContext = createContext<(options: ToastOptions) => void>(() => {})

const DURATION_MS = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { key: number }) | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const show = useCallback((options: ToastOptions) => {
    clearTimeout(timer.current)
    setToast({ ...options, key: Date.now() })
    timer.current = setTimeout(() => setToast(null), DURATION_MS)
  }, [])

  const runAction = () => {
    clearTimeout(timer.current)
    toast?.action?.onClick()
    setToast(null)
  }

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toast && (
          <div key={toast.key} className={styles.toast}>
            <span>{toast.message}</span>
            {toast.action && (
              <button type="button" className={styles.action} onClick={runAction}>
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react/only-export-components
export function useToast() {
  return useContext(ToastContext)
}
