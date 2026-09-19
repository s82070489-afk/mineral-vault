import { MINER, VAULT, type MineralId } from '../config/gameConfig'
import type { GameState, MineralState } from './types'

function isMaxLevel(costs: number[], level: number): boolean {
  return level - 1 >= costs.length
}

/** 다음 레벨로 가는 데 필요한 비용. 이미 최대 레벨이면 null. */
export function getMinerUpgradeCost(mineralId: MineralId, minerLevel: number): number | null {
  const costs = MINER[mineralId].upgradeCost
  return isMaxLevel(costs, minerLevel) ? null : costs[minerLevel - 1]
}

export function getVaultUpgradeCost(mineralId: MineralId, vaultLevel: number): number | null {
  const costs = VAULT[mineralId].upgradeCost
  return isMaxLevel(costs, vaultLevel) ? null : costs[vaultLevel - 1]
}

export function canUpgradeMiner(mineral: MineralState, mineralId: MineralId): boolean {
  const cost = getMinerUpgradeCost(mineralId, mineral.minerLevel)
  return cost != null && mineral.vaulted >= cost
}

export function canUpgradeVault(mineral: MineralState, mineralId: MineralId): boolean {
  const cost = getVaultUpgradeCost(mineralId, mineral.vaultLevel)
  return cost != null && mineral.vaulted >= cost
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
