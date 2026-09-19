/** 소수 1자리까지만 보여주고, .0이면 정수로 줄인다(예: 12.0 -> 12, 12.4 -> 12.4). */
export function formatAmount(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function formatMineralAmount(value: number, unit: string): string {
  return `${formatAmount(value)}${unit}`
}

/** 부스터 남은 시간 표시용("24분 12초"). */
export function formatRemainingKor(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}분 ${seconds}초`
}
