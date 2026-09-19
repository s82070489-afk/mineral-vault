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

/** 로컬 날짜를 'YYYY-MM-DD' 키로 변환한다. */
export function toLocalDateKey(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** now가 속한 주(월요일 시작)의 월~일 7일 날짜 키를 순서대로 반환한다. */
export function getWeekDateKeys(now: number): string[] {
  const d = new Date(now)
  const dayOfWeek = d.getDay() // 0=일 ... 6=토
  const mondayOffset = (dayOfWeek + 6) % 7 // 월요일까지 며칠 전인지
  const monday = new Date(d)
  monday.setDate(d.getDate() - mondayOffset)

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    return toLocalDateKey(day.getTime())
  })
}
