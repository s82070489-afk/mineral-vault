import type { CSSProperties, ReactNode } from 'react'
import { colors } from '../theme'

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: colors.card,
        borderRadius: 20,
        padding: 20,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
