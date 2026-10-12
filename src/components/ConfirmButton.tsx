import { useEffect, useState, type ReactNode } from 'react'
import styles from './ConfirmButton.module.css'

interface ConfirmButtonProps {
  children: ReactNode
  /** 1 回目のタップ後に表示する文言 */
  confirmLabel: string
  onConfirm: () => void
  disabled?: boolean
  className?: string
}

/** 1 回目で確認表示、3 秒以内にもう一度押すと実行。危険な操作用 */
export function ConfirmButton({ children, confirmLabel, onConfirm, disabled, className }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(timer)
  }, [armed])

  return (
    <button
      type="button"
      disabled={disabled}
      className={`${styles.button} ${armed ? styles.armed : ''} ${className ?? ''}`}
      onClick={() => {
        if (armed) {
          setArmed(false)
          onConfirm()
        } else {
          setArmed(true)
        }
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  )
}
