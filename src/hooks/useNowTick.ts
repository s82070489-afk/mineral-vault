import { useEffect, useState } from 'react'

/** intervalMs마다 갱신되는 현재 시각. 화면의 "쌓이는" 실시간 연출에만 쓰고, 저장 값 계산에는 쓰지 않는다. */
export function useNowTick(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
