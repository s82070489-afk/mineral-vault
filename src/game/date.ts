/** 로컬 타임존 기준으로 같은 날인지 비교한다. */
export function isSameLocalDay(a: number, b: number): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

/** prev가 now 기준 '어제'인지(연속 출석 판정용). */
export function isLocalYesterday(prev: number, now: number): boolean {
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  return isSameLocalDay(prev, yesterday.getTime())
}
