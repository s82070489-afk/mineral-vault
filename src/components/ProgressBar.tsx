import { colors } from '../theme'

export function ProgressBar({ ratio, color }: { ratio: number; color: string }) {
  const percent = Math.max(0, Math.min(1, ratio)) * 100
  return (
    <div style={{ height: 8, borderRadius: 4, background: colors.trackBg, overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, height: 8, borderRadius: 4, background: color }} />
    </div>
  )
}
