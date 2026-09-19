import { MINER, VAULT, type MineralId } from '../config/gameConfig'
import type { GameState, MineralState } from './types'

function isMaxLevel(costs: number[], level: number): boolean {
  return level - 1 >= costs.length
}

export function canUpgradeMiner(mineral: MineralState, mineralId: MineralId): boolean {
  const costs = MINER[mineralId].upgradeCost
  if (isMaxLevel(costs, mineral.minerLevel)) return false
  return mineral.vaulted >= costs[mineral.minerLevel - 1]
}

export function canUpgradeVault(mineral: MineralState, mineralId: MineralId): boolean {
  const costs = VAULT[mineralId].upgradeCost
  if (isMaxLevel(costs, mineral.vaultLevel)) return false
  return mineral.vaulted >= costs[mineral.vaultLevel - 1]
}

/** 업그레이드 비용은 해당 광물의 금고 보유량(vaulted)에서 차감한다. */
export function upgradeMiner(state: GameState, mineralId: MineralId): GameState {
  const mineral = state.minerals[mineralId]
  if (!canUpgradeMiner(mineral, mineralId)) return state
  const cost = MINER[mineralId].upgradeCost[mineral.minerLevel - 1]

  return {
    ...state,
    minerals: {
      ...state.minerals,
      [mineralId]: { ...mineral, vaulted: mineral.vaulted - cost, minerLevel: mineral.minerLevel + 1 },
    },
  }
}

export function upgradeVault(state: GameState, mineralId: MineralId): GameState {
  const mineral = state.minerals[mineralId]
  if (!canUpgradeVault(mineral, mineralId)) return state
  const cost = VAULT[mineralId].upgradeCost[mineral.vaultLevel - 1]

  return {
    ...state,
    minerals: {
      ...state.minerals,
      [mineralId]: { ...mineral, vaulted: mineral.vaulted - cost, vaultLevel: mineral.vaultLevel + 1 },
    },
  }
}
