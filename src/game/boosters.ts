import { BOOSTERS, EXTRA_ACCRUAL_BOOSTER_MS, type BoosterType } from '../config/gameConfig'
import type { GameState } from './types'

export { isBoosterActive } from './mining'

/**
 * 부스터를 획득했을 때 호출한다. 시간제 부스터는 activeBoosters에 만료 시각으로 등록되고,
 * 1회성 부스터(쌓이는 시간 늘리기 / 다음 담기 2배)는 GameState의 크레딧 필드에 즉시 반영된다.
 * 전부 "유저가 광고를 직접 선택했을 때"만 호출해야 한다(강제 광고 금지).
 */
export function grantBooster(state: GameState, type: BoosterType, now: number): GameState {
  const def = BOOSTERS.find((b) => b.type === type)
  if (!def) return state

  if (def.durationMs != null) {
    const filtered = state.activeBoosters.filter((b) => b.type !== type)
    return {
      ...state,
      activeBoosters: [...filtered, { type, expiresAt: now + def.durationMs }],
    }
  }

  if (type === 'extraAccrualTime') {
    return { ...state, bonusAccrualMsCredit: state.bonusAccrualMsCredit + EXTRA_ACCRUAL_BOOSTER_MS }
  }

  if (type === 'nextCollectX2') {
    return { ...state, nextCollectMultiplier: 2 }
  }

  return state
}

export function getActiveBoosterRemainingMs(state: GameState, type: BoosterType, now: number): number {
  const booster = state.activeBoosters.find((b) => b.type === type)
  if (!booster) return 0
  return Math.max(0, booster.expiresAt - now)
}
