import { ATTENDANCE_REWARDS } from '../config/gameConfig'
import { isLocalYesterday, isSameLocalDay, toLocalDateKey } from './date'
import type { GameState } from './types'

export function hasCheckedInToday(state: GameState, now: number): boolean {
  return state.attendance.lastCheckInAt != null && isSameLocalDay(state.attendance.lastCheckInAt, now)
}

/** 오늘 출석 체크. 이미 체크했으면 아무 변화 없이 그대로 반환한다. */
export function checkIn(state: GameState, now: number): GameState {
  if (hasCheckedInToday(state, now)) return state

  const { attendance } = state
  const isConsecutive = attendance.lastCheckInAt != null && isLocalYesterday(attendance.lastCheckInAt, now)
  const nextStreak = isConsecutive ? Math.min(7, attendance.streak + 1) : 1
  const checkInDates = isConsecutive ? [...attendance.checkInDates, toLocalDateKey(now)] : [toLocalDateKey(now)]
  const reward = ATTENDANCE_REWARDS.find((r) => r.day === nextStreak) ?? ATTENDANCE_REWARDS[ATTENDANCE_REWARDS.length - 1]
  const rewardMineral = state.minerals[reward.rewardMineral]

  return {
    ...state,
    attendance: { streak: nextStreak, lastCheckInAt: now, checkInDates },
    minerals: {
      ...state.minerals,
      [reward.rewardMineral]: { ...rewardMineral, vaulted: rewardMineral.vaulted + reward.rewardAmount },
    },
  }
}
