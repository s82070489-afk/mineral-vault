import type { ReactNode } from 'react'
import { Text } from '@toss/tds-mobile'
import { colors } from '../theme'

export function ScreenContainer({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: colors.background }}>
      <div style={{ height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 20px' }}>
        <Text typography="st1" fontWeight="bold">
          {title}
        </Text>
      </div>
      <div style={{ flexGrow: 1, padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}
