import { NavLink } from 'react-router'
import styles from './BottomNav.module.css'

const items = [
  { to: '/', label: 'ホーム', icon: '◎' },
  { to: '/calendar', label: 'カレンダー', icon: '▦' },
  { to: '/history', label: '履歴', icon: '≡' },
  { to: '/settings', label: '設定', icon: '⚙' },
]

export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="メイン">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) => (isActive ? `${styles.item} ${styles.active}` : styles.item)}
        >
          <span className={styles.icon} aria-hidden>
            {item.icon}
          </span>
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
