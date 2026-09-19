import { MINERALS, type MineralId } from '../config/gameConfig'
import { createFreshMissions } from './missions'
import type { GameState, MineralState } from './types'

export const GAME_STATE_VERSION = 1

export function createInitialState(now: number): GameState {
  const minerals = {} as Record<MineralId, MineralState>
  for (const def of MINERALS) {
    minerals[def.id] = {
      minerLevel: 1,
      vaultLevel: 1,
      pending: 0,
      vaulted: 0,
      lastAccrualAt: now,
    }
  }

  return {
    version: GAME_STATE_VERSION,
    minerals,
    activeBoosters: [],
    bonusAccrualMsCredit: 0,
    nextCollectMultiplier: 1,
    missions: createFreshMissions(),
    missionsResetAt: now,
    attendance: { streak: 0, lastCheckInAt: null, checkInDates: [] },
  }
}
