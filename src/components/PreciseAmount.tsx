import { colors } from '../theme'

/** 초당 채굴량처럼 아주 작은 값을 보여줄 때 쓰는 소수 자리수. 필요하면 이 값만 바꾸면 된다. */
export const DISPLAY_DECIMAL_PLACES = 8

/**
 * 고정 소수 자리(기본 8자리)로 값을 보여준다. 앞쪽의 의미 없는 0은 연하게,
 * 첫 유효숫자부터는 진하게 표시하고, 숫자가 고정폭(tabular figures)으로 나와서
 * 매 tick마다 자리가 안 흔들리게 한다.
 */
export function PreciseAmount({
  value,
  unit,
  decimalPlaces = DISPLAY_DECIMAL_PLACES,
}: {
  value: number
  unit?: string
  decimalPlaces?: number
}) {
  const fixed = value.toFixed(decimalPlaces)
  const [intPart, fracPart = ''] = fixed.split('.')
  const firstSignificantIndex = [...fracPart].findIndex((digit) => digit !== '0')
  const leadingZeros = firstSignificantIndex === -1 ? fracPart : fracPart.slice(0, firstSignificantIndex)
  const significant = firstSignificantIndex === -1 ? '' : fracPart.slice(firstSignificantIndex)

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"' }}>
      {intPart}
      {fracPart && '.'}
      <span style={{ color: colors.textSecondary, fontWeight: 400 }}>{leadingZeros}</span>
      <span style={{ fontWeight: 700 }}>{significant}</span>
      {unit}
    </span>
  )
}
